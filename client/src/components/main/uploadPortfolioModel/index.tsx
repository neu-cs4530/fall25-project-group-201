import { useState } from 'react';
import './index.css';
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
    mediaUrl,
    setMediaUrl,
    modelPath,
    setModelPath,
    thumbnailPath,
    previewFilePath,
    submitPortfolioModel,
    handleModelFileUpload,
    handleThumbnailFileUpload,
  } = useUploadPortfolioModel();

  const [showThumbnailUpload, setShowThumbnailUpload] = useState(false);

  return (
    <div className='new-question-container'>
      <h2>Upload Portfolio Media</h2>

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
        <h3>Media</h3>

        <div className='media-inputs'>
          <input
            type='text'
            placeholder='Paste media URL (YouTube, image, etc.)'
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
          />
          <button
            type='button'
            onClick={() => {
              if (mediaUrl) {
                setModelPath(undefined);
                setShowThumbnailUpload(false);
              }
            }}>
            Add Embed
          </button>
        </div>

        <div className='file-upload'>
          <input
            type='file'
            accept='image/*,video/*,.glb'
            onChange={e => {
              handleModelFileUpload(e);
              setShowThumbnailUpload(true);
            }}
          />
        </div>

        {modelErr && <p className='error'>{modelErr}</p>}

        {modelPath && previewFilePath && modelPath.endsWith('.glb') && (
          <div className='model-preview'>
            <p>3D Model Preview:</p>
            <div>
              <ThreeViewport
                key={previewFilePath}
                modelPath={previewFilePath.toString()}
                rotationSetting={null}
                setRotationSetting={undefined}
                translationSetting={null}
                setTranslationSetting={undefined}
              />
            </div>
          </div>
        )}
      </div>

      {showThumbnailUpload && modelPath && modelPath.endsWith('.glb') && (
        <div className='form-section media-section'>
          <h3>Thumbnail Image</h3>
          <p>Upload a thumbnail image to represent your 3D model</p>
          <div className='file-upload'>
            <input type='file' accept='image/*' onChange={handleThumbnailFileUpload} />
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
        disabled={(!modelPath && !mediaUrl) || (modelPath?.endsWith('.glb') && !thumbnailPath)}>
        Add to Portfolio
      </button>
    </div>
  );
};

export default UploadPortfolioModel;
