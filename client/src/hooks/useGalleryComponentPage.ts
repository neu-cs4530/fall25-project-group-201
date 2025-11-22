import { useState, useEffect, useCallback, useMemo } from 'react';
import useUserContext from './useUserContext';
import {
  getGalleryPosts,
  deleteGalleryPost,
  incrementGalleryPostViews,
  incrementGalleryPostDownloads,
  toggleGalleryPostLikes,
} from '../services/galleryService';
import { DatabaseGalleryPost } from '../types/types';

/**
 * Types for sorting gallery posts
 */
export type SortType = 'newest' | 'oldest' | 'highestRated' | 'mostViewed' | 'mostDownloaded';

/**
 * Types for filtering media type
 */
export type MediaType = 'all' | 'glb' | 'video' | 'image' | 'embed';

/**
 * Allowed tag names for posts
 */
export type Tag =
  | 'software_engineering'
  | 'fullstack'
  | 'frontend'
  | 'backend'
  | 'computer graphics'
  | '3d_art'
  | 'modeling'
  | 'texturing'
  | 'rigging'
  | 'animation'
  | 'graphic_design'
  | 'illustration'
  | 'motion_graphics'
  | 'concept_art';

/**
 * Type for category dropdown
 */
export type CategoryType = 'all' | Tag;

/**
 * Custom hook for managing gallery page state
 *
 * @param {string} communityID - ID of the community to fetch posts for
 */
const useGalleryComponentPage = (communityID: string) => {
  const { user: currentUser } = useUserContext();

  const [allGalleryPosts, setAllGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>('newest');
  const [selectedType, setSelectedType] = useState<MediaType>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Adjust number of items per page responsively based on window width
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
   * Fetch all gallery posts for the current community
   */
  const fetchGalleryPosts = useCallback(async () => {
    setLoading(true);
    try {
      const posts = await getGalleryPosts();
      setAllGalleryPosts(posts.filter(p => p.community === communityID));
      setError(null);
      setLoading(false);
    } catch {
      setError('Failed to fetch gallery posts.');
      setLoading(true);
    }
  }, [communityID]);

  useEffect(() => {
    fetchGalleryPosts();
  }, [fetchGalleryPosts]);

  /**
   * Compute all unique tags for the category dropdown
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<Tag>();
    allGalleryPosts.forEach(p => p.tags?.forEach(t => tagSet.add(t as Tag)));
    return Array.from(tagSet);
  }, [allGalleryPosts]);

  /**
   * Extract YouTube video ID from URL
   * @param {string} url - YouTube URL
   * @returns {string | null} video ID
   */
  const getYouTubeVideoId = (url: string) =>
    url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] ?? null;

  /**
   * Extract Vimeo video ID from URL
   * @param {string} url - Vimeo URL
   * @returns {string | null} video ID
   */
  const getVimeoVideoId = (url: string) => url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;

  /**
   * Filtered and sorted posts based on type, category, search, and sort
   */
  const filteredGalleryPosts = useMemo(() => {
    let filtered = allGalleryPosts;

    filtered = filtered.filter(post => {
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

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.tags?.includes(selectedCategory));
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        const titleMatch = post.title?.toLowerCase().includes(query);
        const descMatch = post.description?.toLowerCase().includes(query);
        const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || descMatch || tagsMatch;
      });
    }

    return [...filtered].sort((a, b) => {
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
  }, [allGalleryPosts, selectedType, selectedCategory, sortType, searchQuery]);

  /**
   * Current visible items based on pagination
   */
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

  /*
   * Check if the current user is the author of a post
   */
  const isAuthor = (post: DatabaseGalleryPost) => post.user === currentUser.username;

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
      setError('Failed to increment views');
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
      setError('Failed to increment downloads');
    }
  };

  /**
   * Toggle like for a post
   * @param {DatabaseGalleryPost} post - Post to like/unlike
   */
  const handleToggleLikes = async (post: DatabaseGalleryPost) => {
    try {
      await toggleGalleryPostLikes(post._id.toString(), currentUser.username);
      await fetchGalleryPosts();
    } catch (err) {
      setError('Failed to toggle likes');
    }
  };

  /*
   * Reset all filters to default
   */
  const resetFilters = () => {
    setSortType('newest');
    setSelectedType('all');
    setSelectedCategory('all');
    setStartIndex(0);
  };

  return {
    filteredGalleryPosts,
    visibleItems,
    error,
    isAuthor,
    sortType,
    setSortType,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    allTags,
    nextPage,
    prevPage,
    itemsPerPage,
    startIndex,
    handleDeleteGalleryPost,
    handleIncrementViews,
    handleIncrementDownloads,
    handleToggleLikes,
    loading,
    refreshGallery: fetchGalleryPosts,
    resetFilters,
    searchQuery,
    setSearchQuery,
  };
};

export default useGalleryComponentPage;
