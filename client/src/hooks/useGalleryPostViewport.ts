import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { DatabaseGalleryPost } from '../types/types';
import { getGalleryPost } from '../services/galleryService';

/**
 * useGalleryComponentPage is a custom hook that supports the gallery 3D viewport.
 * Primarily responsible for fetching the related gallery post.
 */
const useGalleryPostViewport = () => {
  const { galleryPostID } = useParams();
  const [err, setErr] = useState<string | null>(null);
  const [galleryPost, setGalleryPost] = useState<DatabaseGalleryPost>();

  /**
   * Fetches the gallery post with 3D media.
   * Handles if the gallery post was not found and other fetch errors.
   */
  const fetchGalleryPost = async () => {
    try {
      if (!galleryPostID) {
        setErr('Gallery Post ID is undefined');
        return;
      }

      const resGalleryPost = await getGalleryPost(galleryPostID);
      setGalleryPost(resGalleryPost);

      if (!resGalleryPost) {
        setErr('Gallery post not found');
      }
    } catch (err: unknown) {
      setErr('Failed to fetch gallery post');
    }
  };

  return {
    galleryPost,
    err,
    fetchGalleryPost,
  };
};

export default useGalleryPostViewport;
