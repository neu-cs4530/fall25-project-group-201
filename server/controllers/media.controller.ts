import express, { Response } from 'express';
import {
  CreateMediaRequest,
  FakeSOSocket,
} from '../types/types';
import {
  addMedia
} from '../services/media.service';

const mediaController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const addMediaRoute = async (
    req: CreateMediaRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { filepathLocation } = req.body;
      const media = await addMedia({
        filepathLocation
      });

      if ('error' in media) {
        throw new Error(media.error as string);
      }

      res.status(200).json(media);
    } catch (err: unknown) {
      res.status(500).send(`Error when creating collection: ${(err as Error).message}`);
    }
  };

  router.post('/create', addMediaRoute);

  return router;
};

export default mediaController;
