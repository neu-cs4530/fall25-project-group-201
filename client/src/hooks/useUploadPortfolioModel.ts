import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserContext from './useUserContext';
import { uploadPortfolioModel } from '../services/userService';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing portfolio model upload form
 */
const useUploadPortfolioModel = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [titleErr, setTitleErr] = useState<string>('');
  const [descriptionErr, setDescriptionErr] = useState<string>('');
  const [modelErr, setModelErr] = useState<string | null>(null);
  const [thumbnailErr, setThumbnailErr] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');

  const [modelPath, setModelPath] = useState<string | undefined>(undefined);
  const [thumbnailPath, setThumbnailPath] = useState<string | undefined>(undefined);
  const [previewFilePath, setPreviewFilePath] = useState<string | undefined>();

  /**
   * Validates the form before submitting
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Model title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!description) {
      setDescriptionErr('Model description cannot be empty');
      isValid = false;
    } else {
      setDescriptionErr('');
    }

    if (!modelPath && !mediaUrl) {
      setModelErr('You must upload a media file or provide a URL');
      isValid = false;
    } else {
      setModelErr('');
    }

    if (modelPath?.endsWith('.glb') && !thumbnailPath) {
      setThumbnailErr('You must upload a thumbnail for 3D models');
      isValid = false;
    } else {
      setThumbnailErr('');
    }

    return isValid;
  };

  /**
   * Uploads the portfolio model
   */
  const submitPortfolioModel = async () => {
    if (!validateForm()) return;

    try {
      // If it's a URL, send it directly as a string
      if (mediaUrl) {
        await uploadPortfolioModel(user.username, mediaUrl, thumbnailPath || '');
        toast.success('Portfolio media uploaded successfully!');
        navigate(`/user/${user.username}`);
        return;
      }

      // If it's a file, read and upload
      if (modelPath) {
        const modelResponse = await fetch(modelPath);
        const modelBlob = await modelResponse.blob();

        // Determine file type from extension
        const ext = modelPath.slice(modelPath.lastIndexOf('.')).toLowerCase();
        let mimeType = 'model/gltf-binary';
        let fileName = 'model.glb';

        if (['.jpg', '.jpeg'].includes(ext)) {
          mimeType = 'image/jpeg';
          fileName = 'image.jpg';
        } else if (ext === '.png') {
          mimeType = 'image/png';
          fileName = 'image.png';
        } else if (ext === '.mp4') {
          mimeType = 'video/mp4';
          fileName = 'video.mp4';
        }

        const modelFile = new File([modelBlob], fileName, { type: mimeType });
        await uploadPortfolioModel(user.username, modelFile, thumbnailPath || '');

        toast.success('Portfolio media uploaded successfully!');
        navigate(`/user/${user.username}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload portfolio media');
    }
  };

  /**
   * Handles model file upload
   */
  const handleModelFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.glb'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setModelErr('Unsupported file type. Allowed: images, videos, or .glb');
      return;
    }

    // Different size limits for different file types
    let maxSize = 50 * 1024 * 1024; // Default 50MB for .glb
    let maxSizeText = '50MB';

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      maxSize = 5 * 1024 * 1024; // 5MB for images
      maxSizeText = '5MB';
    } else if (ext === '.mp4') {
      maxSize = 20 * 1024 * 1024; // 20MB for videos
      maxSizeText = '20MB';
    }

    if (file.size > maxSize) {
      setModelErr(`File too large. ${ext.toUpperCase()} files must be under ${maxSizeText}`);
      toast.error(`File too large. ${ext.toUpperCase()} files must be under ${maxSizeText}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', user.username);
      formData.append('filepathLocation', file.name);

      const res = await fetch('/api/media/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data?.filepathLocation) {
        setModelPath(data.filepathLocation);
        const tempFileUrl = URL.createObjectURL(file);
        setPreviewFilePath(tempFileUrl);
        setModelErr(null);

        // Only prompt for thumbnail if it's a .glb file
        if (ext === '.glb') {
          toast('Now upload a thumbnail for your 3D model');
        }
      } else {
        setModelErr('Model upload failed');
      }
    } catch (err) {
      setModelErr('Error uploading model file');
    }
  };

  /**
   * Handles thumbnail file upload
   */
  const handleThumbnailFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setThumbnailErr('Thumbnail must be PNG or JPG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setThumbnailErr('Thumbnail must be under 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', user.username);
      formData.append('filepathLocation', file.name);

      const res = await fetch('/api/media/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data?.filepathLocation) {
        setThumbnailPath(data.filepathLocation);
        setThumbnailErr(null);
        toast.success('Thumbnail uploaded!');
      } else {
        setThumbnailErr('Thumbnail upload failed');
      }
    } catch (err) {
      setThumbnailErr('Error uploading thumbnail');
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    titleErr,
    descriptionErr,
    modelErr,
    thumbnailErr,
    mediaUrl,
    setMediaUrl,
    modelPath,
    setModelPath,
    thumbnailPath,
    previewFilePath,
    submitPortfolioModel,
    handleModelFileUpload,
    handleThumbnailFileUpload,
  };
};

export default useUploadPortfolioModel;
