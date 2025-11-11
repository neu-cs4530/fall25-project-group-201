import { DatabaseGalleryPost, GalleryPost } from '../types/types';
import api from './config';

const GALLERY_API_URL = `/api/gallery`;


/**
 * Creates a gallery post.
 *
 * @param q - The gallery post object to create.
 */
const addGalleryPost = async (q: GalleryPost): Promise<DatabaseGalleryPost> => {
  const res = await api.post(`${GALLERY_API_URL}/create`, q);

  if (res.status !== 200) {
    throw new Error('Error while creating a new question');
  }

  return res.data;
};

/**
 * Gets all gallery posts.
 */
const getGalleryPosts = async (): Promise<DatabaseGalleryPost[]> => {
  const res = await api.get(`${GALLERY_API_URL}/getAllGalleryPosts`);

  if (res.status !== 200) {
    throw new Error('Error while getting gallery posts');
  }

  return res.data;
};

/**
 * Gets a gallery post.
 * 
 * @param galleryPostID - The ID of the gallery post.
 */
const getGalleryPost = async (galleryPostID: string): Promise<DatabaseGalleryPost> => {
  const res = await api.get(`${GALLERY_API_URL}/getGalleryPost/${galleryPostID}`);

  if (res.status !== 200) {
    throw new Error('Error while getting gallery post');
  }

  return res.data;
};

/**
 * Deletes a gallery post.
 * 
 * @param galleryPostID - The ID of the gallery post.
 * @param username - The author of the gallery post.
 */
const deleteGalleryPost = async (
  galleryPostId: string,
  username: string,
): Promise<DatabaseGalleryPost> => {
  const res = await api.delete(`${GALLERY_API_URL}/delete/${galleryPostId}?${username}`);

  if (res.status !== 200) {
    throw new Error('Error while deleting gallery post');
  }

  return res.data;
};

export { addGalleryPost, getGalleryPosts, getGalleryPost, deleteGalleryPost };
