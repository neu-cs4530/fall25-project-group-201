import { DatabaseGalleryPost, GalleryPost, GalleryPostResponse } from '@fake-stack-overflow/shared';
import GalleryPostModel from '../models/gallerypost.model';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Gets all gallery posts.
 *
 * @returns A Promise resolving to an array of gallery post documents or an error object
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
 * Creates a gallery post.
 *
 * @param galleryPost - the gallery post object to be created
 * @returns A Promise resolving to the gallery post document or an error object
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
 * Retrieves a gallery post by id.
 *
 * @param id of the gallery post
 * @returns A Promise resolving to the gallery post document or an error object
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
 * Deletes a gallery post.
 *
 * @param id of the gallery post
 * @param username that authored the gallery post
 * @returns A Promise resolving to the gallery post document or an error object
 */
export const deleteGalleryPost = async (
  id: string,
  username: string,
): Promise<GalleryPostResponse> => {
  try {
    // Find the gallery post
    const galleryPost = await GalleryPostModel.findOne({
      _id: id,
      username: username,
    });

    if (!galleryPost) {
      throw new Error('Gallery post not found');
    }

    const projectRoot = path.resolve(__dirname, '../../');

    // Only delete if media is local (not an external embed)
    if (galleryPost.media && !/^https?:\/\//i.test(galleryPost.media)) {
      // Get full filepath for media
      const filePath = path.join(projectRoot, 'client', 'public', galleryPost.media);

      // Delete media
      try {
        await fs.unlink(filePath);
      } catch (err) {
        throw new Error(`Failed to delete media: ${filePath}`);
      }
    }

    if (galleryPost.thumbnailMedia) {
      // Get full filepath for media
      const thumbnailfilePath = path.join(
        projectRoot,
        'client',
        'public',
        galleryPost.thumbnailMedia,
      );

      // Delete thumbnailMedia
      if (galleryPost.thumbnailMedia) {
        try {
          await fs.unlink(thumbnailfilePath);
        } catch (err) {
          throw new Error(`Failed to delete thumbnail media: ${thumbnailfilePath}`);
        }
      }
    }

    // Delete gallery post
    const deletedGalleryPost = await GalleryPostModel.findOneAndDelete({
      _id: id,
      username: username,
    });

    if (!deletedGalleryPost) {
      throw new Error('Failed to delete gallery post after deleting media');
    }

    return deletedGalleryPost;
  } catch (error) {
    return { error: (error as Error).message };
  }
};
