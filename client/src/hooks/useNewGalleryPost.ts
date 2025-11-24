import { ChangeEvent, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addGalleryPost } from '../services/galleryService';
import useUserContext from './useUserContext';
import { GalleryPost } from '../types/types';
import { GalleryTag } from '../types/galleryTags';

/**
 * State object for the new gallery post form.
 */
interface GalleryFormState {
  title: string;
  description: string;
  mediaUrl: string;
  mediaPath?: string;
  mediaSize?: string;
  thumbnailMediaPath?: string;
  tags: GalleryTag[];
  projectLink: string;
}

/**
 * Error messages for the gallery post form fields.
 */
interface GalleryFormErrors {
  title?: string;
  description?: string;
  media?: string;
  thumbnailMedia?: string;
  community?: string;
  tags?: string;
  projectLink?: string;
}

/**
 * Custom hook for managing a new gallery post form, including state, validation,
 * file handling, media, and submission logic.
 *
 * @returns Object - Form state, error messages, handlers, and submission function
 */
const useNewGalleryPost = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { communityID } = useParams<{ communityID: string }>();
  const [downloadPermission, setDownloadPermission] = useState<boolean>(true);

  const [form, setForm] = useState<GalleryFormState>({
    title: '',
    description: '',
    mediaUrl: '',
    mediaPath: undefined,
    mediaSize: undefined,
    thumbnailMediaPath: undefined,
    tags: [],
    projectLink: '',
  });

  const [errors, setErrors] = useState<GalleryFormErrors>({});

  /**
   * Validates the current form state.
   *
   * @returns boolean - True if the form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: GalleryFormErrors = {};
    let isValid = true;

    if (!form.title) {
      newErrors.title = 'Project title cannot be empty';
      isValid = false;
    } else if (form.title.length > 100) {
      newErrors.title = 'Title cannot be more than 100 characters';
      isValid = false;
    }

    if (!form.description) {
      newErrors.description = 'Project description cannot be empty';
      isValid = false;
    } else if (!validateHyperlink(form.description)) {
      newErrors.description = 'Invalid hyperlink format.';
      isValid = false;
    }

    if (!form.mediaUrl && !form.mediaPath) {
      newErrors.media = 'Media file or link must be uploaded.';
      isValid = false;
    }

    if (form.mediaPath && !form.mediaSize) {
      newErrors.media = 'Media file size is undefined.';
      isValid = false;
    }

    if (form.mediaPath?.endsWith('.glb') && !form.thumbnailMediaPath) {
      newErrors.thumbnailMedia = 'You must upload a thumbnail for 3D models.';
      isValid = false;
    }

    if (!communityID) {
      newErrors.community = 'Error: Community for this project is not defined';
      isValid = false;
    }

    if (form.tags.length === 0) {
      newErrors.tags = 'Please select at least one tag.';
      isValid = false;
    }

    if (form.projectLink && !validateHyperlink(form.projectLink)) {
      newErrors.projectLink = 'Invalid URL format.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Submits the gallery post if the form is valid.
   * Handles API call and navigates to the community page on success.
   */
  const postGalleryPost = async () => {
    if (!validateForm()) return;

    const gallerypost: GalleryPost = {
      title: form.title,
      description: form.description,
      user: user.username,
      media: form.mediaUrl || form.mediaPath!,
      ...(form.thumbnailMediaPath ? { thumbnailMedia: form.thumbnailMediaPath } : {}),
      postedAt: new Date(),
      community: communityID!,
      views: 0,
      downloads: 0,
      likes: [],
      ...(form.mediaPath ? { mediaSize: form.mediaSize } : {}),
      tags: form.tags,
      ...(form.projectLink ? { link: form.projectLink } : {}),
      ...(form.mediaPath && form.mediaPath.endsWith('.glb')
        ? { permitDownload: downloadPermission }
        : {}),
    };

    try {
      const res = await addGalleryPost(gallerypost);
      if (res?._id) {
        navigate(`/communities/${communityID}`);
      }
      form.mediaUrl = '';
    } catch {
      setErrors(prev => ({ ...prev, media: 'Failed to post gallery post' }));
    }
  };

  /**
   * Handles media file selection and updates form state.
   *
   * @param e ChangeEvent<HTMLInputElement> - File input change event
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm(prev => ({
      ...prev,
      mediaPath: `/userData/${user.username}/${file.name}`,
      mediaSize: `${file.size} bytes`,
      mediaUrl: '',
    }));
    setErrors(prev => ({ ...prev, media: undefined }));
  };

  /**
   * Handles thumbnail file selection for 3D models.
   * Only allows JPEG and PNG images.
   *
   * @param e ChangeEvent<HTMLInputElement> - File input change event
   */
  const handleThumbnailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png'].includes(extension!)) {
      e.target.value = '';
      return;
    }

    setForm(prev => ({
      ...prev,
      thumbnailMediaPath: `/userData/${user.username}/${file.name}`,
    }));
  };

  /**
   * Returns a change handler for text inputs and textareas.
   *
   * @param field keyof GalleryFormState - Field name to update
   * @returns (e: ChangeEvent<T>) => void - Event handler to update form state
   */
  const handleInputChange =
    <T extends HTMLInputElement | HTMLTextAreaElement>(field: keyof typeof form) =>
    (e: ChangeEvent<T>) => {
      setForm(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  /**
   * Toggles a tag in the selected tags array.
   *
   * @param tag GalleryTag - Tag to add or remove
   */
  const toggleTag = (tag: GalleryTag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  return {
    form,
    setForm,
    errors,
    postGalleryPost,
    handleFileChange,
    handleThumbnailFileChange,
    handleInputChange,
    toggleTag,
    downloadPermission,
    setDownloadPermission,
  };
};

export default useNewGalleryPost;
