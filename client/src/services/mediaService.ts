import axios from 'axios';
import { Media, DatabaseMedia } from '../types/types';

const MEDIA_API_URL = '/api/media';

const addMedia = async (formData: FormData): Promise<DatabaseMedia> => {
  const res = await axios.post(`${MEDIA_API_URL}/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (res.status !== 200) {
    throw new Error('Error while adding media');
  }

  return res.data;
};

export {
  addMedia
};
