import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class UploadsService {
  private logger = new Logger('UploadsService');
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });

  async generatePresignedUrl(userId: string, fileName: string, contentType: string) {
    // Validate content-type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      throw new Error('Unsupported content-type. Allowed: PNG, JPEG, WebP');
    }

    const key = `cards/${userId}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${fileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'tcg-game-cards',
      Key: key,
      ContentType: contentType,
      Expires: 300, // 5 minutes
    };

    try {
      const url = this.s3.getSignedUrl('putObject', params);
      this.logger.log(`Presigned URL generated for ${userId}: ${key}`);
      return { uploadUrl: url, key, expiresIn: 300 };
    } catch (e) {
      this.logger.error(`Failed to generate presigned URL: ${e.message}`);
      throw new Error('Upload configuration error');
    }
  }

  async validateAndApproveUpload(userId: string, key: string) {
    try {
      // Check if object exists in S3
      const headParams = {
        Bucket: process.env.AWS_S3_BUCKET || 'tcg-game-cards',
        Key: key,
      };

      await this.s3.headObject(headParams).promise();

      // In production, add ClamAV or similar virus scanning here
      // For now, just verify size and basic metadata
      const obj = await this.s3.getObject(headParams).promise();
      if (!obj.ContentLength || obj.ContentLength > 5 * 1024 * 1024) {
        throw new Error('File too large (max 5MB)');
      }

      const imageUrl = `https://${process.env.AWS_S3_BUCKET || 'tcg-game-cards'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      this.logger.log(`Upload validated for ${userId}: ${key}`);
      return { imageUrl, key };
    } catch (e) {
      this.logger.error(`Upload validation failed: ${e.message}`);
      throw new Error('Upload validation failed');
    }
  }
}
