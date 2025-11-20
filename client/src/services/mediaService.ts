import axios from 'axios';
import { DatabaseMedia } from '../types/types';

const MEDIA_API_URL = '/api/media';

/**
 * Creates a media document.
 *
 * @param user - The author of the media who is uploading it.
 * @param formData - form data related to the media, including file location and file buffer
 */
export const addMedia = async (user: string, formData: FormData): Promise<DatabaseMedia> => {
  const file = formData.get('file') as File;
  formData.append('user', user);

  if (file && !formData.has('filepathLocation')) {
    formData.append('filepathLocation', file.name);
  }

  const res = await axios.post(`${MEDIA_API_URL}/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (res.status !== 200) {
    throw new Error('Error while adding media');
  }

  return res.data;
};

export default { addMedia };
