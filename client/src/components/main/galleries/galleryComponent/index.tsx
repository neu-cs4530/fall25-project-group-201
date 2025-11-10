import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import './index.css';
import useGalleryComponentPage from '../../../../hooks/useGalleryComponentPage';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';

type GalleryComponentProps = {
  communityID: string;
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ communityID }) => {
  const { filteredGalleryPosts, error, handle3DMediaClick, checkIfAuthorOfCurrentGalleryPost, isAuthor, handleDeleteGalleryPost} = useGalleryComponentPage(communityID);

  const visibleCount = 4; // show 4 items at a time
  const [startIndex, setStartIndex] = useState(0);
  const [currentGalleryPost, setCurrentGalleryPost] = useState<DatabaseGalleryPost>();

  useEffect(() => {
    if (currentGalleryPost) {
      checkIfAuthorOfCurrentGalleryPost(currentGalleryPost)
    }
  }, [currentGalleryPost?._id]);

  const next = () => {
    setStartIndex(prev =>
      prev + visibleCount >= filteredGalleryPosts.length ? 0 : prev + visibleCount,
    );
    setCurrentGalleryPost(undefined);
  };
  const prev = () => {
    setStartIndex(prev => (prev - visibleCount < 0 ? 0 : prev - visibleCount));
    setCurrentGalleryPost(undefined);
  };

  const visibleItems = filteredGalleryPosts.slice(startIndex, startIndex + visibleCount);

  const handleMediaClick = (media: DatabaseGalleryPost) => {
    setCurrentGalleryPost(media);
  };

  const handleDeleteButtonClick = (media: DatabaseGalleryPost) => {
    handleDeleteGalleryPost(media);
    setCurrentGalleryPost(undefined);
  };

  return (
    <div className='relative w-full h-[160px] bg-black/90 rounded-2xl flex items-center justify-center overflow-hidden px-4'>
      {filteredGalleryPosts.length === 0 && <div className='text-white'>No gallery posts yet!</div>}
      {error && error !== 'No gallery posts found for this community' && (
        <div className='text-red-500'>{error}</div>
      )}

      {/* Carousel row */}
      <div className='carousel-row'>
        <button
          onClick={prev}
          className={`arrowButtonLeft ${filteredGalleryPosts.length <= visibleCount ? 'disabled' : ''}`}>
          <ChevronLeft size={20} />
        </button>
        {visibleItems.map((item, i) => {
          const url = item.media;
          const ext = url.split('.').pop()?.toLowerCase();
          const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(url);

          return (
            <span
              key={i}
              className='carouselItem inline-flex flex-col items-center'
              onClick={() => handleMediaClick(item)}>
              {/* Media */}
              {isEmbed ? (
                (() => {
                  let embedUrl = url;
                  if (url.includes('youtube.com/watch')) {
                    const videoId = new URL(url).searchParams.get('v');
                    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  }
                  if (url.includes('vimeo.com') && !url.includes('player.vimeo.com')) {
                    const vimeoId = url.split('/').pop();
                    if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
                  }
                  return (
                    <iframe
                      src={embedUrl}
                      title={`Embed ${i}`}
                      className='galleryMedia'
                      allow='autoplay; fullscreen'
                    />
                  );
                })()
              ) : ext && ['mp4', 'webm', 'mov'].includes(ext) ? (
                <video src={url} controls className='galleryMedia' />
              ) : ext && ['jpg', 'jpeg', 'png'].includes(ext) ? (
                <img src={url} alt={`Gallery ${i}`} className='galleryMedia' />
              ) : ext && ['glb'].includes(ext) ? (
                <img
                  src={item.thumbnailMedia}
                  alt={`Gallery ${i}`}
                  className='galleryMedia cursor-pointer'
                  /*onClick={() => handle3DMediaClick(item._id.toString())}*/
                />
              ) : null}
            </span>
          );
        })}
        <button
          onClick={next}
          className={`arrowButtonRight ${filteredGalleryPosts.length <= visibleCount ? 'disabled' : ''}`}>
          <ChevronRight size={20} />
        </button>
      </div>

      {currentGalleryPost && (
        <div className='galleryPostInfo'>
          <span className='galleryAuthor'>{currentGalleryPost.user}</span> <span className='galleryPostDate'>posted at {new Date(currentGalleryPost.postedAt).toLocaleString()}</span>

          {/* Trash button */}
          {isAuthor && <button className='trashButton' onClick={() => handleDeleteButtonClick(currentGalleryPost)}>
            <Trash2 size={16} className='text-white' />
          </button>}

          <h3>{currentGalleryPost.title}</h3>

          
          <div>{currentGalleryPost.description}</div>

          {currentGalleryPost.media.toLowerCase().endsWith('.glb') && (
            <button onClick={() => handle3DMediaClick(currentGalleryPost._id.toString())}>
              View 3D Model In Viewport
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
