import { ChangeEvent, useState } from 'react';
import './index.css';
import useUserContext from '../../../../hooks/useUserContext';
import ThreeViewport from '../../threeViewport';
import useNewGalleryPost from '../../../../hooks/useNewGalleryPost';
import { GALLERY_TAGS, GalleryTag } from '../../../../types/galleryTags';
import PermissionCheckbox from '../../baseComponents/permissionCheckbox';

/**
 * Component to display a form for creating a new gallery post
 * @returns A React component that includes:
 * - Inputs to enter the title, description, and optional media URL to embed
 * - Inputs to upload a media file
 * - If media file is a .glb, there is an input to upload a thumbnail media file
 * - Error messages displayed if there is no title, description, media URL or media file upload
 * - Error message displayed if the media file is a .glb and no thumbnail media file uploaded
 * - Post Project to Gallery button to upload the gallery post
 */
const NewGalleryPostPage = () => {
  const {
    title,
    setTitle,
    text,
    setText,
    titleErr,
    textErr,
    mediaErr,
    setMediaErr,
    thumbnailMediaErr,
    setThumbnailMediaErr,
    communityErr,
    mediaUrl,
    setMediaUrl,
    mediaPath,
    setUploadedMediaPath,
    setUploadedThumbnailMediaPath,
    setMediaSize,
    postGalleryPost,
    handleFileChange,
    handleThumbnailFileChange,
    tags,
    tagErr,
    toggleTag,
    downloadPermission,
    setDownloadPermission,
  } = useNewGalleryPost();

  const { user: currentUser } = useUserContext();
  const [previewFilePath, setPreviewFilePath] = useState<string | undefined>();

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

    const tempFileUrl = URL.createObjectURL(file);
    setPreviewFilePath(tempFileUrl);

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

  /**
   * Handles file uploads for thumbnail media attachments.
   * Calls `handleFileChange` from the hook and uploads the file to the backend.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event triggered by the file input.
   * @returns {Promise<void>} - Resolves after upload handling is complete.
   */
  const handleThumbnailFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleThumbnailFileChange(e);

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setThumbnailMediaErr('Unsupported file type');
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
        setUploadedThumbnailMediaPath(data.filepathLocation);
        setThumbnailMediaErr(null);
      } else {
        setThumbnailMediaErr('Thumbnail upload failed');
      }
    } catch (err) {
      setThumbnailMediaErr('Error uploading thumbnail file');
    }
  };

  return (
    <div className='new-question-container'>
      <h2>Create A New Gallery Post</h2>
      {communityErr && <p className='error'>{communityErr}</p>}
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

      <div className='form-section'>
        <label>Tags</label>
        <div className='tags-container'>
          {GALLERY_TAGS.map((tag: GalleryTag) => (
            <label key={tag} className='tag-checkbox'>
              <input type='checkbox' checked={tags.includes(tag)} onChange={() => toggleTag(tag)} />
              {tag.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
        {tagErr && <p className='error'>{tagErr}</p>}
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
            <>
              <h3>Add Thumbnail</h3>
              <div className='file-upload'>
                <input
                  type='file'
                  accept='image/*,video/*,.glb'
                  onChange={handleThumbnailFileUpload}
                />
              </div>
              {thumbnailMediaErr && <p className='error'>{thumbnailMediaErr}</p>}
              <div className='model-preview'>
                <p>3D Model Preview:</p>
                <div>
                  {previewFilePath && (
                    <ThreeViewport key={previewFilePath} modelPath={previewFilePath.toString()} />
                  )}
                  <PermissionCheckbox permission={downloadPermission} setPermission={setDownloadPermission}/>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button className='submit-btn' onClick={postGalleryPost}>
        Post Project To Gallery
      </button>
    </div>
  );
};

export default NewGalleryPostPage;
