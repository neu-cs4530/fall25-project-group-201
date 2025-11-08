import { useState } from "react";
import useThreeViewportPage from "../../../hooks/useThreeViewportPage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import './index.css';

const GalleryComponent = () => {
  const items = [
    { type: "image", src: "/icons/orthoIcon.png", alt: "First image" },
    { type: "image", src: "/icons/orthoIcon.png", alt: "Second image" },
    { type: "embed", src: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { type: "image", src: "/icons/orthoIcon.png", alt: "Third image" },
  ];

  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  const current = items[index];

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden">
      {/* Display item */}
      <div className="w-full h-full flex items-center justify-center">
        {current.type === "image" ? (
          <img
            src={current.src}
            alt={current.alt}
            className="galleryMedia"
          />
        ) : (
          <iframe
            src={current.src}
            className="galleryMedia"
            allow="autoplay; fullscreen"
          />
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
