import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sqs from '@aws-cdk/aws-sqs';
import * as events from '@aws-cdk/aws-events';
import * as event_sources from '@aws-cdk/aws-lambda-event-sources';
import * as eventbridge from '@aws-cdk/aws-eventbridge';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
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
    func.addEventSource(new event_sources.SqsEventSource(queue));

    // Create EventBridge Pipe to connect DynamoDB Streams to SQS
    const pipeRole = new iam.Role(this, 'PipeRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });

    table.grantStreamRead(pipeRole);
    queue.grantSendMessages(pipeRole);

    new eventbridge.CfnPipe(this, 'MyPipe', {
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
