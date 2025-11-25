import express, { Response, Request } from 'express';
import multer from 'multer';
import mediaService from '../services/media.service';
import { Media, FakeSOSocket } from '../types/types';
import path from 'path';
import fs from 'fs';

const STORAGE_PATH = 'public/userData';

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const user = req.body.user; // Should be available now
      // console.log('User:', req.body.user);

      if (!user) {
        // console.error('User not found in req.body');
        return cb(new Error('User is required'), '');
      }

      const userDir = `${STORAGE_PATH}/${user}`;

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      cb(null, userDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  }),
}); // memory storage

const mediaController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Creates a media document
   */
  router.post('/create', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { user } = req.body;

      // console.log('req file:', file);
      // console.log('req user:', user);

      if (!file) {
        return res.status(400).json({ error: 'File missing' });
      } else if (!user) {
        return res.status(400).json({ error: 'User missing' });
        // } else if (!filepathLocation) {
        //   return res.status(400).json({ error: 'Filepath missing' });
      } else if (!req.file?.path) {
        return res.status(400).json({ error: 'Path missing' });
      }

      const replacedPath = req.file.path.replaceAll('\\', '/');
      // console.log('req.file.path replaced:', replacedPath);

      const media: Media = {
        filepathLocation: replacedPath,
        filepathLocationClient: `${process.env.SERVER_URL}/userData/${user}/${file.filename}`,
        // fileBuffer: file.buffer,
        user,
      };

      // console.log('saved for client filepath:', media.filepathLocationClient);

      const newMedia = await mediaService.addMedia(media);

      if ('error' in newMedia) {
        throw new Error(newMedia.error);
      }

      res.status(200).json(newMedia);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /**
   * Deletes a media document, given filepath of the media
   */
  router.delete('/delete/:filepathLocation', async (req: Request, res: Response) => {
    try {
      const { filepathLocation } = req.params;

      if (!filepathLocation) {
        return res.status(400).json({ error: 'Filepath missing' });
      }

      const deleted = await mediaService.deleteMedia(filepathLocation);

      if ('error' in deleted) {
        throw new Error(deleted.error);
      }

      res.status(200).json(deleted);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
};

export default mediaController;
