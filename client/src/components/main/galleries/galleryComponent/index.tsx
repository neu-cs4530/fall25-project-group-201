import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import useGalleryComponentPage from '../../../../hooks/useGalleryComponentPage';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';

/**
 * Props for the GalleryComponent.
 */
type GalleryComponentProps = {
  communityID: string;
};

/**
 * Component to display a gallery of posts for a community.
 */
const GalleryComponent: React.FC<GalleryComponentProps> = ({ communityID }) => {
  const { filteredGalleryPosts, error, handleIncrementViews } =
    useGalleryComponentPage(communityID);
  const navigate = useNavigate();
  const [sortType, setSortType] = useState<
    'newest' | 'oldest' | 'highestRated' | 'mostViewed' | 'mostDownloaded'
  >('newest');
  const [selectedType, setSelectedType] = useState<'all' | 'glb' | 'video' | 'image' | 'embed'>(
    'all',
  );
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [startIndex, setStartIndex] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const filteredByType = filteredGalleryPosts.filter(post => {
    if (!post.media) return false;
    const ext = post.media.split('.').pop()?.toLowerCase();
    const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext || '');
    const is3D = ext === 'glb';
    switch (selectedType) {
      case 'glb':
        return is3D;
      case 'video':
        return isVideo;
      case 'image':
        return isImage;
      case 'embed':
        return post.media.includes('youtu') || post.media.includes('vimeo');
      default:
        return true;
    }
  });

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

  const nextPage = () =>
    setStartIndex(prev => (prev + itemsPerPage >= sortedPosts.length ? 0 : prev + itemsPerPage));
  const prevPage = () =>
    setStartIndex(prev =>
      prev - itemsPerPage < 0
        ? Math.max(sortedPosts.length - itemsPerPage, 0)
        : prev - itemsPerPage,
    );

  const renderMedia = (post: DatabaseGalleryPost) => {
    if (!post.media) return null;
    const ext = post.media.split('.').pop()?.toLowerCase();
    const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext || '');
    const is3D = ext === 'glb';
    const isEmbed =
      post.media.includes('youtube.com') ||
      post.media.includes('youtu.be') ||
      post.media.includes('vimeo.com');
    if (isImage || is3D)
      return (
        <img src={is3D ? post.thumbnailMedia : post.media} alt={post.title} className='media' />
      );
    if (isVideo) return <video src={post.media} controls muted className='media'></video>;
    if (isEmbed) {
      let embedUrl = post.media;

      // Convert YouTube share links to embed form
      if (post.media.includes('youtu.be')) {
        const id = post.media.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }

      if (post.media.includes('youtube.com/watch')) {
        const id = new URL(post.media).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }

      // Vimeo normal to embed conversion
      if (post.media.includes('vimeo.com') && !post.media.includes('player.vimeo.com')) {
        const id = post.media.split('vimeo.com/')[1];
        embedUrl = `https://player.vimeo.com/video/${id}`;
      }

      return (
        <iframe
          className='media'
          src={embedUrl}
          width='800'
          height='450'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      );
    }

    return null;
  };

  return (
    <div className='galleryContainer'>
      <div className='filtersContainer'>
        <select
          value={sortType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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

      {(error || localError) && <div className='error'>{error || localError}</div>}
      {filteredGalleryPosts.length === 0 && (
        <div className='noGalleryPosts'>No gallery posts yet!</div>
      )}

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
              onClick={async () => {
                try {
                  await handleIncrementViews(post);
                } catch {
                  setLocalError('Failed to increment views.');
                }
                navigate(`/gallery/${post._id.toString()}`);
              }}>
              {renderMedia(post)}
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

      {sortedPosts.length > itemsPerPage && (
        <div className='carouselPageIndicator'>
          Page {Math.floor(startIndex / itemsPerPage) + 1} of{' '}
          {Math.ceil(sortedPosts.length / itemsPerPage)}
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
