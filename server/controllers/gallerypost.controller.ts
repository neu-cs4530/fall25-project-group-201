import express, { Response } from 'express';
import {
  CreateGalleryPostRequest,
  // DatabaseGalleryPost,
  FakeSOSocket,
  // GalleryPostResponse,
} from '../types/types';
import { createGalleryPost, getAllGalleryPosts } from '../services/gallerypost.service';

const galleryPostController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const getAllGalleryPostsRoute = async (_req: express.Request, res: Response): Promise<void> => {
    try {
      const galleryPosts = await getAllGalleryPosts();

      if ('error' in galleryPosts) {
        throw new Error(galleryPosts.error);
      }

      res.json(galleryPosts);
    } catch (err: unknown) {
      res.status(500).send(`Error retrieving gallery posts: ${(err as Error).message}`);
    }
  };

  const createGalleryPostRoute = async (
    req: CreateGalleryPostRequest,
    res: Response,
  ): Promise<void> => {
    const { title, description, author, model, postedAt } = req.body;

    try {
      const savedGalleryPost = await createGalleryPost({
        title,
        description,
        author,
        model,
        postDateTime: postedAt,
      });

      if ('error' in savedGalleryPost) {
        throw new Error(savedGalleryPost.error);
      }

      // todo: socket emit here

      res.json(savedGalleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error creating a gallery post: ${(err as Error).message}`);
    }
  };

  router.get('/getAllGalleryPosts', getAllGalleryPostsRoute);
  router.post('/create', createGalleryPostRoute);

  return router;
};

export default galleryPostController;
