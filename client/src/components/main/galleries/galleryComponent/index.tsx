import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import useGalleryComponentPage, {
  MediaType,
  CategoryType,
  SortType,
} from '../../../../hooks/useGalleryComponentPage';
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
  const {
    visibleItems,
    filteredGalleryPosts,
    error,
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
    handleIncrementViews,
    resetFilters,
    searchQuery,
    setSearchQuery,
  } = useGalleryComponentPage(communityID);

  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  const renderMedia = (post: DatabaseGalleryPost) => {
    if (!post.media) return null;
    const ext = post.media.split('.').pop()?.toLowerCase();
    const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext || '');
    const is3D = ext === 'glb';
    const isEmbed = post.media.includes('youtu') || post.media.includes('vimeo');

    if (isImage || is3D)
      return (
        <img src={is3D ? post.thumbnailMedia : post.media} alt={post.title} className='media' />
      );
    if (isVideo) return <video src={post.media} controls muted className='media' />;
    if (isEmbed) {
      let embedUrl = post.media;
      if (post.media.includes('youtu.be')) {
        const id = post.media.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }
      if (post.media.includes('youtube.com/watch')) {
        const id = new URL(post.media).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }
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
      {/* Filters */}
      <div className='filtersContainer'>
        <div className='filterBlock'>
          <label className='filterLabel'>SORT BY</label>
          <select
            value={sortType}
            onChange={e => setSortType(e.target.value as SortType)}
            className='sortSelect'>
            <option value='newest'>Newest</option>
            <option value='oldest'>Oldest</option>
            <option value='highestRated'>Most Liked</option>
            <option value='mostViewed'>Most Viewed</option>
            <option value='mostDownloaded'>Most Downloaded</option>
          </select>
        </div>

        <div className='filterBlock'>
          <label className='filterLabel'>MEDIA TYPE</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as MediaType)}
            className='sortSelect'>
            <option value='all'>All</option>
            <option value='glb'>3D Models</option>
            <option value='video'>Videos</option>
            <option value='image'>Images</option>
            <option value='embed'>Embeds</option>
          </select>
        </div>

        <div className='filterBlock'>
          <label className='filterLabel'>CATEGORY</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as CategoryType)}
            className='sortSelect'>
            <option value='all'>All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className='filterBlock'>
          <label className='filterLabel'>&nbsp;</label>
          <button className='resetFiltersButton' onClick={() => resetFilters()}>
            Reset
          </button>
        </div>

        {/* Search bar */}
        <div className='filterBlock searchBlock'>
          <div className='searchWrapper'>
            <Search size={18} className='searchIcon' />
            <input
              type='text'
              placeholder='Search posts...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='searchInput'
            />
          </div>
        </div>
      </div>

      {(error || localError) && <div className='error'>{error || localError}</div>}
      {filteredGalleryPosts.length === 0 && (
        <div className='noGalleryPosts'>No gallery posts yet!</div>
      )}

      {/* Carousel */}
      <div className='carouselContainer'>
        <button
          className='carouselArrow left'
          onClick={prevPage}
          disabled={filteredGalleryPosts.length <= itemsPerPage}>
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
                  navigate(`/gallery/${post._id.toString()}`);
                } catch {
                  setLocalError('Failed to increment views.');
                }
              }}>
              {renderMedia(post)}
            </div>
          ))}
        </div>
        <button
          className='carouselArrow right'
          onClick={nextPage}
          disabled={filteredGalleryPosts.length <= itemsPerPage}>
          <ChevronRight size={22} />
        </button>
      </div>

      {filteredGalleryPosts.length > itemsPerPage && (
        <div className='carouselPageIndicator'>
          Page {Math.floor(startIndex / itemsPerPage) + 1} of{' '}
          {Math.ceil(filteredGalleryPosts.length / itemsPerPage)}
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
