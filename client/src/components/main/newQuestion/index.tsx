import { ChangeEvent } from 'react';
import useNewQuestion from '../../../hooks/useNewQuestion';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

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

        <div className='file-upload'>
          <input type='file' accept='image/*,video/*,audio/*' onChange={handleFileUpload} />
        </div>

        {mediaErr && <p className='error'>{mediaErr}</p>}

        <div className='media-preview'>
          {mediaUrl && (
            <div className='embed-preview'>
              <p>Embed Preview:</p>
              {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={mediaUrl} alt='Embedded media' />
              ) : (
                <iframe
                  src={mediaUrl}
                  title='media-embed'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              )}
            </div>
          )}

          {mediaPath && (
            <div className='upload-preview'>
              <p>Uploaded File:</p>
              <a href={mediaPath} target='_blank' rel='noopener noreferrer'>
                {mediaPath}
              </a>
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
