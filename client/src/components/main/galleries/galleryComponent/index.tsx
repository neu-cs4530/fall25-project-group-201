import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';
import useGalleryComponentPage from '../../../../hooks/useGalleryComponentPage';

type GalleryComponentProps = {
  communityID: string;
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ communityID }) => {
  const { filteredGalleryPosts, error, handle3DMediaClick } = useGalleryComponentPage(communityID);

  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2;

  const next = () => {
    setStartIndex(prev =>
      prev + visibleCount >= filteredGalleryPosts.length ? 0 : prev + visibleCount,
    );
  };

  const prev = () => {
    setStartIndex(prev =>
      prev - visibleCount < 0
        ? Math.max(filteredGalleryPosts.length - visibleCount, 0)
        : prev - visibleCount,
    );
  };

  const visibleItems = filteredGalleryPosts.slice(startIndex, startIndex + visibleCount);

  return (
    <div className='relative w-full h-[300px] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden'>
      {/* If there are no gallery posts */}
      {filteredGalleryPosts.length === 0 && <div>No gallery posts in this community yet!</div>}

      {/* Grid of visible items */}
      <div className='flex w-full h-full justify-center items-center space-x-4 px-6 transition-all duration-300'>
        {visibleItems.map((item, i) => {
          const url = item.media;

          // Check if it's a YouTube or Vimeo embed
          const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(url);

          if (isEmbed) {
            // Convert YouTube links to embed URL if needed
            let embedUrl = url;

            // Simple YouTube embed conversion
            if (url.includes('youtube.com/watch')) {
              const videoId = new URL(url).searchParams.get('v');
              if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            // For Vimeo, typically direct embed works as https://player.vimeo.com/video/<id>
            if (url.includes('vimeo.com') && !url.includes('player.vimeo.com')) {
              const vimeoId = url.split('/').pop();
              if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
            }

            return (
              <iframe
                key={i}
                src={embedUrl}
                className='galleryMedia'
                allow='autoplay; fullscreen'
                title={`Embed ${i}`}
              />
            );
          }

          // Check if it's a video file
          const ext = url.split('.').pop()?.toLowerCase();
          if (ext && ['mp4', 'webm', 'mov'].includes(ext)) {
            return <video key={i} src={url} controls className='galleryMedia' />;
          }

          if (ext && ['jpg', 'jpeg', 'png'].includes(ext)) {
            // Image
            return <img key={i} src={url} alt={`Gallery item ${i}`} className='galleryMedia' />;
          }

          if (ext && ['glb'].includes(ext)) {
            // For 3D model, show thumbnail instead
            return (
              <img
                key={i}
                src={item.thumbnailMedia}
                alt={`Gallery item ${i}`}
                className='galleryMedia'
                onClick={() => handle3DMediaClick(item._id.toString())}
              />
            );
          }
        })}
      </div>

      {/* Navigation arrows */}
      {filteredGalleryPosts.length > 2 && (
        <button
          onClick={prev}
          className='absolute left-4 text-white bg-black/40 p-2 rounded-full hover:bg-black/60'>
          <ChevronLeft size={28} />
        </button>
      )}

      {filteredGalleryPosts.length > 2 && (
        <button
          onClick={next}
          className='absolute right-4 text-white bg-black/40 p-2 rounded-full hover:bg-black/60'>
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
};

export default GalleryComponent;
