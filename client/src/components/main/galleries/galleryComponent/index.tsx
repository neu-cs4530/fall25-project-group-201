import { useState, useEffect } from 'react';
import { Trash2, Heart, X, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';
import useGalleryComponentPage from '../../../../hooks/useGalleryComponentPage';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';
import useUserContext from '../../../../hooks/useUserContext';
import ThreeViewport from '../../threeViewport';
import { useNavigate } from 'react-router-dom';

/**
 * Props for the GalleryComponent.
 */
type GalleryComponentProps = {
  communityID: string;
};

/**
 * Component to display a community's gallery with gallery posts
 * @returns A React component that includes:
 * - Clickable gallery posts that are represented by their media/thumbnailMedia
 * - Gallery posts can be 3D models (.glb files), images, videos or embeds
 * - Arrows are available to see more gallery posts if there are more than 4 posts in the community
 * - When clicked, gallery posts show more information about the post (author, title, description, postedAt)
 * - When clicked, if the user is the author of the gallery post, they can delete it by clicking on the trash icon
 * - When clicked, if a glb file, a button is available to view the 3D model in the 3D viewport
 */
const GalleryComponent: React.FC<GalleryComponentProps> = ({ communityID }) => {
  const {
    filteredGalleryPosts,
    error,
    isAuthor,
    handleDeleteGalleryPost,
    handleIncrementViews,
    handleIncrementDownloads,
    handleToggleLikes,
    refreshGallery,
  } = useGalleryComponentPage(communityID);

  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<DatabaseGalleryPost | null>(null);
  const [sortType, setSortType] = useState<
    'newest' | 'oldest' | 'highestRated' | 'mostViewed' | 'mostDownloaded'
  >('newest');
  const [selectedType, setSelectedType] = useState<'all' | 'glb' | 'video' | 'image' | 'embed'>(
    'all',
  );
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [startIndex, setStartIndex] = useState(0);

  /**
   * Updates items per page
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
   * Extracts YouTube video ID from a URL
   *
   * @param {string} url - url path to embedded youtuve video
   */
  const getYouTubeVideoId = (url: string) =>
    url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] ?? null;

  /**
   * Extract Vimeo video ID from a URL
   *
   * @param {string} url - url path to embedded vimeo video
   */
  const getVimeoVideoId = (url: string) => url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;

  /**
   * Filter posts by selected media type
   */
  const filteredByType = filteredGalleryPosts.filter(post => {
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

  /**
   * Sort posts by selected sort type
   */
  const sortedPosts = [...filteredByType].sort((a, b) => {
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

  const visibleItems = sortedPosts.slice(startIndex, startIndex + itemsPerPage);

  /**
   * Navigate to next carousel page
   */
  const nextPage = () =>
    setStartIndex(prev => (prev + itemsPerPage >= sortedPosts.length ? 0 : prev + itemsPerPage));

  /**
   * Navigate to previous carousel page
   */
  const prevPage = () =>
    setStartIndex(prev =>
      prev - itemsPerPage < 0
        ? Math.max(sortedPosts.length - itemsPerPage, 0)
        : prev - itemsPerPage,
    );

  /**
   * Render media element depending on type
   * @param {DatabaseGalleryPost} post - Gallery post
   * @param {boolean} showControls - Show video controls
   * @returns {JSX.Element | null}
   */
  const renderMedia = (post: DatabaseGalleryPost, showControls = false) => {
    const url = post.media;
    if (!url) return null;
    const ext = url.split('.').pop()?.toLowerCase();
    const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext || '');
    const is3D = ext === 'glb';
    const youTubeId = getYouTubeVideoId(url);
    const vimeoId = getVimeoVideoId(url);

    if (isVideo) return <video src={url} className='media' controls={showControls} />;
    if (isImage) return <img src={url} alt={post.title} className='media' />;
    if (is3D) return <img src={post.thumbnailMedia} alt={post.title} className='media' />;
    if (youTubeId)
      return (
        <img
          src={`https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`}
          alt={post.title}
          className='media'
        />
      );
    if (vimeoId)
      return <img src={`https://vumbnail.com/${vimeoId}.jpg`} alt={post.title} className='media' />;
    return null;
  };

  /**
   * Toggle like for a post
   */
  const handleHeartClick = async (post: DatabaseGalleryPost) => {
    try {
      const isLiked = post.likes.includes(currentUser.username);
      const updatedLikes = isLiked
        ? post.likes.filter(u => u !== currentUser.username)
        : [...post.likes, currentUser.username];

      setSelectedPost(prev => (prev?._id === post._id ? { ...prev, likes: updatedLikes } : prev));
      refreshGallery?.();
      await handleToggleLikes(post);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  /**
   * Delete a gallery post
   */
  const handleDelete = async (post: DatabaseGalleryPost) => {
    try {
      await handleDeleteGalleryPost(post);
      setSelectedPost(null);
      refreshGallery?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  /**
   * Download media
   */
  const handleDownload = async (post: DatabaseGalleryPost) => {
    try {
      await handleIncrementDownloads(post);
      window.open(post.media, '_blank');
      refreshGallery?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <div className='galleryContainer'>
      {/* Filters */}
      <div className='filtersContainer'>
        <select
          value={sortType}
          onChange={e =>
            setSortType(
              e.target.value as
                | 'newest'
                | 'oldest'
                | 'highestRated'
                | 'mostViewed'
                | 'mostDownloaded',
            )
          }
          className='sortSelect'>
          <option value='newest'>Newest</option>
          <option value='oldest'>Oldest</option>
          <option value='highestRated'>Most Liked</option>
          <option value='mostViewed'>Most Viewed</option>
          <option value='mostDownloaded'>Most Downloaded</option>
        </select>

        <select
          value={selectedType}
          onChange={e =>
            setSelectedType(e.target.value as 'all' | 'glb' | 'video' | 'image' | 'embed')
          }
          className='sortSelect'>
          <option value='all'>All</option>
          <option value='glb'>3D Models</option>
          <option value='video'>Videos</option>
          <option value='image'>Images</option>
          <option value='embed'>Embeds</option>
        </select>
      </div>

      {/* Errors & Empty State */}
      {error && <div className='error'>{error}</div>}
      {filteredGalleryPosts.length === 0 && (
        <div className='noGalleryPosts'>No gallery posts yet!</div>
      )}

      {/* Carousel */}
      <div className='carouselContainer'>
        <button
          className='carouselArrow left'
          onClick={prevPage}
          disabled={sortedPosts.length <= itemsPerPage}>
          <ChevronLeft size={22} />
        </button>

        <div className='galleryGrid carouselPage'>
          {visibleItems.map(post => (
            <div
              key={post._id.toString()}
              className='galleryCard'
              onClick={() => navigate(`/gallery/${post._id.toString()}`)}>
              {renderMedia(post, false)}
            </div>
          ))}
        </div>

        <button
          className='carouselArrow right'
          onClick={nextPage}
          disabled={sortedPosts.length <= itemsPerPage}>
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Page Indicator */}
      {sortedPosts.length > itemsPerPage && (
        <div className='carouselPageIndicator'>
          Page {Math.floor(startIndex / itemsPerPage) + 1} of{' '}
          {Math.ceil(sortedPosts.length / itemsPerPage)}
        </div>
      )}

      {/* Modal */}
      {selectedPost && (
        <div className='modalOverlay' onClick={() => setSelectedPost(null)}>
          <div className='modalContent' onClick={e => e.stopPropagation()}>
            <button className='closeBtn' onClick={() => setSelectedPost(null)}>
              <X size={18} />
            </button>

            <div className='modalMedia'>
              {(() => {
                const url = selectedPost.media;
                const ext = url.split('.').pop()?.toLowerCase();
                const is3D = ext === 'glb';
                const youTubeId = getYouTubeVideoId(url);
                const vimeoId = getVimeoVideoId(url);

                if (is3D)
                  return <ThreeViewport key={selectedPost.media} modelPath={selectedPost.media} />;
                if (youTubeId)
                  return (
                    <iframe
                      width='700'
                      height='394'
                      src={`https://www.youtube.com/embed/${youTubeId}`}
                      title={selectedPost.title}
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                    />
                  );
                if (vimeoId)
                  return (
                    <iframe
                      width='700'
                      height='394'
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      title={selectedPost.title}
                      frameBorder='0'
                      allow='autoplay; fullscreen; picture-in-picture'
                      allowFullScreen
                    />
                  );
                return renderMedia(selectedPost, true);
              })()}
            </div>

            <div className='modalInfo'>
              <h3 className='modalTitle'>{selectedPost.title}</h3>
              <div className='modalMeta'>
                <span className='author'>{selectedPost.user} • &nbsp;</span>
                <span className='date'>{new Date(selectedPost.postedAt).toLocaleString()}</span>
              </div>
              <div className='modalStatsRow'>
                {/* Likes */}
                <span className='statItem likes' title='Like'>
                  <Heart
                    size={18}
                    color={selectedPost.likes.includes(currentUser.username) ? 'red' : 'gray'}
                    onClick={() => handleHeartClick(selectedPost)}
                  />
                  <span>{selectedPost.likes.length}</span>
                </span>

                {/* Views */}
                <span className='statItem views' title='Views'>
                  <Eye size={18} />
                  <span>{selectedPost.views}</span>
                </span>

                {/* Downloads (only for non-embed media) */}
                {(() => {
                  const url = selectedPost.media;
                  const youTubeId = getYouTubeVideoId(url);
                  const vimeoId = getVimeoVideoId(url);
                  const isEmbed = !!youTubeId || !!vimeoId;

                  if (!isEmbed) {
                    return (
                      <span
                        className='statItem downloads'
                        onClick={() => handleDownload(selectedPost)}
                        style={{ cursor: 'pointer' }}
                        title='Download'>
                        <Download size={18} color='blue' />
                        <span>{selectedPost.downloads}</span>
                      </span>
                    );
                  }
                  return null;
                })()}

                {/* Delete (only for author) */}
                {isAuthor(selectedPost) && (
                  <span className='statItem delete' title='Delete'>
                    <Trash2
                      size={18}
                      className='deleteIcon'
                      onClick={() => handleDelete(selectedPost)}
                    />
                  </span>
                )}
              </div>

              <p className='description'>{selectedPost.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
