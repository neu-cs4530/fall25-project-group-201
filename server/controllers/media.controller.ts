import express, { Response, Request } from 'express';
import multer from 'multer';
import mediaService from '../services/media.service';
import { Media, FakeSOSocket } from '../types/types';

const upload = multer({ storage: multer.memoryStorage() }); // memory storage

const mediaController = (socket: FakeSOSocket) => {
  const router = express.Router();

  router.post('/create', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { user, filepathLocation } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'File missing' });
      } else if (!user) {
        return res.status(400).json({ error: 'User missing' });
      } else if (!filepathLocation) {
        return res.status(400).json({ error: 'Filepath missing' });
      }

      const media: Media = {
        filepathLocation,
        fileBuffer: file.buffer,
        user,
      };

      const newMedia = await mediaService.addMedia(media);

      if ('error' in newMedia) {
        throw new Error(newMedia.error);
      }

      res.status(200).json(newMedia);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
};

export default mediaController;
