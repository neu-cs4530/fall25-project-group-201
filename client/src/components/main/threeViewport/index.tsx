import useThreeViewportPage from '../../../hooks/useThreeViewportPage';
import useModelUpload from '../../../hooks/useModelUpload';
import './index.css';
import orthoIcon from '/icons/orthoIcon.png';
import perspIcon from '/icons/perspIcon.png';
import { useState } from 'react';

const ThreeViewport = () => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const { containerRef, handleResetCamera, handleTogglePerspective } = useThreeViewportPage(modelUrl);
  const [ isOrthoCameraMode, setIsOrthoCameraMode ] = useState<boolean>(true); // initially, camera mode is orthographic

  const handleCameraModeToggle = () => {
    let updatedCameraMode = !isOrthoCameraMode;
    setIsOrthoCameraMode(updatedCameraMode);
    handleTogglePerspective();
  };

  return (
    <div className='viewport-card'>
      <div ref={containerRef} className='viewport-canvas' />

      <div className='upload-section'>
        <input
          type='file'
          accept='.glb'
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className='button-group'>
          <button onClick={triggerFileUpload} className='upload-button'>
            Upload Model (.glb)
          </button>

          {modelUrl && (
            <>
              <button onClick={handleResetCamera} className='reset-camera'>
                Reset Camera
              </button>
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
