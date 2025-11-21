import express, { Response } from 'express';
import {
  CreateGalleryPostRequest,
  GalleryPostRequest,
  FakeSOSocket,
  GalleryPost,
} from '../types/types';
import {
  createGalleryPost,
  getAllGalleryPosts,
  getGalleryPostById,
  deleteGalleryPost,
  fetchAndIncrementGalleryPostDownloadsById,
  toggleGalleryPostLikeById,
  fetchAndIncrementGalleryPostViewsById,
} from '../services/gallerypost.service';

/**
 * Controller for handling all gallery post related routes.
 *
 * @param {FakeSOSocket} socket - The socket instance for real-time updates
 * @returns {express.Router} An Express router with gallery post routes
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
    const { tags, link, mediaSize } = req.body;

    if (!tags || !Array.isArray(tags)) {
      res.status(400).send('Tags must be provided as an array.');
      return;
    }

    if (!mediaSize) {
      res.status(400).send('Media size must be provided.');
      return;
    }

    const galleryPost: GalleryPost = {
      ...req.body,
      views: 0,
      downloads: 0,
      likes: [],
      tags,
      link: link ?? '',       // always include link as string
      mediaSize,             // required
    };

    try {
      const savedGalleryPost = await createGalleryPost(galleryPost);

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

  /**
   * Increments the view count of a gallery post by a specific user.
   */
  const incrementGalleryPostViewsRoute = async (
    req: express.Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { galleryPostID } = req.params;
      const updatedGalleryPost = await fetchAndIncrementGalleryPostViewsById(galleryPostID);

      if ('error' in updatedGalleryPost) {
        throw new Error(updatedGalleryPost.error);
      }

      res.json(updatedGalleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error incrementing gallery post views: ${(err as Error).message}`);
    }
  };

  /**
   * Increments the download count of a gallery post.
   */
  const incrementGalleryPostDownloadsRoute = async (
    req: express.Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { galleryPostID } = req.params;
      const updatedGalleryPost = await fetchAndIncrementGalleryPostDownloadsById(galleryPostID);

      if ('error' in updatedGalleryPost) {
        throw new Error(updatedGalleryPost.error);
      }

      res.json(updatedGalleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error incrementing gallery post downloads: ${(err as Error).message}`);
    }
  };

  /**
   * Toggles a like for a gallery post by a specific user.
   */
  const toggleGalleryPostLikesRoute = async (req: express.Request, res: Response) => {
    try {
      const { galleryPostID, username } = req.params;
      const updatedGalleryPost = await toggleGalleryPostLikeById(galleryPostID, username);

      if ('error' in updatedGalleryPost) {
        throw new Error(updatedGalleryPost.error);
      }

      res.json(updatedGalleryPost);
    } catch (err: unknown) {
      res.status(500).send(`Error toggling gallery post like: ${(err as Error).message}`);
    }
  };

  // Register routes
  router.get('/getAllGalleryPosts', getAllGalleryPostsRoute);
  router.get('/getGalleryPost/:galleryPostID', getGalleryPostRoute);
  router.post('/create', createGalleryPostRoute);
  router.delete('/delete/:galleryPostId', deleteGalleryPostRoute);
  router.post('/incrementViews/:galleryPostID/:username', incrementGalleryPostViewsRoute);
  router.post('/incrementDownloads/:galleryPostID/:username', incrementGalleryPostDownloadsRoute);
  router.post('/toggleLikes/:galleryPostID/:username', toggleGalleryPostLikesRoute);

  return router;
};

export default galleryPostController;
