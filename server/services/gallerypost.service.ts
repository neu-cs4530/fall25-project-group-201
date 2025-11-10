import { DatabaseGalleryPost, GalleryPost, GalleryPostResponse } from '@fake-stack-overflow/shared';
import GalleryPostModel from '../models/gallerypost.model';
import { promises as fs } from 'fs';
import path from 'path';

export const getAllGalleryPosts = async (): Promise<DatabaseGalleryPost[] | { error: string }> => {
  try {
    const posts = await GalleryPostModel.find({});
    return posts;
  } catch (err) {
    return { error: (err as Error).message };
  }
};

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
 * @param id
 * @returns
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

export const deleteGalleryPost = async (
  id: string,
  username: string
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

    // Get full filepath
    const projectRoot = path.resolve(__dirname, '../../');
    const filePath = path.join(projectRoot, 'client', 'public', galleryPost.media);

    // Delete media
    if (galleryPost.media) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        throw new Error(`Failed to delete media: ${filePath}`);
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