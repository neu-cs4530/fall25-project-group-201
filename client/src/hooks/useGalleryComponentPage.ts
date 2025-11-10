import { useCallback, useState, useEffect } from 'react';
import { DatabaseGalleryPost } from '../types/types';
import { getGalleryPosts, deleteGalleryPost } from '../services/galleryService';
import useUserContext from './useUserContext';
import { useNavigate } from 'react-router-dom';

const useGalleryComponentPage = (communityID: string) => {
  const { user: currentUser } = useUserContext();
  const [filteredGalleryPosts, setFilteredGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handle3DMediaClick = (galleryPostID: string) => {
    navigate(`/galleryPostViewport/${galleryPostID}`);
  };

  // Check if the current user is the author of the currentGalleryPost being displayed
  const checkIfAuthorOfCurrentGalleryPost = (currentGalleryPost: DatabaseGalleryPost) => {
    setIsAuthor(currentGalleryPost.user === currentUser.username);
  };

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
