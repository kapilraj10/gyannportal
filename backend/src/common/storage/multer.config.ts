import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads'),
);

try {
  mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // dir already exists or is not creatable — upload will fail loudly later
}

export const multerStorage = diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}-${safeName}`);
  },
});

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Block active/executable content that could be served inline and lead to
// stored XSS (HTML/SVG/JS) or code execution if the upload dir is ever served.
const BLOCKED_MIME_TYPES = new Set([
  'text/html',
  'application/xhtml+xml',
  'image/svg+xml',
  'application/javascript',
  'text/javascript',
  'application/x-msdownload',
  'application/x-msdos-program',
]);

const BLOCKED_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.xhtml',
  '.svg',
  '.js',
  '.mjs',
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
]);

export const multerOptions: MulterOptions = {
  storage: multerStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      BLOCKED_MIME_TYPES.has(file.mimetype) ||
      BLOCKED_EXTENSIONS.has(extension)
    ) {
      cb(new BadRequestException('This file type is not allowed'), false);
      return;
    }

    cb(null, true);
  },
};