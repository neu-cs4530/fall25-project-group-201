import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getGalleryPosts,
  incrementGalleryPostViews,
  incrementGalleryPostDownloads,
  toggleGalleryPostLikes,
  deleteGalleryPost,
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
    } catch {
      setError('Failed to load post.');
    }
  }, [postId]);

  useEffect(() => {
    if (!postId || !user.username) return;

    const sessionKey = `viewed_${postId}_${user.username}`;
    const incrementAndFetch = async () => {
      try {
        // Only increment if not viewed in this session
        if (!sessionStorage.getItem(sessionKey)) {
          await incrementGalleryPostViews(postId, user.username);
          sessionStorage.setItem(sessionKey, 'true');
        }
      } catch (err) {
        setError('Failed to increment views.');
      } finally {
        await fetchPost();
      }
    };

    incrementAndFetch();
  }, [fetchPost, postId, user.username]);

  const incrementDownloads = async () => {
    if (!post) return;
    try {
      await incrementGalleryPostDownloads(post._id.toString(), user.username);
      await fetchPost();
      window.open(post.media, '_blank');
    } catch {
      setError('Failed to increment downloads.');
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    try {
      await toggleGalleryPostLikes(post._id.toString(), user.username);
      await fetchPost();
    } catch {
      setError('Failed to toggle like.');
    }
  };

  const removePost = async () => {
    if (!post) return;
    try {
      await deleteGalleryPost(post._id.toString(), user.username);
    } catch {
      setError('Failed to delete post.');
    }
  };

  return {
    post,
    error,
    incrementDownloads,
    toggleLike,
    removePost,
  };
};

export default useGalleryPostPage;
