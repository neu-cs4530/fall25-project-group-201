import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./index.css";
import useGalleryComponentPage from "../../../../hooks/useGalleryComponentPage";

type GalleryComponentProps = {
  communityID: string;
};

const GalleryComponent: React.FC<GalleryComponentProps> = ({ communityID }) => {
  const { filteredGalleryPosts, error } = useGalleryComponentPage(communityID);

  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2;

  const next = () => {
    setStartIndex((prev) =>
      prev + visibleCount >= filteredGalleryPosts.length ? 0 : prev + visibleCount
    );
  };

  const prev = () => {
    setStartIndex((prev) =>
      prev - visibleCount < 0
        ? Math.max(filteredGalleryPosts.length - visibleCount, 0)
        : prev - visibleCount
    );
  };

  const visibleItems = filteredGalleryPosts.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden">
      {/* Grid of visible items */}
      <div className="flex w-full h-full justify-center items-center space-x-4 px-6 transition-all duration-300">
        {visibleItems.map((item, i) => {
          const ext = item.media.split(".").pop()?.toLowerCase();

          if (ext && ["mp4", "webm", "mov"].includes(ext)) {
            // Render video
            return (
              <video
                key={i}
                src={item.media}
                controls
                className="galleryMedia"
              />
            );
          } else {
            // Render image
            return (
              <img
                key={i}
                src={item.media}
                alt={`Gallery item ${i}`}
                className="galleryMedia"
              />
            );
          }
        })}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 text-white bg-black/40 p-2 rounded-full hover:bg-black/60"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={next}
        className="absolute right-4 text-white bg-black/40 p-2 rounded-full hover:bg-black/60"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

export default GalleryComponent;
