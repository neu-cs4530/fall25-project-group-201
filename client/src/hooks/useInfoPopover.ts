import { useState, useRef, useEffect } from 'react';

const useInfoPopover = () => {
  const [isVisible, setIsVisible] = useState(false); // Manages the visibility state of the popover
  const popoverRef = useRef<HTMLDivElement>(null); // Reference to the popover element
  const buttonRef = useRef<HTMLButtonElement>(null); // Reference to the button element that triggers the popover

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false); // Close the popover if clicked outside
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return { buttonRef, popoverRef, isVisible, toggleVisibility };
};

export default useInfoPopover;
