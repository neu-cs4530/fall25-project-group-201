import { useState, useEffect } from 'react';
import { getGalleryPosts } from '../services/galleryService';
import { DatabaseGalleryPost } from '../types/types';

/**
 * Custom hook to fetch and manage related gallery posts for a given post.
 * It filters posts from the same community, generates thumbnails for video and image media,
 * and sorts posts by relevance based on tags, keywords, and author.
 * 
 * @param {DatabaseGalleryPost | null} post - The current gallery post to find related posts for.
 * @returns {{ related: DatabaseGalleryPost[]; loading: boolean }} 
 *          An object containing the top 3 related posts and a loading state.
 */
const useRelatedPosts = (post: DatabaseGalleryPost | null) => {
  const [related, setRelated] = useState<DatabaseGalleryPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!post) return;

    /**
     * Fetch all gallery posts, filter by the same community, generate thumbnails, 
     * and sort by relevance based on tags, keywords, and author.
     */
    const fetchRelated = async () => {
      setLoading(true);
      const all = await getGalleryPosts();

      let candidates = all.filter(p => p._id !== post._id && p.community === post.community);

      const keywords = `${post.title} ${post.description}`.toLowerCase();
      const titleWords = keywords.split(/\s+/).filter(w => w.length > 3);

      /**
       * Generates a thumbnail image for a video.
       * @param {string} url - URL of the video.
       * @returns {Promise<string>} Base64 data URL of the thumbnail image.
       */
      const generateVideoThumbnail = (url: string) =>
        new Promise<string>(resolve => {
          const video = document.createElement('video');
          video.src = url;
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.currentTime = 0.1;

          video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
          };

          video.onerror = () => resolve('');
        });

      /**
       * Generates a thumbnail image for an image.
       * @param {string} url - URL of the image.
       * @returns {Promise<string>} Base64 data URL of the thumbnail image.
       */
      const generateImageThumbnail = (url: string) =>
        new Promise<string>(resolve => {
          const img = new Image();
          img.src = url;
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 180;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => resolve('');
        });

      // Generate thumbnails for candidates if missing
      const candidatesWithThumb = await Promise.all(
        candidates.map(async p => {
          if (!p.thumbnailMedia) {
            const youTubeId = p.media.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
            const vimeoId = p.media.match(/vimeo\.com\/(\d+)/)?.[1];
            const ext = p.media.split('.').pop()?.toLowerCase();

            if (youTubeId) p.thumbnailMedia = `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`;
            else if (vimeoId) p.thumbnailMedia = `https://vumbnail.com/${vimeoId}.jpg`;
            else if (['mp4', 'webm', 'mov'].includes(ext || '')) {
              p.thumbnailMedia = await generateVideoThumbnail(p.media);
            } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
              p.thumbnailMedia = await generateImageThumbnail(p.media);
            }
          }
          return p;
        })
      );

      // Sort candidates by relevance (tags, keywords, author)
      candidatesWithThumb.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        const sharedTagsA = a.tags?.filter(t => post.tags?.includes(t)) ?? [];
        const sharedTagsB = b.tags?.filter(t => post.tags?.includes(t)) ?? [];
        scoreA += sharedTagsA.length * 3;
        scoreB += sharedTagsB.length * 3;

        if (a.user === post.user) scoreA += 4;
        if (b.user === post.user) scoreB += 4;

        const combinedA = `${a.title} ${a.description}`.toLowerCase();
        const combinedB = `${b.title} ${b.description}`.toLowerCase();
        const keywordMatchA = titleWords.filter(w => combinedA.includes(w)).length;
        const keywordMatchB = titleWords.filter(w => combinedB.includes(w)).length;
        scoreA += keywordMatchA * 1.5;
        scoreB += keywordMatchB * 1.5;

        return scoreB - scoreA;
      });

      setRelated(candidatesWithThumb.slice(0, 3));
      setLoading(false);
    };

    fetchRelated();
  }, [post]);

  return { related, loading };
};

export default useRelatedPosts;
