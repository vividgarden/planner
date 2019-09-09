import * as aws from "aws-sdk";

const localDynamodb: aws.DynamoDB.DocumentClient = new aws.DynamoDB.DocumentClient({
  region: process.env.region,
  convertEmptyValues: true,
  endpoint: `http://localhost:${process.env.localDynamoPort}`
});
const dynamodb: aws.DynamoDB.DocumentClient = new aws.DynamoDB.DocumentClient({
  convertEmptyValues: true,
  region: process.env.region
});

const getDynamoClient = (): aws.DynamoDB.DocumentClient => {
   return process.env.IS_OFFLINE === 'true' ? localDynamodb : dynamodb;
}

const DynamoClient = getDynamoClient();
export default DynamoClient;