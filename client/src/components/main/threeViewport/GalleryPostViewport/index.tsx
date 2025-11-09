import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';
import useThreeViewportPage from '../../../../hooks/useThreeViewportPage';
import useGalleryPostViewport from '../../../../hooks/useGalleryPostViewport';
import { useEffect } from 'react';

const GalleryPostViewport = () => {
  const { galleryPost, err, fetchGalleryPost } = useGalleryPostViewport();

  useEffect(() => {
    fetchGalleryPost();
  }, [fetchGalleryPost]);

  console.log('media: ', galleryPost?.media ?? null);

  const { containerRef } = useThreeViewportPage(galleryPost?.media ?? null);

  return (
    <>
      {galleryPost && (
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            background: '#f5f5f5',
            borderRadius: '0.75rem',
          }}
        />
      )}
      {err && <div>{err}</div>}
    </>
  );
};

export default GalleryPostViewport;
