import { DatabaseGalleryPost, GalleryPost, GalleryPostResponse } from '@fake-stack-overflow/shared';
import GalleryPostModel from '../models/gallerypost.model';
import { promises as fs } from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

/**
 * Fetches all gallery posts from the database.
 *
 * @returns {Promise<DatabaseGalleryPost[] | { error: string }>} Array of gallery posts or an error object
 */
export const getAllGalleryPosts = async (): Promise<DatabaseGalleryPost[] | { error: string }> => {
  try {
    const posts = await GalleryPostModel.find({});

    if (!posts) {
      throw new Error('Failed to get gallery posts');
    }

    return posts;
  } catch (err) {
    return { error: (err as Error).message };
  }
};

/**
 * Creates a new gallery post in the database.
 *
 * @param {GalleryPost} galleryPost - The gallery post data to create
 * @returns {Promise<GalleryPostResponse>} The created gallery post or an error object
 */
export const createGalleryPost = async (galleryPost: GalleryPost): Promise<GalleryPostResponse> => {
  try {
    const newGalleryPost = await GalleryPostModel.create(galleryPost);

    if (!newGalleryPost) {
      throw new Error('Failed to create gallery post');
    }

    return newGalleryPost;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * Retrieves a gallery post by its ID.
 *
 * @param {string} id - The ID of the gallery post
 * @returns {Promise<GalleryPostResponse>} The gallery post or an error object
 */
export const getGalleryPostById = async (id: string): Promise<GalleryPostResponse> => {
  try {
    const galleryPost = await GalleryPostModel.findById(id);

    if (!galleryPost) {
      throw new Error('Failed to get gallery post');
    }

    return galleryPost;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * Deletes a gallery post by ID and username, including local media and thumbnail files.
 *
 * @param {string} id - The ID of the gallery post
 * @param {string} username - The username of the post owner
 * @returns {Promise<GalleryPostResponse>} The deleted gallery post or an error object
 */
export const deleteGalleryPost = async (
  id: string,
  username: string,
): Promise<GalleryPostResponse> => {
  try {
    // Find the gallery post
    const galleryPost = await GalleryPostModel.findOne({
      _id: id,
      user: username,
    });

    if (!galleryPost) {
      throw new Error(`Gallery post not found`);
    }

    const projectRoot = path.resolve(__dirname, '../../');

    if (galleryPost.media && !/^https?:\/\//i.test(galleryPost.media)) {
      const filePath = path.join(projectRoot, 'client', 'public', galleryPost.media);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        throw new Error(`Failed to delete media: ${filePath}`);
      }
    }

    if (galleryPost.thumbnailMedia) {
      const thumbnailfilePath = path.join(
        projectRoot,
        'client',
        'public',
        galleryPost.thumbnailMedia,
      );
      try {
        await fs.unlink(thumbnailfilePath);
      } catch (err) {
        throw new Error(`Failed to delete thumbnailMedia: ${thumbnailfilePath}`);
      }
    }

    // Delete gallery post
    const deletedGalleryPost = await GalleryPostModel.findOneAndDelete({
      _id: id,
      user: username,
    });

    if (!deletedGalleryPost) {
      throw new Error('Failed to delete gallery post after deleting media');
    }

    return deletedGalleryPost;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * Fetches a gallery post by ID and increments its views array
 * with the provided username if it hasn't been counted yet.
 *
 * @param {string} id - The ID of the gallery post
 * @param {string} username - The username to add to views
 * @returns {Promise<DatabaseGalleryPost | { error: string }>} Updated gallery post or error object
 */
export const fetchAndIncrementGalleryPostViewsById = async (
  id: string,
  username: string,
): Promise<DatabaseGalleryPost | { error: string }> => {
  try {
    const objectId = new ObjectId(id);
    const updatedPost = await GalleryPostModel.findOneAndUpdate(
      { _id: objectId },
      { $addToSet: { views: username } },
      { new: true },
    );

    if (!updatedPost) {
      throw new Error('Gallery post not found');
    }

    return updatedPost;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { error: 'Error when fetching and updating gallery post views' };
  }
};

/**
 * Fetches a gallery post by ID and increments its downloads count by 1.
 *
 * @param {string} id - The ID of the gallery post
 * @returns {Promise<DatabaseGalleryPost | { error: string }>} Updated gallery post or error object
 */
export const fetchAndIncrementGalleryPostDownloadsById = async (
  id: string,
): Promise<DatabaseGalleryPost | { error: string }> => {
  try {
    const objectId = new ObjectId(id);
    const updatedPost = await GalleryPostModel.findOneAndUpdate(
      { _id: objectId },
      { $inc: { downloads: 1 } },
      { new: true },
    );

    if (!updatedPost) {
      throw new Error('Gallery post not found');
    }

    return updatedPost;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { error: 'Error when fetching and updating gallery post downloads' };
  }
};

/**
 * Toggles a username in the likes array of a gallery post.
 * Adds username if not liked, removes if already liked.
 *
 * @param {string} id - The ID of the gallery post
 * @param {string} username - The username to toggle in likes
 * @returns {Promise<DatabaseGalleryPost | { error: string }>} Updated gallery post or error object
 */
export const toggleGalleryPostLikeById = async (
  id: string,
  username: string,
): Promise<DatabaseGalleryPost | { error: string }> => {
  try {
    const objectId = new ObjectId(id);
    const post = await GalleryPostModel.findById(objectId);

    if (!post) throw new Error('Gallery post not found');

    const alreadyLiked = post.likes.includes(username);

    const updatedPost = await GalleryPostModel.findByIdAndUpdate(
      objectId,
      alreadyLiked ? { $pull: { likes: username } } : { $addToSet: { likes: username } },
      { new: true },
    );

    if (!updatedPost) throw new Error('Failed to update likes');

    return updatedPost;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { error: 'Error when toggling gallery post like' };
  }
};
