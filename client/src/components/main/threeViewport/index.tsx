import { useState, useRef } from 'react';
import useThreeViewportPage from '../../../hooks/useThreeViewportPage';
import useModelUpload from '../../../hooks/useModelUpload';
import './index.css';
import orthoIcon from '../../../../public/icons/orthoIcon.png';
import perspIcon from '../../../../public/icons/perspIcon.png';
import cameraIcon from '../../../../public/icons/cameraIcon.png';

/**
 * Props for the ThreeViewport component.
 * @typedef {Object} ThreeViewportProps
 * @property {string | null} [modelPath] - Optional path to a GLB model to be displayed in the viewport.
 * @property {boolean} [allowUpload=false] - Whether to allow model uploads via file input.
 */
interface ThreeViewportProps {
  modelPath?: string | null;
  allowUpload?: boolean;
}

/**
 * A 3D viewport component using Three.js for model visualization.
 * Supports uploading GLB models, toggling between orthographic/perspective cameras,
 * and resetting the camera view.
 *
 * @param {ThreeViewportProps} props - The component props.
 * @returns {JSX.Element} A rendered Three.js viewport component.
 */
const ThreeViewport = ({ modelPath = null, allowUpload = false }: ThreeViewportProps) => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const activeModel = modelPath || modelUrl;

  const { containerRef, handleResetCamera, handleTogglePerspective } =
    useThreeViewportPage(activeModel);

  const [isOrthoCameraMode, setIsOrthoCameraMode] = useState<boolean>(true);

  const [visibleTooltip, setVisibleTooltip] = useState<string | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handles toggling between orthographic and perspective camera modes.
   */
  const handleCameraModeToggle = () => {
    const updatedCameraMode = !isOrthoCameraMode;
    setIsOrthoCameraMode(updatedCameraMode);
    handleTogglePerspective();
  };

  /**
   * Positions the tooltip relative to the hovered icon.
   *
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} e - The mouse event.
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

  /**
   * Handles mouse enter events by starting a timer before showing the tooltip.
   *
   * @param {string} tooltipId - Identifier for the tooltip to display.
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} e - The mouse event.
   */
  const handleMouseEnter = (tooltipId: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    positionTooltip(e);
    hoverTimeout.current = setTimeout(() => {
      setVisibleTooltip(tooltipId);
    }, 1000); // delay in ms (1 second)
  };

  /**
   * Handles mouse leave events by clearing any pending tooltip timers.
   */
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
      </div>
    </div>
  );
};

export default ThreeViewport;
