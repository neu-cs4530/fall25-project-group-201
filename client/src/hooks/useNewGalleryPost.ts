import { ChangeEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [communityErr, setCommunityErr] = useState<string>('');

  const [mediaErr, setMediaErr] = useState<string | null>(null);
  const [thumbnailMediaErr, setThumbnailMediaErr] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaPath, setUploadedMediaPath] = useState<string | undefined>(undefined);
  const [thumbnailMediaPath, setUploadedThumbnailMediaPath] = useState<string | undefined>(undefined);
  const { communityID } = useParams<{ communityID: string }>();

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Project title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!text) {
      setTextErr('Project description cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    if (!mediaUrl && !mediaPath) {
      setMediaErr('Media file or link must be uploaded. How else will people be able to visualize your cool project?');
      isValid = false;
    } else {
      setMediaErr('');
    }

    if (!communityID) {
      setCommunityErr('Error: Community for this project is not defined');
      isValid = false;
    } else {
      setCommunityErr('');
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

    console.log("thumbnailMediaPath, ", thumbnailMediaPath)

    const gallerypost: GalleryPost = {
      title,
      description: text,
      user: user.username,
      media: (mediaUrl || mediaPath)!,
       ...(thumbnailMediaPath ? { thumbnailMedia: thumbnailMediaPath } : {}),
      postDateTime:  new Date(),
      community: communityID!
    };

    try {
      const res = await addGalleryPost(gallerypost);
      if (res && res._id) {
        navigate(`/communities/${communityID}`);
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

    setUploadedMediaPath(`/userData/${user.username}/${file.name}`); // Path used in backend
  };

    const handleThumbnailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedThumbnailMediaPath(`/userData/${user.username}/${file.name}`); // Path used in backend
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
    thumbnailMediaErr,
    setThumbnailMediaErr,
    mediaUrl,
    setMediaUrl,
    communityErr,
    mediaPath,
    setUploadedMediaPath,
    setUploadedThumbnailMediaPath,
    postGalleryPost,
    handleFileChange,
    handleThumbnailFileChange,
  };
};

export default useNewGalleryPost;
