import useThreeViewportPage from '../../../hooks/useThreeViewportPage';
import useModelUpload from '../../../hooks/useModelUpload';
import './index.css';

interface ThreeViewportProps {
  modelPath?: string | null;
  allowUpload?: boolean;
}

const ThreeViewport = ({ modelPath = null, allowUpload = false }: ThreeViewportProps) => {
  const { modelUrl, fileInputRef, handleFileChange, triggerFileUpload } = useModelUpload();
  const activeModel = modelPath || modelUrl;
  const { containerRef, handleResetCamera } = useThreeViewportPage(activeModel);

  return (
    <div className='viewport-card'>
      <div ref={containerRef} className='viewport-canvas' />

      {allowUpload && (
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
          {activeModel && (
            <button onClick={handleResetCamera} className='reset-camera'>
              Reset Camera
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreeViewport;
