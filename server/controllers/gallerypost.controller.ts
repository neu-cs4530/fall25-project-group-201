import express, { Response } from 'express';
import {
  CreateGalleryPostRequest,
  GalleryPostRequest,
  // DatabaseGalleryPost,
  FakeSOSocket,
  GalleryPost,
  // GalleryPostResponse,
} from '../types/types';
import {
  createGalleryPost,
  getAllGalleryPosts,
  getGalleryPostById,
  deleteGalleryPost,
} from '../services/gallerypost.service';

/**
 * This controller handles gallery post related routes.
 * @param socket The socket instance to emit events.
 * @returns {express.Router} The router object containing the gallery post routes.
 * @throws {Error} Throws an error if the gallery post operations fail.
 */
const galleryPostController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Gets all gallery posts
   *
   * @param req - The request object
   * @param res - The response object used to send back the result
   * @returns {Promise<void>} - A promise that resolves when the response has been sent
   */
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

  /**
   * Creates a gallery post.
   *
   * @param req - The request object containing a create gallery post request.
   * @param res - The response object used to send back the result
   * @returns {Promise<void>} - A promise that resolves when the response has been sent
   */
  const createGalleryPostRoute = async (
    req: CreateGalleryPostRequest,
    res: Response,
  ): Promise<void> => {
    const galleryPost: GalleryPost = req.body;

    try {
      const savedGalleryPost = await createGalleryPost({
        ...galleryPost,
      });

      if ('error' in savedGalleryPost) {
        throw new Error(savedGalleryPost.error);
      }

      res.json(savedGalleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error creating a gallery post: ${(err as Error).message}`);
    }
  };

  /**
   * Gets a gallery post based on ID.
   *
   * @param req - The request object containing the galleryPostID
   * @param res - The response object used to send back the result
   * @returns {Promise<void>} - A promise that resolves when the response has been sent
   */
  const getGalleryPostRoute = async (_req: express.Request, res: Response): Promise<void> => {
    try {
      const { galleryPostID } = _req.params;
      const galleryPost = await getGalleryPostById(galleryPostID);

      if ('error' in galleryPost) {
        throw new Error(galleryPost.error);
      }

      res.json(galleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error retrieving gallery post: ${(err as Error).message}`);
    }
  };

  /**
   * Gets a gallery post based on ID and username.
   *
   * @param req - The request object containing the galleryPostID and username
   * @param res - The response object used to send back the result
   * @returns {Promise<void>} - A promise that resolves when the response has been sent
   */
  const deleteGalleryPostRoute = async (_req: GalleryPostRequest, res: Response): Promise<void> => {
    try {
      const { galleryPostId } = _req.params;
      const { username } = _req.query;

      const galleryPost = await deleteGalleryPost(galleryPostId, username);

      if ('error' in galleryPost) {
        throw new Error(galleryPost.error);
      }

      res.json(galleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error deleting gallery post: ${(err as Error).message}`);
    }
  };

  // Registering routes
  router.get('/getAllGalleryPosts', getAllGalleryPostsRoute);
  router.get('/getGalleryPost/:galleryPostID', getGalleryPostRoute);
  router.post('/create', createGalleryPostRoute);
  router.delete('/delete/:galleryPostId', deleteGalleryPostRoute);

  return router;
};

export default galleryPostController;
