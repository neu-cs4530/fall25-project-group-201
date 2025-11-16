import useThreeViewport from '../../../../hooks/useThreeViewport';
import useGalleryPostViewport from '../../../../hooks/useGalleryPostViewport';
import useHDRI from '../../../../hooks/useHDRI';
import HDRISelector from '../HDRISelector';
import { useEffect } from 'react';

const HDRI_PRESETS = [
  { value: 'default', label: 'Default' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'studio', label: 'Studio' },
  { value: 'indoor', label: 'Indoor' },
];

const GalleryPostViewport = () => {
  const { galleryPost, err, fetchGalleryPost } = useGalleryPostViewport();

  useEffect(() => {
    fetchGalleryPost();
  }, [fetchGalleryPost]);

  const { containerRef, sceneRef, rendererRef } = useThreeViewport(galleryPost?.media ?? null);

  const { currentPreset, switchPreset, isLoading } = useHDRI({
    scene: sceneRef.current,
    renderer: rendererRef.current,
    presets: [
      { name: 'sunset', path: '/hdri/sunset.hdr', intensity: 1.0 },
      { name: 'studio', path: '/hdri/studio.hdr', intensity: 1.2 },
      { name: 'indoor', path: '/hdri/indoor.hdr', intensity: 0.8 },
    ],
    initialPreset: 'default',
  });

  return (
    <>
      {galleryPost && (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}>
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              background: '#f5f5f5',
              borderRadius: '0.75rem',
            }}
          />

          {/* HDRI Control positioned in top-right */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 10,
            }}>
            <HDRISelector
              currentPreset={currentPreset}
              onPresetChange={switchPreset}
              isLoading={isLoading || !sceneRef.current}
              presets={HDRI_PRESETS}
            />
          </div>
        </div>
      )}
      {err && <div>{err}</div>}
    </>
  );
};

export default GalleryPostViewport;