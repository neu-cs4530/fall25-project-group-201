import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserContext from './useUserContext';
import {
  getGalleryPosts,
  deleteGalleryPost,
  incrementGalleryPostViews,
  incrementGalleryPostDownloads,
  toggleGalleryPostLikes,
} from '../services/galleryService';
import { DatabaseGalleryPost } from '../types/types';

type SortType = 'newest' | 'oldest' | 'highestRated' | 'mostViewed' | 'mostDownloaded';
type MediaType = 'all' | 'glb' | 'video' | 'image' | 'embed';

/**
 * Custom hook for managing gallery posts in a community page.
 *
 * Provides filtering, sorting, pagination, and post interactions (like, download, delete).
 *
 * @param {string} communityID - The ID of the community whose gallery posts should be loaded
 * @returns {{
 *   filteredGalleryPosts: DatabaseGalleryPost[];
 *   visibleItems: DatabaseGalleryPost[];
 *   error: string | null;
 *   isAuthor: (post: DatabaseGalleryPost) => boolean;
 *   sortType: SortType;
 *   setSortType: React.Dispatch<React.SetStateAction<SortType>>;
 *   selectedType: MediaType;
 *   setSelectedType: React.Dispatch<React.SetStateAction<MediaType>>;
 *   nextPage: () => void;
 *   prevPage: () => void;
 *   itemsPerPage: number;
 *   startIndex: number;
 *   handle3DMediaClick: (id: string) => void;
 *   handleDeleteGalleryPost: (post: DatabaseGalleryPost) => Promise<void>;
 *   handleIncrementDownloads: (post: DatabaseGalleryPost) => Promise<void>;
 *   handleToggleLikes: (post: DatabaseGalleryPost) => Promise<void>;
 *   refreshGallery: () => Promise<void>;
 * }}
 */
const useGalleryComponentPage = (communityID: string) => {
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  const [allGalleryPosts, setAllGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>('newest');
  const [selectedType, setSelectedType] = useState<MediaType>('all');
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading ] = useState<boolean>(true);

  /**
   * Responsive grid adjustment
   */
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1600) setItemsPerPage(9);
      else if (width >= 1200) setItemsPerPage(6);
      else if (width >= 900) setItemsPerPage(3);
      else if (width >= 600) setItemsPerPage(2);
      else setItemsPerPage(1);
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  /**
   * Fetch all gallery posts for the community and filter by communityID.
   */
  const fetchGalleryPosts = useCallback(async () => {
    setLoading(true)
    try {
      const resGalleryPosts = await getGalleryPosts();
      const filtered = resGalleryPosts.filter(p => p.community === communityID);
      setAllGalleryPosts(filtered);
      setError(null);
      setLoading(false)
    } catch {
      setError('Failed to fetch gallery posts.');
      setLoading(true)
    }
  }, [communityID]);

  useEffect(() => {
    fetchGalleryPosts();
  }, [fetchGalleryPosts]);

  /**
   * Extract YouTube video ID from a URL
   *
   * @param {string} url - the youtube video url
   */
  const getYouTubeVideoId = (url: string) =>
    url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] ?? null;

  /**
   * Extract Vimeo video ID from a URL
   *
   * @param {string} url - the vimeo video url
   */
  const getVimeoVideoId = (url: string) => url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;

  const filteredGalleryPosts = useMemo(() => {
    const filtered = allGalleryPosts.filter(post => {
      if (!post.media) return false;
      const ext = post.media.split('.').pop()?.toLowerCase();
      const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
      const isImage = ['jpg', 'jpeg', 'png'].includes(ext || '');
      const is3D = ext === 'glb';
      const youTubeId = getYouTubeVideoId(post.media);
      const vimeoId = getVimeoVideoId(post.media);

      switch (selectedType) {
        case 'glb':
          return is3D;
        case 'video':
          return isVideo;
        case 'image':
          return isImage;
        case 'embed':
          return !!youTubeId || !!vimeoId;
        default:
          return true;
      }
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        case 'oldest':
          return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
        case 'highestRated':
          return b.likes.length - a.likes.length;
        case 'mostViewed':
          return b.views - a.views;
        case 'mostDownloaded':
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    return sorted;
  }, [allGalleryPosts, selectedType, sortType]);

  const visibleItems = useMemo(
    () => filteredGalleryPosts.slice(startIndex, startIndex + itemsPerPage),
    [filteredGalleryPosts, startIndex, itemsPerPage],
  );

  /**
   * Go to next page of carousel
   */
  const nextPage = () =>
    setStartIndex(prev =>
      prev + itemsPerPage >= filteredGalleryPosts.length ? 0 : prev + itemsPerPage,
    );

  /**
   * Go to previous page of carousel
   */
  const prevPage = () =>
    setStartIndex(prev =>
      prev - itemsPerPage < 0
        ? Math.max(filteredGalleryPosts.length - itemsPerPage, 0)
        : prev - itemsPerPage,
    );

  /**
   * Delete a gallery post
   * @param {DatabaseGalleryPost} post - The post to delete
   */
  const handleDeleteGalleryPost = async (post: DatabaseGalleryPost) => {
    try {
      await deleteGalleryPost(post._id.toString(), post.user);
      await fetchGalleryPosts();
    } catch {
      setError('Failed to delete post.');
    }
  };

  /**
   * Increment view count and open media
   * @param {DatabaseGalleryPost} post - Post being viewed
   */
  const handleIncrementViews = async (post: DatabaseGalleryPost) => {
    try {
      await incrementGalleryPostViews(post._id.toString(), currentUser.username);
      await fetchGalleryPosts();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to increment views', err);
    }
  };

  /**
   * Increment download count and open media
   * @param {DatabaseGalleryPost} post - Post being downloaded
   */
  const handleIncrementDownloads = async (post: DatabaseGalleryPost) => {
    try {
      await incrementGalleryPostDownloads(post._id.toString(), currentUser.username);
      window.open(post.media, '_blank');
      await fetchGalleryPosts();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  /**
   * Toggle like for a post
   * @param {DatabaseGalleryPost} post - Post to like/unlike
   */
  const handleToggleLikes = async (post: DatabaseGalleryPost) => {
    try {
      await toggleGalleryPostLikes(post._id.toString(), currentUser.username);
      await fetchGalleryPosts(); // refresh posts after toggle
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  /**
   * Navigate to 3D media view page
   */
  const handle3DMediaClick = (id: string) => navigate(`/galleryPostViewport/${id}`);

  const refreshGallery = fetchGalleryPosts;

  return {
    filteredGalleryPosts,
    visibleItems,
    error,
    isAuthor: (post: DatabaseGalleryPost) => post.user === currentUser.username,
    sortType,
    setSortType,
    selectedType,
    setSelectedType,
    nextPage,
    prevPage,
    itemsPerPage,
    startIndex,
    handle3DMediaClick,
    handleDeleteGalleryPost,
    handleIncrementViews,
    handleIncrementDownloads,
    handleToggleLikes,
    refreshGallery,
    loading,
  };
};

export default useGalleryComponentPage;
