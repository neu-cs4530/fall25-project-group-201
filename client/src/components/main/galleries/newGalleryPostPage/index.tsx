import { ChangeEvent } from 'react';
import useNewQuestion from '../../../../hooks/useNewQuestion';
import './index.css';
import useUserContext from '../../../../hooks/useUserContext';
import ThreeViewport from '../../threeViewport';

const NewGalleryPostPage = () => {
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
    postQuestion,
    communityList,
    handleDropdownChange,
    handleFileChange,
  } = useNewQuestion();

  const { user: currentUser } = useUserContext();

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
    }
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
      <h2>Create A New Gallery Post</h2>

      <div className='form-section'>
        <label htmlFor='title'>Title</label>
        <input
          id='title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Give a name to your project'
        />
        {titleErr && <p className='error'>{titleErr}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='text'>Project Description</label>
        <textarea
          id='text'
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder='Share more details about your project'
        />
        {textErr && <p className='error'>{textErr}</p>}
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

        <div className='file-upload'>
          <input type='file' accept='image/*,video/*,.glb' onChange={handleFileUpload} />
        </div>

        {mediaErr && <p className='error'>{mediaErr}</p>}

        <div className='media-preview'>
          {mediaUrl && (
            <div className='embed-preview'>
              <p>Preview:</p>
              {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={mediaUrl} alt='Embedded media' />
              ) : (
                (() => {
                  let embedUrl = mediaUrl;

                  const youtubeMatch = mediaUrl.match(
                    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                  );
                  if (youtubeMatch) {
                    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                  }

                  const vimeoMatch = mediaUrl.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch) {
                    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                  }

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
            </div>
          )}

          {mediaPath?.endsWith('.glb') && (
            <div className='model-preview'>
              <p>3D Model Preview:</p>
              <div>
                <ThreeViewport key={mediaPath} modelPath={mediaPath.toString()} />
              </div>
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

export default NewGalleryPostPage;
