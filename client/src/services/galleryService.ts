import { DatabaseGalleryPost, GalleryPost } from '../types/types';
import api from './config';

const GALLERY_API_URL = `/api/gallery`;

/**
 * Creates a new gallery post on the server.
 *
 * @param {GalleryPost} q - The gallery post object to create
 * @returns {Promise<DatabaseGalleryPost>} The created gallery post including its database ID
 * @throws Will throw an error if the server responds with a non-200 status
 */
const addGalleryPost = async (q: GalleryPost): Promise<DatabaseGalleryPost> => {
  const res = await api.post(`${GALLERY_API_URL}/create`, q);

  if (res.status !== 200) {
    throw new Error('Error while creating a new question');
  }

  return res.data;
};

/**
 * Retrieves all gallery posts from the server.
 *
 * @returns {Promise<DatabaseGalleryPost[]>} Array of all gallery posts
 * @throws Will throw an error if the server responds with a non-200 status
 */
const getGalleryPosts = async (): Promise<DatabaseGalleryPost[]> => {
  const res = await api.get(`${GALLERY_API_URL}/getAllGalleryPosts`);

  if (res.status !== 200) {
    throw new Error('Error while getting gallery posts');
  }

  return res.data;
};

/**
 * Retrieves a single gallery post by its ID.
 *
 * @param {string} galleryPostID - The ID of the gallery post to retrieve
 * @returns {Promise<DatabaseGalleryPost>} The requested gallery post
 * @throws Will throw an error if the server responds with a non-200 status
 */
const getGalleryPost = async (galleryPostID: string): Promise<DatabaseGalleryPost> => {
  const res = await api.get(`${GALLERY_API_URL}/getGalleryPost/${galleryPostID}`);

  if (res.status !== 200) {
    throw new Error('Error while getting gallery post');
  }

  return res.data;
};

/**
 * Deletes a gallery post by its ID and the username of the author.
 *
 * @param {string} galleryPostId - The ID of the gallery post to delete
 * @param {string} username - The username of the post author
 * @returns {Promise<DatabaseGalleryPost>} The deleted gallery post
 * @throws Will throw an error if the server responds with a non-200 status
 */
const deleteGalleryPost = async (
  galleryPostId: string,
  username: string,
): Promise<DatabaseGalleryPost> => {
  const res = await api.delete(`${GALLERY_API_URL}/delete/${galleryPostId}?username=${username}`);

  if (res.status !== 200) {
    throw new Error('Error while deleting gallery post');
  }

  return res.data;
};

/**
 * Increments the view count for a gallery post by a specific user.
 *
 * @param {string} galleryPostID - The ID of the gallery post
 * @param {string} username - The username of the user viewing the post
 * @returns {Promise<any>} Server response JSON
 * @throws Will throw an error if the request fails
 */
const incrementGalleryPostViews = async (galleryPostID: string, username: string) => {
  const res = await fetch(`${GALLERY_API_URL}/incrementViews/${galleryPostID}/${username}`, {
    method: 'POST',
  });

  if (!res.ok) throw new Error('Failed to increment views');
  return res.json();
};

/**
 * Increments the download count for a gallery post.
 *
 * @param {string} galleryPostID - The ID of the gallery post
 * @returns {Promise<any>} Server response JSON
 * @throws Will throw an error if the request fails
 */
const incrementGalleryPostDownloads = async (galleryPostID: string, username: string) => {
  const res = await fetch(`${GALLERY_API_URL}/incrementDownloads/${galleryPostID}/${username}`, {
    method: 'POST',
  });

  if (!res.ok) throw new Error('Failed to increment downloads');
  return res.json();
};

/**
 * Toggles a like for a gallery post by a specific user.
 *
 * @param {string} galleryPostID - The ID of the gallery post
 * @param {string} username - The username of the user toggling the like
 * @returns {Promise<any>} Server response JSON
 * @throws Will throw an error if the request fails
 */
const toggleGalleryPostLikes = async (galleryPostID: string, username: string) => {
  const res = await fetch(`${GALLERY_API_URL}/toggleLikes/${galleryPostID}/${username}`, {
    method: 'POST',
  });

  if (!res.ok) throw new Error('Failed to toggle likes');
  return res.json();
};

const getGalleryPostMedia = async (
  galleryPostID: string,
): Promise<string> => {
  const res = await api.get(`${GALLERY_API_URL}/downloadGalleryPostMedia/${galleryPostID}`);

  if (res.status !== 200) {
    throw new Error('Error when downloading gallery post media');
  }

  return res.data;
}

export {
  addGalleryPost,
  getGalleryPosts,
  getGalleryPost,
  deleteGalleryPost,
  incrementGalleryPostViews,
  incrementGalleryPostDownloads,
  toggleGalleryPostLikes,
  getGalleryPostMedia,
};
