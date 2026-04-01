import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

type ErrorWithMessage = {
  message?: string;
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  saveFile(file: Express.Multer.File, type: 'deck-covers' | 'avatars') {
    if (!file) {
      this.logger.warn(`No file provided!`);
      throw new Error('No file provided');
    }

    let url: string;

    // В будущем можно добавить логику (обработка, CDN, генерация превью и т.д.)
    if (type === 'deck-covers') {
      url = `/uploads/deck-covers/${file.filename}`;
    } else if (type === 'avatars') {
      url = `/uploads/avatars/${file.filename}`;
    } else {
      this.logger.error(`Unknown upload type: ${String(type)}`);
      throw new Error('Unknown upload type');
    }

    this.logger.log(`File uploaded [${type}]: ${file.filename} → ${url}`);
    return { url };
  }

  async deleteFile(urlOrPath: string) {
    if (!urlOrPath) return;
    try {
      // Получаем имя файла
      const fileName = urlOrPath.split('/').pop();
      // Если имя файла не определено, то ничего не делаем
      if (!fileName) return;
      // Собираем абсолютный путь (проверь свой путь!)
      const filePath = join(process.cwd(), 'uploads', 'deck-covers', fileName);

      await fs.unlink(filePath);
      this.logger.log(`Deleted file: ${filePath}`);
    } catch (err: unknown) {
      const error = err as ErrorWithMessage;
      // Если файл уже удалён — это не ошибка, просто логируем
      this.logger.warn(
        `Could not delete file: ${urlOrPath} (${error.message ?? 'unknown error'})`,
      );
    }
  }
}
