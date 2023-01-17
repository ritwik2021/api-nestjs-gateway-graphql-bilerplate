import { Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

/**
 * SecretsManager client
 */
const client = new AWS.SecretsManager({
  region: process.env.AWS_REGION,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY
});

/**
 * AsyncLoadSecretsFromAWS
 * @description Asynchronously loads secrets from AWS Secrets Manager and stores them in the process environment.
 * @returns {Promise<void>}
 * @author Ritwik Rohitashwa
 */
export async function AsyncLoadSecretsFromAWS(): Promise<void> {
  try {
    const secretName = process.env.AWS_SECRET_NAME;
    const { SecretString } = await client.getSecretValue({ SecretId: secretName }).promise();
    const parsedSecrets = JSON.parse(SecretString);

    // Store secrets to process env
    Object.keys(parsedSecrets).forEach(([key, value]) => {
      process.env[key] = value;
    });
  } catch (error) {
    Logger.error(error.message, 'ERROR: AWS-SECRET-MANAGER');
  }
}
