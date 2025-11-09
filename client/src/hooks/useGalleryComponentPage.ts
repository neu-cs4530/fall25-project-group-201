import { useState, useEffect } from 'react';
import { DatabaseGalleryPost } from '../types/types';
import { getGalleryPosts } from '../services/galleryService';
import useUserContext from './useUserContext';
import { useNavigate } from 'react-router-dom';

const useGalleryComponentPage = (communityID: string) => {
    const { user: currentUser } = useUserContext();
    const [galleryPosts, setGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
    const [filteredGalleryPosts, setFilteredGalleryPosts] = useState<DatabaseGalleryPost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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

    const handle3DMediaClick = (galleryPostID: string) => {
        navigate(`/galleryPostViewport/${galleryPostID}`);
    }

    return {
        filteredGalleryPosts,
        error,
        handle3DMediaClick
    };
};

export default useGalleryComponentPage;