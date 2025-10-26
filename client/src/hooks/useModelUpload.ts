import { useState, useRef } from "react";

const useModelUpload = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".glb")) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    } else {
      alert("Please upload a valid .glb file.");
    }
  };

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
