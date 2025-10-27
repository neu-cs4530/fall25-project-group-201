import express, { Response, Request } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { addMedia } from '../services/media.service';
import { Media, FakeSOSocket } from '../types/types';

const upload = multer({ dest: './uploads/tmp/' }); // temporary storage

const mediaController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const addMediaRoute = async (req: Request, res: Response) => {
    try {
      // Wrap Multer in the route
      upload.single('file')(req, res, async (err: any) => {
        if (err) {
          return res.status(500).send(`Upload error: ${err.message}`);
        }

        const file = req.file;
        const { filepathLocation } = req.body;

        if (!file) {
          throw new Error('No file uploaded');
        }

        const fileBuffer = fs.readFileSync(file.path);

        const media: Media = {
          filepathLocation,
          fileBuffer,
          fileSize: file.size,
          fileType: file.mimetype,
        };

        const newMedia = await addMedia(media);
        res.status(200).json(newMedia);
      });
    } catch (err: unknown) {
      res.status(500).send(`Error when creating collection: ${(err as Error).message}`);
    }
  };

  router.post('/create', addMediaRoute);

  return router;
};

export default mediaController;
