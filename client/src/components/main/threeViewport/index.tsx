import { useState, useRef } from 'react';
import useThreeViewport from '../../../hooks/useThreeViewport';
import useModelUpload from '../../../hooks/useModelUpload';
import useHDRI from '../../../hooks/useHDRI';
import HDRISelector from './HDRISelector';
import './index.css';
import orthoIcon from '../../../../public/icons/orthoIcon.png';
import perspIcon from '../../../../public/icons/perspIcon.png';
import cameraIcon from '../../../../public/icons/cameraIcon.png';

interface ThreeViewportProps {
  modelPath?: string | null;
  allowUpload?: boolean;
}

const HDRI_PRESETS = [
  { value: 'default', label: 'Default' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'studio', label: 'Studio' },
  { value: 'indoor', label: 'Indoor' },
];

const ThreeViewport = ({ modelPath = null, allowUpload = false }: ThreeViewportProps) => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const activeModel = modelPath || modelUrl;

  const { containerRef, sceneRef, rendererRef, handleResetCamera, handleTogglePerspective } =
    useThreeViewport(activeModel);

  // HDRI Hook Integration
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

  const [isOrthoCameraMode, setIsOrthoCameraMode] = useState<boolean>(true);
  const [visibleTooltip, setVisibleTooltip] = useState<string | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCameraModeToggle = () => {
    const updatedCameraMode = !isOrthoCameraMode;
    setIsOrthoCameraMode(updatedCameraMode);
    handleTogglePerspective();
  };

  const positionTooltip = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const tooltip = e.currentTarget.querySelector('.tooltip-text') as HTMLElement;
    if (tooltip) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipTop = rect.top - 35;
      const tooltipLeft = rect.left + rect.width / 2;
      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${tooltipLeft}px`;
    }
  };

  const handleMouseEnter = (tooltipId: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    positionTooltip(e);
    hoverTimeout.current = setTimeout(() => {
      setVisibleTooltip(tooltipId);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setVisibleTooltip(null);
  };

  return (
    <div className='viewport-card'>
      <div ref={containerRef} className='viewport-canvas' />

      <div className='upload-section'>
        {allowUpload && (
          <input
            type='file'
            accept='.glb'
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        )}

        <div className='button-group'>
          {allowUpload && (
            <button onClick={triggerFileUpload} className='upload-button'>
              Upload Model (.glb)
            </button>
          )}

          {activeModel && (
            <>
              <div
                className='tooltip-wrapper'
                onMouseEnter={e => handleMouseEnter('reset', e)}
                onMouseLeave={handleMouseLeave}>
                <img
                  src={cameraIcon}
                  alt='Reset Camera'
                  className='icon-button'
                  onClick={handleResetCamera}
                />
                <span className={`tooltip-text ${visibleTooltip === 'reset' ? 'visible' : ''}`}>
                  Reset Camera
                </span>
              </div>

              <div
                className='tooltip-wrapper'
                onMouseEnter={e => handleMouseEnter('toggle', e)}
                onMouseLeave={handleMouseLeave}>
                <img
                  src={isOrthoCameraMode ? perspIcon : orthoIcon}
                  alt='Toggle View'
                  className='icon-button'
                  onClick={handleCameraModeToggle}
                />
                <span className={`tooltip-text ${visibleTooltip === 'toggle' ? 'visible' : ''}`}>
                  {isOrthoCameraMode ? 'Switch to Perspective View' : 'Switch to Orthographic View'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* HDRI Selector*/}
        {activeModel && (
          <HDRISelector
            currentPreset={currentPreset}
            onPresetChange={switchPreset}
            isLoading={isLoading || !sceneRef.current}
            presets={HDRI_PRESETS}
          />
        )}
      </div>
    </div>
  );
};

export default ThreeViewport;