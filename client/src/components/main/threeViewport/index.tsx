import { useState } from 'react';
import useThreeViewportPage from '../../../hooks/useThreeViewportPage';
import useModelUpload from '../../../hooks/useModelUpload';
import './index.css';
import orthoIcon from '../../../../public/icons/orthoIcon.png';
import perspIcon from '../../../../public/icons/perspIcon.png';
import cameraIcon from '../../../../public/icons/cameraIcon.png';

interface ThreeViewportProps {
  modelPath?: string | null;
  allowUpload?: boolean;
}

const ThreeViewport = ({ modelPath = null, allowUpload = false }: ThreeViewportProps) => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const activeModel = modelPath || modelUrl;

  const { containerRef, handleResetCamera, handleTogglePerspective } =
    useThreeViewportPage(activeModel);

  const [isOrthoCameraMode, setIsOrthoCameraMode] = useState<boolean>(true);

  const handleCameraModeToggle = () => {
    const updatedCameraMode = !isOrthoCameraMode;
    setIsOrthoCameraMode(updatedCameraMode);
    handleTogglePerspective();
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
          />)}
          <div className='button-group'>
            {allowUpload && (
            <button onClick={triggerFileUpload} className='upload-button'>
              Upload Model (.glb)
            </button>)}

            {activeModel && (
              <>
                <img
                  src={cameraIcon}
                  alt='Reset Camera'
                  className='icon-button'
                  onClick={handleResetCamera}
                />
                <img
                  src={isOrthoCameraMode ? perspIcon : orthoIcon}
                  alt='Toggle View'
                  className='icon-button'
                  onClick={handleCameraModeToggle}
                />
              </>
            )}
          </div>
        </div>
    </div>
  );
};

export default ThreeViewport;
