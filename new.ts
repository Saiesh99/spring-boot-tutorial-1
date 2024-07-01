import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as eventbridge from 'aws-cdk-lib/aws-events';
import * as eventbridgePipes from 'aws-cdk-lib/aws-eventbridge-pipes';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table with streams enabled
    const table = new dynamodb.Table(this, 'MyTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    // Create SQS queue
    const queue = new sqs.Queue(this, 'MyQueue', {
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    // Create Lambda function
    const func = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    });

    // Grant Lambda permission to read from SQS queue
    queue.grantConsumeMessages(func);

    // Add SQS event source to Lambda
    func.addEventSource(new lambda.EventSourceMapping(this, 'SqsEventSource', {
      eventSourceArn: queue.queueArn,
      batchSize: 10,
      enabled: true,
    }));

    // Create IAM role for EventBridge Pipe
    const pipeRole = new iam.Role(this, 'PipeRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });

    table.grantStreamRead(pipeRole);
    queue.grantSendMessages(pipeRole);

    // Create EventBridge Pipe to connect DynamoDB Streams to SQS
    new eventbridgePipes.CfnPipe(this, 'MyPipe', {
      roleArn: pipeRole.roleArn,
      source: table.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: 'LATEST',
        },
      },
      target: queue.queueArn,
      targetParameters: {
        sqsQueueParameters: {
          messageGroupId: 'default', // Required for FIFO queues
        },
      },
    });
  }
}
