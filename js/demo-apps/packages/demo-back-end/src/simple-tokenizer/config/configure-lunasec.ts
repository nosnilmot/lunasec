import { fromIni } from '@aws-sdk/credential-provider-ini';
import { SimpleTokenizerBackend } from '@lunasec/node-sdk';

if (!process.env.SECURE_FRAME_URL) {
  throw new Error('Secure frame url env var is not set');
}

export const simpleTokenizerBackend = new SimpleTokenizerBackend({
  awsRegion: 'us-west-2',
  s3Bucket: process.env.CIPHERTEXT_S3_BUCKET || 'YOU MUST SPECIFY A BUCKET',
  getAwsCredentials: () => {
    return Promise.resolve(fromIni());
  },
});