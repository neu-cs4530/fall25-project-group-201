import axios from 'axios';
import { DatabaseMedia } from '../types/types';

const MEDIA_API_URL = 'api/media';

/**
 * Creates a media document.
 *
 * @param user - The author of the media who is uploading it.
 * @param formData - form data related to the media, including file location and file buffer
 */
export const addMedia = async (formData: FormData): Promise<DatabaseMedia> => {
  // const file = formData.get('file') as File;
  // formData.append('user', user);
  // formData.append('file', file);

  // for (const [key, value] of formData.entries()) {
  //   console.log(`${key}: ${value}`);
  // }

  // if (file && !formData.has('filepathLocation')) {
  //   formData.append('filepathLocation', file.name);
  // }

  const res = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}${MEDIA_API_URL}/create`,
    formData, // formdata should be: user, then file
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  if (res.status !== 200) {
    throw new Error('Error while adding media');
  }

  return res.data;
};

/**
 * Deletes a media document.
 * @param filepathLocation of the media document
 * @returns the media document deleted
 */
export const deleteMedia = async (filepathLocation: string): Promise<DatabaseMedia> => {
  // Encode entire path so Express reads it as one param
  const encoded = encodeURIComponent(filepathLocation);

  const res = await axios.delete(`/${MEDIA_API_URL}/delete/${encoded}`);

  if (res.status !== 200) {
    throw new Error('Error while deleting media');
  }

  return res.data;
};

export default { addMedia, deleteMedia };
