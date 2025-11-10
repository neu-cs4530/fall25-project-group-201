import { DatabaseGalleryPost, GalleryPost } from '../types/types';
import api from './config';

const GALLERY_API_URL = `/api/gallery`;

const addGalleryPost = async (q: GalleryPost): Promise<DatabaseGalleryPost> => {
  const res = await api.post(`${GALLERY_API_URL}/create`, q);

  if (res.status !== 200) {
    throw new Error('Error while creating a new question');
  }

  return res.data;
};

const getGalleryPosts = async (): Promise<DatabaseGalleryPost[]> => {
  const res = await api.get(`${GALLERY_API_URL}/getAllGalleryPosts`);

  if (res.status !== 200) {
    throw new Error('Error while getting gallery posts');
  }

  return res.data;
};

const getGalleryPost = async (galleryPostID: string): Promise<DatabaseGalleryPost> => {
  const res = await api.get(`${GALLERY_API_URL}/getGalleryPost/${galleryPostID}`);

  if (res.status !== 200) {
    throw new Error('Error while getting gallery post');
  }

  return res.data;
};

const deleteGalleryPost = async (galleryPostId: string, username: string): Promise<DatabaseGalleryPost> => {
  const res = await api.delete(`${GALLERY_API_URL}/delete/${galleryPostId}?${username}`);

  if (res.status !== 200) {
    throw new Error('Error while deleting gallery post');
  }

  return res.data;
};

export { addGalleryPost, getGalleryPosts, getGalleryPost, deleteGalleryPost};
