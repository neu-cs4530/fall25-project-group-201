import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { DatabaseGalleryPost } from '../types/types';
import { getGalleryPost } from '../services/galleryService';

const useGalleryPostViewport = () => {
  const { galleryPostID } = useParams();
  const [err, setErr] = useState<string | null>(null);
  const [galleryPost, setGalleryPost] = useState<DatabaseGalleryPost>();

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
