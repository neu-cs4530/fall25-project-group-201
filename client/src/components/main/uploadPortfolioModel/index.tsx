import { useState } from 'react';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import ThreeViewport from '../threeViewport';
import useUploadPortfolioModel from '../../../hooks/useUploadPortfolioModel';

const UploadPortfolioModel = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    titleErr,
    descriptionErr,
    modelErr,
    thumbnailErr,
    modelPath,
    thumbnailPath,
    previewFilePath,
    submitPortfolioModel,
    handleModelFileUpload,
    handleThumbnailFileUpload,
  } = useUploadPortfolioModel();

  const { user: currentUser } = useUserContext();
  const [showThumbnailUpload, setShowThumbnailUpload] = useState(false);

  return (
    <div className='new-question-container'>
      <h2>Upload Portfolio Model</h2>
      
      <div className='form-section'>
        <label htmlFor='title'>Model Title</label>
        <input
          id='title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Give your 3D model a name'
        />
        {titleErr && <p className='error'>{titleErr}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='description'>Model Description</label>
        <textarea
          id='description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='Describe your 3D model, techniques used, etc.'
        />
        {descriptionErr && <p className='error'>{descriptionErr}</p>}
      </div>

      <div className='form-section media-section'>
        <h3>3D Model File (.glb)</h3>
        <div className='file-upload'>
          <input 
            type='file' 
            accept='.glb' 
            onChange={(e) => {
              handleModelFileUpload(e);
              setShowThumbnailUpload(true);
            }} 
          />
        </div>
        {modelErr && <p className='error'>{modelErr}</p>}

        {modelPath && previewFilePath && (
          <div className='model-preview'>
            <p>3D Model Preview:</p>
            <div>
              <ThreeViewport key={previewFilePath} modelPath={previewFilePath.toString()} />
            </div>
          </div>
        )}
      </div>

      {showThumbnailUpload && modelPath && (
        <div className='form-section media-section'>
          <h3>Thumbnail Image</h3>
          <p>Upload a thumbnail image to represent your 3D model</p>
          <div className='file-upload'>
            <input 
              type='file' 
              accept='image/*' 
              onChange={handleThumbnailFileUpload} 
            />
          </div>
          {thumbnailErr && <p className='error'>{thumbnailErr}</p>}

          {thumbnailPath && (
            <div className='media-preview'>
              <p>Thumbnail Preview:</p>
              <img src={thumbnailPath} alt='Thumbnail preview' style={{ maxWidth: '300px' }} />
            </div>
          )}
        </div>
      )}

      <button 
        className='submit-btn' 
        onClick={submitPortfolioModel}
        disabled={!modelPath || !thumbnailPath}
      >
        Add to Portfolio
      </button>
    </div>
  );
};

export default UploadPortfolioModel;