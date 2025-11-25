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
        <label htmlFor='title'>Project Title</label>
        <input
          id='title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Give your piece a name'
        />
        {titleErr && <p className='error'>{titleErr}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='description'>Project Description</label>
        <textarea
          id='description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='Describe your project, techniques used, etc.'
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

      {showThumbnailUpload &&
        modelPath &&
        (modelPath.endsWith('.glb') || modelPath.endsWith('.mp4')) && (
          <div className='form-section media-section'>
            <h3>Thumbnail Image</h3>
            <p>Upload a thumbnail image to represent your media</p>
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

      {/* Show thumbnail upload for YouTube/Vimeo */}
      {mediaUrl && /youtube\.com|youtu\.be|vimeo\.com/.test(mediaUrl) && (
        <div className='form-section media-section'>
          <h3>Thumbnail Image (Required)</h3>
          <p>Upload a thumbnail for this video embed</p>
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
        disabled={(() => {
          // Must have either file or URL
          if (!modelPath && !mediaUrl) return true;

          // Check if thumbnail is required
          const needsThumbnail =
            modelPath?.endsWith('.glb') ||
            modelPath?.endsWith('.mp4') ||
            (mediaUrl && /youtube\.com|youtu\.be|vimeo\.com/.test(mediaUrl));

          // If thumbnail needed but not provided, disable
          if (needsThumbnail && !thumbnailPath) return true;

          return false;
        })()}>
        Add to Portfolio
      </button>
    </div>
  );
};

export default UploadPortfolioModel;
