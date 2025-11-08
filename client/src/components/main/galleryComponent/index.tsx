import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./index.css";

const GalleryComponent = () => {
  const items = [
    { type: "image", src: "/icons/orthoIcon.png", alt: "First image" },
    { type: "image", src: "/icons/perspIcon.png", alt: "Second image" },
    { type: "image", src: "/icons/cameraIcon.png", alt: "Third image" },
    { type: "image", src: "/icons/orthoIcon.png", alt: "Fourth image" },
    { type: "image", src: "/icons/perspIcon.png", alt: "Fifth image" },
    { type: "image", src: "/icons/cameraIcon.png", alt: "Sixth image" },
    { type: "embed", src: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ];

  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2;

  const next = () => {
    setStartIndex((prev) =>
      prev + visibleCount >= items.length ? 0 : prev + visibleCount
    );
  };

  const prev = () => {
    setStartIndex((prev) =>
      prev - visibleCount < 0
        ? Math.max(items.length - visibleCount, 0)
        : prev - visibleCount
    );
  };

  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden">
      {/* Grid of visible items */}
      <div className="flex w-full h-full justify-center items-center space-x-4 px-6 transition-all duration-300">
        {visibleItems.map((item, i) =>
          item.type === "image" ? (
            <img
              key={i}
              src={item.src}
              alt={item.alt}
              className="galleryMedia"
            />
          ) : (
            <iframe
              key={i}
              src={item.src}
              className="galleryMedia"
              allow="autoplay; fullscreen"
            />
          )
        )}
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
