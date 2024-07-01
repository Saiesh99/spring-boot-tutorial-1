import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as pipes from 'aws-cdk-lib/aws-eventbridge-pipes';

export class EventBridgePipesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, 'MyTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // Create an SQS queue
    const queue = new sqs.Queue(this, 'MyQueue');

    // Create a Lambda function
    const fn = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // Create a pipe
    new pipes.CfnPipe(this, 'MyPipe', {
      source: table.tableArn,
      target: queue.queueArn,
      enrichment: {
        enrichmentArn: fn.functionArn,
        inputTemplate: '{"detail-type": <DETAIL_TYPE>, "detail": <DETAIL>}',
      },
      filter: {
        pattern: '{"source": ["aws.dynamodb"]}',
      },
    });

    // Grant necessary permissions
    table.grantStreamRead(fn);
    queue.grantSendMessages(fn);
  }
}
