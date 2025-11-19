import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGalleryPosts,
  incrementGalleryPostViews,
  incrementGalleryPostDownloads,
  toggleGalleryPostLikes,
  deleteGalleryPost,
} from '../services/galleryService';
import { deleteMedia } from '../services/mediaService';
import useUserContext from './useUserContext';
import { DatabaseGalleryPost } from '../types/types';

/**
 * Custom hook for managing a single gallery post page.
 *
 * Fetches a gallery post by ID, handles incrementing views and downloads,
 * toggling likes, and deleting the post.
 *
 * @returns {Object} An object containing:
 *   - `post`: The current gallery post, or null if not loaded.
 *   - `error`: Any error message encountered during operations.
 *   - `incrementDownloads`: Function to increment download count and open the media.
 *   - `toggleLike`: Function to toggle the user's like on the post.
 *   - `removePost`: Function to delete the current post.
 */
const useGalleryPostPage = () => {
  const { postId } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [post, setPost] = useState<DatabaseGalleryPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the gallery post by ID from the server.
   * Sets the `post` state or an error if the post is not found.
   */
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

  /**
   * Effect to increment post views once per session and fetch the post.
   */
  useEffect(() => {
    if (!postId || !user.username) return;

    const sessionKey = `viewed_${postId}_${user.username}`;
    const incrementAndFetch = async () => {
      try {
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

  /**
   * Increment download count for the post and open the media in a new tab.
   */
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

  /**
   * Toggle the current user's like on the post.
   */
  const toggleLike = async () => {
    if (!post) return;
    try {
      await toggleGalleryPostLikes(post._id.toString(), user.username);
      await fetchPost();
    } catch {
      setError('Failed to toggle like.');
    }
  };

  /**
   * Delete the current post.
   */
  const removePost = async () => {
    if (!post) return;

    // Delete media only if it is a media path not a media url (embed)
    if (post.media.startsWith('/userData/')) {
      try {
        await deleteMedia(post.media);
      } catch {
        setError('Failed to delete media.');
      }
    }

    if (post.thumbnailMedia) {
      try {
        await deleteMedia(post.thumbnailMedia);
      } catch {
        setError('Failed to delete thumbanail media.');
      }
    }

    try {
      await deleteGalleryPost(post._id.toString(), user.username);
      navigate(`/communities/${post.community}`);
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
