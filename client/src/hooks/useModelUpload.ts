import { useState, useRef } from 'react';
/**
 * Custom hook for handling 3D model file uploads.
 * 
 * Provides state management and file handling for .glb model uploads,
 * including file validation and URL generation for preview.
 * 
 * @returns Object containing:
 * - modelUrl: Generated blob URL for the uploaded model (null if no file)
 * - fileInputRef: React ref for the hidden file input element
 * - handleFileChange: File input change handler with .glb validation
 * - triggerFileUpload: Function to programmatically trigger file input click
 */
const useModelUpload = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
  * Handles file input changes and validates .glb format.
  * Creates a blob URL for valid files and updates modelUrl state.
  * Shows alert if file is not a .glb format.
  * 
  * @param e - File input change event
  */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    } else {
      alert('Please upload a valid .glb file.');
    }
  };

  /**
 * Programmatically triggers the file input click event.
 * Used to open the file picker from a custom button/UI element.
 */
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    modelUrl,
    fileInputRef,
    handleFileChange,
    triggerFileUpload,
  };
};

export default useModelUpload;
