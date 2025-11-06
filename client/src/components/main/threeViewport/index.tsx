import useThreeViewportPage from '../../../hooks/useThreeViewportPage';
import useModelUpload from '../../../hooks/useModelUpload';
import './index.css';
import orthoIcon from '/icons/orthoIcon.png';

const ThreeViewport = () => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const { containerRef, handleResetCamera } = useThreeViewportPage(modelUrl);

  const handleOrthoToggle = () => {
    console.log('Toggled orthographic / perspective view');
    // TODO: implement
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
                src={orthoIcon}
                alt='Toggle View'
                className='icon-button'
                onClick={handleOrthoToggle}
              />
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ThreeViewport;
