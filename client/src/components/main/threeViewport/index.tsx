import useThreeViewportPage from '../../../hooks/useThreeViewportPage';
import useModelUpload from '../../../hooks/useModelUpload';
import './index.css';

const ThreeViewport = () => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();

  const { containerRef, handleResetCamera } = useThreeViewportPage(modelUrl);

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
        <button onClick={triggerFileUpload} className='upload-button'>
          Upload Model (.glb)
        </button>
        {modelUrl && (
          <button onClick={handleResetCamera} className='reset-camera'>
            Reset Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default ThreeViewport;
