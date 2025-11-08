import { useState, useEffect } from 'react';
import { DatabaseGalleryPost } from '../types/types';
import { getGalleryPosts } from '../services/galleryService';
import useUserContext from './useUserContext';

const useGalleryComponentPage = (communityID: string) => {
    const { user: currentUser } = useUserContext();
    const [galleryPosts, setGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
    const [filteredGalleryPosts, setFilteredGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGalleryPosts = async () => {
            try {
            const resGalleryPosts = await getGalleryPosts();
            setGalleryPosts(resGalleryPosts);

            // Filter using the fetched data directly
            const filteredPosts = resGalleryPosts.filter(
                (post) => post.community === communityID
            );
            setFilteredGalleryPosts(filteredPosts);

            if (!filteredPosts.length) {
                setError('No gallery posts found for this community');
            }
            } catch (err: unknown) {
            console.error(err);
            setError('Failed to fetch gallery posts for this community');
            }
        };

        fetchGalleryPosts();
    }, [currentUser.username, communityID]);


    return {
        filteredGalleryPosts,
        error
    };
};

export default useGalleryComponentPage;