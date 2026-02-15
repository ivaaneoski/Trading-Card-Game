import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('request-upload')
  @UseGuards(AuthGuard('jwt'))
  async requestPresignedUrl(@Body() body: { fileName: string; contentType: string }, @Req() req: any) {
    try {
      return await this.uploadsService.generatePresignedUrl(req.user.userId, body.fileName, body.contentType);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('confirm-upload')
  @UseGuards(AuthGuard('jwt'))
  async confirmUpload(@Body() body: { key: string }, @Req() req: any) {
    try {
      return await this.uploadsService.validateAndApproveUpload(req.user.userId, body.key);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
