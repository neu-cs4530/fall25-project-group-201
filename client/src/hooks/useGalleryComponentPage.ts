import { useCallback, useState, useEffect } from 'react';
import { DatabaseGalleryPost } from '../types/types';
import { getGalleryPosts, deleteGalleryPost } from '../services/galleryService';
import useUserContext from './useUserContext';
import { useNavigate } from 'react-router-dom';

/**
 * useGalleryComponentPage is a custom hook that supports the gallery component.
 * It handles logic for fetching gallery posts by community Id, deleting gallery posts,
 * and navigation to the 3D viewport if the post contains 3D media
 * @param communityID that the gallery component belongs to
 */
const useGalleryComponentPage = (communityID: string) => {
  const { user: currentUser } = useUserContext();
  const [filteredGalleryPosts, setFilteredGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Fetches all gallery posts and filters them by communityId
   */
  const fetchGalleryPosts = useCallback(async () => {
    try {
      const resGalleryPosts = await getGalleryPosts();
      const filteredPosts = resGalleryPosts.filter(post => post.community === communityID);
      setFilteredGalleryPosts(filteredPosts);

      if (!filteredPosts.length) {
        setError('No gallery posts found for this community');
      } else {
        setError(null);
      }
    } catch (err: unknown) {
      setError('Failed to fetch gallery posts for this community');
    }
  }, [communityID]);

  useEffect(() => {
    fetchGalleryPosts();
  }, [fetchGalleryPosts]);

  /**
   * Allows navigation to the galleryPostViewport if the post contains 3D media
   */
  const handle3DMediaClick = (galleryPostID: string) => {
    navigate(`/galleryPostViewport/${galleryPostID}`);
  };

  /**
   * Checks if the current user is the author of the currentGalleryPost being displayed
   */
  const checkIfAuthorOfCurrentGalleryPost = (currentGalleryPost: DatabaseGalleryPost) => {
    setIsAuthor(currentGalleryPost.user === currentUser.username);
  };

  /**
   * Handles deletion of a gallery post.
   */
  const handleDeleteGalleryPost = async (currentGalleryPost: DatabaseGalleryPost) => {
    try {
      await deleteGalleryPost(currentGalleryPost._id.toString(), currentGalleryPost.user);
      await fetchGalleryPosts(); // wait for fetch to complete
    } catch (err) {
      setError('Failed to delete gallery post');
    }
  };

  return {
    filteredGalleryPosts,
    error,
    handle3DMediaClick,
    checkIfAuthorOfCurrentGalleryPost,
    isAuthor,
    handleDeleteGalleryPost,
  };
};

export default useGalleryComponentPage;
