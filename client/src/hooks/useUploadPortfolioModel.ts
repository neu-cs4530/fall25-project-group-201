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

    if (!modelPath) {
      setModelErr('You must upload a 3D model file (.glb)');
      isValid = false;
    } else {
      setModelErr('');
    }

    if (!thumbnailPath) {
      setThumbnailErr('You must upload a thumbnail for your 3D model');
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
      // Read the model file
      const modelResponse = await fetch(modelPath!);
      const modelBlob = await modelResponse.blob();
      const modelFile = new File([modelBlob], 'model.glb', { type: 'model/gltf-binary' });

      // Upload with thumbnail
      await uploadPortfolioModel(user.username, modelFile, thumbnailPath!);
      
      toast.success('Portfolio model uploaded successfully!');
      navigate(`/user/${user.username}`);
    } catch (err) {
      toast.error('Failed to upload portfolio model');
    }
  };

  /**
   * Handles model file upload
   */
  const handleModelFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.glb'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setModelErr('Only .glb files are supported');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setModelErr('Model file must be under 50MB');
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
        toast('Now upload a thumbnail for your 3D model');
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
    modelPath,
    thumbnailPath,
    previewFilePath,
    submitPortfolioModel,
    handleModelFileUpload,
    handleThumbnailFileUpload,
  };
};

export default useUploadPortfolioModel;