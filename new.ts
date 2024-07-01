import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as pipes from 'aws-cdk-lib/aws-eventbridge-pipes';

export class EventBridgePipesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, 'MyTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    // Create an SQS queue
    const queue = new sqs.Queue(this, 'MyQueue');

    // Create a Lambda function
    const fn = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // Grant Lambda permissions to read from the SQS queue
    queue.grantConsumeMessages(fn);
    fn.addEventSourceMapping('SQSEventSource', {
      eventSourceArn: queue.queueArn,
    });

    // Create IAM role for EventBridge Pipe
    const pipeRole = new iam.Role(this, 'PipeRole', {
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
    });
    table.grantStreamRead(pipeRole);
    queue.grantSendMessages(pipeRole);

    // Create a pipe
    new pipes.CfnPipe(this, 'MyPipe', {
      roleArn: pipeRole.roleArn,
      source: table.tableStreamArn!,
      target: queue.queueArn,
      filter: {
        pattern: '{"eventSource": ["aws:dynamodb"]}',
      },
    });
  }
}
