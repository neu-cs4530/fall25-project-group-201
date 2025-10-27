import express, { Response, Request } from 'express';
import multer from 'multer';
import { addMedia } from '../services/media.service';
import { Media, FakeSOSocket } from '../types/types';

const upload = multer({ storage: multer.memoryStorage() }); // memory storage

const mediaController = (socket: FakeSOSocket) => {
  const router = express.Router();

  router.post('/create', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { filepathLocation } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const media: Media = {
        filepathLocation,
        fileBuffer: file.buffer,
        fileSize: file.size,
        fileType: file.mimetype,
      };

      const newMedia = await addMedia(media);
      res.status(200).json(newMedia);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
};

export default mediaController;
