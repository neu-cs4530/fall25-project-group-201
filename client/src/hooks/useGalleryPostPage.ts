import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getGalleryPosts,
  incrementGalleryPostViews,
  incrementGalleryPostDownloads,
  toggleGalleryPostLikes,
  deleteGalleryPost
} from '../services/galleryService';
import useUserContext from './useUserContext';
import { DatabaseGalleryPost } from '../types/types';

const useGalleryPostPage = () => {
  const { postId } = useParams();
  const { user } = useUserContext();
  
  const [post, setPost] = useState<DatabaseGalleryPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
        const all = await getGalleryPosts();
        const found = all.find(p => p._id.toString() === postId);
        if (!found) {
        setError('Post not found');
        return;
        }
        setPost(found);

        // increment views once here
        await incrementGalleryPostViews(found._id.toString(), user.username);

    } catch {
        setError('Failed to load post.');
    }
    }, [postId, user.username]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const incrementViews = async () => {
    if (!post) return;
    await incrementGalleryPostViews(post._id.toString(), user.username);
    fetchPost();
  };

  const incrementDownloads = async () => {
    if (!post) return;
    await incrementGalleryPostDownloads(post._id.toString(), user.username);
    fetchPost();
  };

  const toggleLike = async () => {
    if (!post) return;
    await toggleGalleryPostLikes(post._id.toString(), user.username);
    fetchPost();
  };

  const removePost = async () => {
    if (!post) return;
    await deleteGalleryPost(post._id.toString(), user.username);
  };

  return {
    post,
    error,
    incrementViews,
    incrementDownloads,
    toggleLike,
    removePost
  };
};

export default useGalleryPostPage;
