import express, { Response, Request } from 'express';
import multer from 'multer';
import mediaService from '../services/media.service';
import { Media, FakeSOSocket } from '../types/types';

// const allowedMimeTypes = [
//   'image/gif',
//   'image/jpeg',
//   'image/png',
//   'audio/mpeg',
//   'video/mp4',
//   'model/gltf-binary',
//   'application/octet-stream',
// ];

// const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`Invalid file type: ${file.mimetype}`));
//   }
// };

const upload = multer({
  storage: multer.memoryStorage(),
  // fileFilter,
  // limits: {
  //   fileSize: 50 * 1024 * 1024, // 50MB
  // }
}); // memory storage

const mediaController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Creates a media document
   */
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

      // const uniqueFilepath = await mediaService.getUniqueFilepath(user, filepathLocation);

      const media: Media = {
        filepathLocation, // replace with uniqueFilepath if get working
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

  /**
   * Deletes a media document, given filepath of the media
   */
  router.delete('/delete/:filepathLocation?', async (req: Request, res: Response) => {
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
