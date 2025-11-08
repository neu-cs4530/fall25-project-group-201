import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addGalleryPost } from '../services/galleryService';
import useUserContext from './useUserContext';
import { GalleryPost } from '../types/types';

/**
 * Custom hook for managing a new question form, including state, validation,
 * file handling, media, and submission logic.
 *
 * @returns Object - Form state, error messages, handlers, and submission function
 */
const useNewGalleryPost = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');

  const [titleErr, setTitleErr] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');

  const [mediaErr, setMediaErr] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaPath, setUploadedMediaPath] = useState<string | undefined>(undefined);

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    return isValid;
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postGalleryPost = async () => {
    if (!validateForm()) return;

    if (!mediaUrl && !mediaPath) {
        setTextErr('Media file or link must bbe uploaded');
        return;
    }

    const gallerypost: GalleryPost = {
      title,
      description: text,
      author: user.username,
      model: mediaUrl || mediaPath,
      postDateTime:  new Date(),
    };

    try {
        console.log("trying...")
      const res = await addGalleryPost(gallerypost);
      if (res && res._id) {
        navigate('/home');
      }
    } catch (err) {
      setMediaErr('Failed to post question');
    }
  };

  /**
   * Handles a file input change event by setting the uploaded media path
   * @param {ChangeEvent<HTMLInputElement>} e - The file input change event
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedMediaPath(`userData/${user.username}/${file.name}`); // Path used in backend
  };

  return {
    title,
    setTitle,
    text,
    setText,
    titleErr,
    textErr,
    mediaErr,
    setMediaErr,
    mediaUrl,
    setMediaUrl,
    mediaPath,
    setUploadedMediaPath,
    postGalleryPost,
    handleFileChange,
  };
};

export default useNewGalleryPost;
