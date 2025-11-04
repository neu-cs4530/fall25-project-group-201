import axios from 'axios';
import { DatabaseMedia } from '../types/types';

const MEDIA_API_URL = '/api/media';

const addMedia = async (user: string, formData: FormData): Promise<DatabaseMedia> => {
  formData.append('user', user);

  const res = await axios.post(`${MEDIA_API_URL}/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (res.status !== 200) {
    throw new Error('Error while adding media');
  }

  return res.data;
};

export default { addMedia };
