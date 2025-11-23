import { ChangeEvent, useRef, useState } from 'react';
import useNewQuestion from '../../../hooks/useNewQuestion';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import ThreeViewport from '../threeViewport';

/**
 * NewQuestion component allows users to submit a new question with:
 * - Title
 * - Question details (text)
 * - Tags
 * - Community selection
 * - Optional media (embedded URL or uploaded file)
 *
 * The component validates the form fields and posts the question using
 * the `useNewQuestion` hook. It also handles media input changes and file uploads.
 */
const NewQuestion = () => {
  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    community,
    titleErr,
    textErr,
    tagErr,
    mediaErr,
    setMediaErr,
    mediaUrl,
    setMediaUrl,
    mediaPath,
    setUploadedMediaPath,
    setMediaSize,
    postQuestion,
    communityList,
    handleDropdownChange,
    handleFileChange,
    handleDrop,
    handleDragOver,
  } = useNewQuestion();

  const { user: currentUser } = useUserContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rotationSetting, setRotationSetting] = useState<number[] | null>(null);
  const [translationSetting, setTranslationSetting] = useState<number[] | null>(null);

  /**
   * Handles changes to the media URL input.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event triggered by the input.
   */
  const handleMediaUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMediaUrl(e.target.value);
  };

  /**
   * Handles adding the media URL to the question.
   * Clears any previously uploaded media if an embed URL is added.
   */
  const handleAddMedia = () => {
    if (mediaUrl) {
      setUploadedMediaPath(undefined);
      setMediaSize(undefined);
    }
  };

  const handleAddCameraRef = () => {
    let translationSettingToSend = translationSetting;
    let rotatationSettingToSend = rotationSetting;

    if (!translationSetting) {
      translationSettingToSend = [0, 0.77, 3.02];
    }
    if (!rotationSetting) {
      rotatationSettingToSend = [0, 0, 0];
    }

    const tempText = text;
    const [tx, ty, tz] = translationSettingToSend!.map(v => Number(v.toFixed(2))); // round to 2 decimal places
    const [rx, ry, rz] = rotatationSettingToSend!.map(v => Number(v.toFixed(2))); // round to 2 decimal places
    setText(tempText + ' #camera' + '-' + `t(${tx},${ty},${tz})` + '-' + `r(${rx},${ry},${rz})`);
  };

  /**
   * Handles file uploads for media attachments.
   * Calls `handleFileChange` from the hook and uploads the file to the backend.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event triggered by the file input.
   * @returns {Promise<void>} - Resolves after upload handling is complete.
   */
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedMediaPath(undefined);
    setMediaSize(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';

    handleFileChange(e);

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.glb'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setMediaErr('Unsupported file type');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', currentUser.username);
      formData.append('filepathLocation', file.name);

      const res = await fetch('/api/media/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data?.filepathLocation) {
        setUploadedMediaPath(data.filepathLocation);
        if (data.fileSize) {
          setMediaSize(data.fileSize);
        }
        setMediaErr(null);
      } else {
        setMediaErr('Upload failed');
      }
    } catch (err) {
      setMediaErr('Error uploading file');
    }
  };

  return (
    <div className='new-question-container'>
      <h2>Ask a New Question</h2>

      <div className='form-section'>
        <label htmlFor='title'>Title</label>
        <input
          id='title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Enter your question title'
        />
        {titleErr && <p className='error'>{titleErr}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='text'>Question Details</label>
        <textarea
          id='text'
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder='Describe your question in detail'
        />
        {textErr && <p className='error'>{textErr}</p>}

        {/* Provide ability to add a camera reference if the mediaPath ends with .glb */}
        {mediaPath?.endsWith('.glb') && (
          <button
            type='button'
            onClick={() => {
              handleAddCameraRef();
            }}>
            Add Camera Reference
          </button>
        )}
      </div>

      <div className='form-section'>
        <label htmlFor='tags'>Tags</label>
        <input
          id='tags'
          type='text'
          value={tagNames}
          onChange={e => setTagNames(e.target.value)}
          placeholder='space-separated tags (e.g., javascript react)'
        />
        {tagErr && <p className='error'>{tagErr}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='community'>Community</label>
        <select
          id='community'
          onChange={handleDropdownChange}
          value={community?._id.toString() ?? ''}>
          <option value=''>Select a community</option>
          {communityList.map(com => (
            <option key={com._id.toString()} value={com._id.toString()}>
              {com.name}
            </option>
          ))}
        </select>
      </div>

      <div className='form-section media-section'>
        <h3>Media</h3>

        <div className='media-inputs'>
          <input
            type='text'
            placeholder='Paste media URL (YouTube, image, etc.)'
            value={mediaUrl}
            onChange={handleMediaUrlChange}
          />
          <button type='button' onClick={handleAddMedia}>
            Add Embed
          </button>
        </div>

        <div className='file-upload drag-drop-area' onDrop={handleDrop} onDragOver={handleDragOver}>
          <label className='file-label'>
            {fileInputRef.current?.files?.[0]?.name || 'Drag & drop a file or click to choose'}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*,video/*,.glb'
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {mediaErr && <p className='error'>{mediaErr}</p>}

        <div className='media-preview'>
          {/* Embedded URL preview */}
          {mediaUrl && (
            <div className='embed-preview'>
              <p>Embed Preview:</p>
              {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={mediaUrl} alt='Embedded media' />
              ) : (
                (() => {
                  let embedUrl = mediaUrl;
                  const youtubeMatch = mediaUrl.match(
                    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                  );
                  if (youtubeMatch) embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                  const vimeoMatch = mediaUrl.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;

                  return (
                    <iframe
                      src={embedUrl}
                      title='media-embed'
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                    />
                  );
                })()
              )}
              <button
                type='button'
                className='delete-media-btn'
                onClick={() => {
                  setMediaUrl('');
                  setUploadedMediaPath(undefined);
                  setMediaSize(undefined);
                }}>
                Remove
              </button>
            </div>
          )}

          {/* Uploaded 3D model */}
          {mediaPath?.endsWith('.glb') && (
            <div className='model-preview'>
              <p>3D Model Preview:</p>
              <ThreeViewport
                key={mediaPath}
                modelPath={mediaPath.toString()}
                rotationSetting={rotationSetting}
                setRotationSetting={setRotationSetting}
                translationSetting={translationSetting}
                setTranslationSetting={setTranslationSetting}
              />
              <button
                type='button'
                className='delete-media-btn'
                onClick={() => {
                  setUploadedMediaPath(undefined);
                  setMediaSize(undefined);
                }}>
                Remove
              </button>
            </div>
          )}

          {/* Uploaded image or video */}
          {mediaPath && !mediaPath.endsWith('.glb') && (
            <div className='uploaded-preview'>
              <p>File Preview:</p>

              {mediaPath.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                <img src={mediaPath} alt='Uploaded media' />
              ) : mediaPath.match(/\.(mp4|webm|ogg)$/i) ? (
                <video controls>
                  <source src={mediaPath} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
              ) : null}

              <button
                type='button'
                className='delete-media-btn'
                onClick={async () => {
                  try {
                    await fetch('/api/media/delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ filepathLocation: mediaPath }),
                    });
                  } catch (err) {
                    /* eslint-disable no-console */
                    console.warn('Optional: could not delete file on server', err);
                  }
                  setUploadedMediaPath(undefined);
                  setMediaSize(undefined);
                }}>
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <button className='submit-btn' onClick={postQuestion}>
        Post Question
      </button>
    </div>
  );
};

export default NewQuestion;
