import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import './index.css';
import useGalleryComponentPage from '../../../../hooks/useGalleryComponentPage';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';

type GalleryComponentProps = {
  communityID: string;
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ communityID }) => {
  const { filteredGalleryPosts, error, handle3DMediaClick } = useGalleryComponentPage(communityID);

  const visibleCount = 2; // show 2 items at a time
  const [startIndex, setStartIndex] = useState(0);
  const [currentMedia, setCurrentMedia] = useState<DatabaseGalleryPost>();

  const next = () => {
    setStartIndex(prev =>
      prev + visibleCount >= filteredGalleryPosts.length ? 0 : prev + visibleCount,
    );
    setCurrentMedia(undefined);
  };
  const prev = () => {
    setStartIndex(prev => (prev - visibleCount < 0 ? 0 : prev - visibleCount));
    setCurrentMedia(undefined);
  };

  const visibleItems = filteredGalleryPosts.slice(startIndex, startIndex + visibleCount);

  const handleMediaClick = (media: DatabaseGalleryPost) => {
    setCurrentMedia(media);
  };

  return (
    <div className='relative w-full h-[160px] bg-black/90 rounded-2xl flex items-center justify-center overflow-hidden px-4'>
      {filteredGalleryPosts.length === 0 && <div className='text-white'>No gallery posts yet!</div>}
      {error && <div className='text-red-500'>Error loading gallery posts</div>}

      {/* Carousel row */}
      <div className='carousel-row'>
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
      </div>

      {currentMedia && (
        <div className='galleryPostInfo'>
          {/* Trash button */}
          <button className='trashButton'>
            <Trash2 size={16} className='text-white' />
          </button>

          <h3>{currentMedia.title}</h3>

          <div>
            {currentMedia.user} posted at {new Date(currentMedia.postDateTime).toLocaleString()}
          </div>

          <div>{currentMedia.description}</div>

          {currentMedia.media.toLowerCase().endsWith('.glb') && (
            <button onClick={() => handle3DMediaClick(currentMedia._id.toString())}>
              View 3D Model In Viewport
            </button>
          )}
        </div>
      )}

      {/* Arrows */}
      {filteredGalleryPosts.length > visibleCount && (
        <>
          <button
            onClick={prev}
            className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full hover:bg-black/60 text-white'>
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full hover:bg-black/60 text-white'>
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default GalleryComponent;
