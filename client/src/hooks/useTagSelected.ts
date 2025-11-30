import { useEffect, useState } from 'react';
import { getTagByName } from '../services/tagsService';
import { Tag, TagData } from '../types/types';

/**
 * Custom hook to handle fetching tag details by tag name.
 *
 * @param t - The tag object to fetch data for
 *
 * @returns tag - The current tag details (name and description).
 * @returns setTag - Setter to manually update the tag state if needed.
 */
const useTagSelected = (t: TagData) => {
  const [tag, setTag] = useState<Tag>({
    name: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTagByName(t.name);
        setTag(res || { name: 'Error', description: 'Error' });
      } catch (e) {
        setError('Error fetching tag data');
      }
    };
    fetchData();
  }, [t.name]);

  return {
    tag,
    setTag,
    error,
    setError,
  };
};

export default useTagSelected;
