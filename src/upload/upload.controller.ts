import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { UploadService } from './upload.service';

const ALLOWED_DECK_COVER_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const ALLOWED_DECK_COVER_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]);

@ApiTags('Uploads')
@ApiBearerAuth()
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 401, type: ErrorResponseDto })
@UseGuards(JwtGuard)
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('deck-cover')
  @ApiOperation({
    summary: 'Upload deck cover image',
    description: 'Accepts JPG, PNG and WEBP images up to 5MB.',
    operationId: 'uploadDeckCover',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JPG, PNG or WEBP image up to 5MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded file URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: '/uploads/deck-covers/example.png' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/deck-covers',
        filename: (_, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const extension = extname(file.originalname).toLowerCase();

        if (
          ALLOWED_DECK_COVER_MIME_TYPES.has(file.mimetype) &&
          ALLOWED_DECK_COVER_EXTENSIONS.has(extension)
        ) {
          cb(null, true);
          return;
        }

        cb(
          new BadRequestException(
            'Deck cover must be a JPG, PNG or WEBP image',
          ),
          false,
        );
      },
    }),
  )
  uploadDeckCover(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file, 'deck-covers');
  }

  // @Post('avatar')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads/avatars',
  //       filename: (_, file, cb) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         cb(null, uniqueSuffix + extname(file.originalname));
  //       },
  //     }),
  //     limits: { fileSize: 5 * 1024 * 1024 },
  //   }),
  // )
  // uploadAvatar(@UploadedFile() file: Express.Multer.File) {
  //   return this.uploadService.saveFile(file, 'avatars');
  // }
}
