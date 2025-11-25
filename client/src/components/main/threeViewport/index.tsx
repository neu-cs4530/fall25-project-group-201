import { useState, useRef } from 'react';
import useThreeViewport from '../../../hooks/useThreeViewport';
import useModelUpload from '../../../hooks/useModelUpload';
import useHDRI from '../../../hooks/useHDRI';
import HDRISelector from './HDRISelector';
import './index.css';
import orthoIcon from '../../../../public/icons/orthoIcon.png';
import perspIcon from '../../../../public/icons/perspIcon.png';
import cameraIcon from '../../../../public/icons/cameraIcon.png';
import InfoPopover from './InfoPopover';
import useInfoPopover from '../../../hooks/useInfoPopover';

interface ThreeViewportProps {
  modelPath?: string | null;
  allowUpload?: boolean;
  rotationSetting?: number[] | null;
  setRotationSetting?: React.Dispatch<React.SetStateAction<number[] | null>>;
  translationSetting?: number[] | null;
  setTranslationSetting?: React.Dispatch<React.SetStateAction<number[] | null>>;
}

const HDRI_PRESETS = [
  { value: 'default', label: 'Default', icon: '💡' },
  { value: 'sunset', label: 'Sunset', icon: '🌅' },
  { value: 'studio', label: 'Studio', icon: '🎬' },
  { value: 'indoor', label: 'Indoor', icon: '🏠' },
];

/**
 * Represents a 3D viewport that can be interacted with. This includes orbit controls, changing
 * HDRI settings, camera resetting, orthogonal/perspective view toggling and camera reference snapping
 */
const ThreeViewport = ({
  modelPath = null,
  allowUpload = false,
  translationSetting = [0, 0.77, 3.02],
  setTranslationSetting,
  rotationSetting = [0, 0, 0],
  setRotationSetting,
}: ThreeViewportProps) => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const activeModel = modelPath || modelUrl;

  const {
    containerRef,
    sceneRef,
    rendererRef,
    handleResetCamera,
    handleTogglePerspective,
    modelVerts,
    modelEdges,
    modelFaces,
  } = useThreeViewport(
    activeModel,
    rotationSetting,
    setRotationSetting,
    translationSetting,
    setTranslationSetting,
  );

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

  /**
   * Handles perspective/orthogonal view toggling of viewport.
   */
  const handleCameraModeToggle = () => {
    const updatedCameraMode = !isOrthoCameraMode;
    setIsOrthoCameraMode(updatedCameraMode);
    handleTogglePerspective();
  };

  /**
   * Positions a tooltip element relative to its parent container.
   *
   * @param e - mouse event that it is triggered by
   */
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

  const { isVisible, toggleVisibility } = useInfoPopover();

  return (
    <div className='viewport-card'>
      <div ref={containerRef} tabIndex={0} className='viewport-canvas' />

      <div
        className='expand-icon'
        onClick={() => {
          const viewportCard = containerRef.current?.parentElement;
          if (!viewportCard) return;

          if (!document.fullscreenElement) {
            viewportCard.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        }}>
        ⤢
      </div>

      <div className='info-icon' onClick={toggleVisibility}>
        ⓘ
      </div>

      {isVisible && <InfoPopover />}

      {/* <InfoPopover/> */}

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
                  id='#ortho-persp-button'
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

        {/* 3D Model Information */}
        {activeModel && (
          <>
            <div className='modelInfo'>Vertices: {modelVerts}</div>
            <div className='modelInfo'>Edges: {modelEdges}</div>
            <div className='modelInfo'>Faces: {modelFaces}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThreeViewport;
