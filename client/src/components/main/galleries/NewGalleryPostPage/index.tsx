import { ChangeEvent, useState } from 'react';
import './index.css';
import useUserContext from '../../../../hooks/useUserContext';
import ThreeViewport from '../../threeViewport';
import useNewGalleryPost from '../../../../hooks/useNewGalleryPost';
import { GALLERY_TAGS, GalleryTag } from '../../../../types/galleryTags';

/**
 * Component to display a form for creating a new gallery post.
 *
 * Includes inputs for:
 * - Title
 * - Description
 * - Optional media URL embed (YouTube, Vimeo, image)
 * - File upload for media (image, video, or .glb 3D models)
 * - Thumbnail upload if media is a .glb
 *
 * Shows error messages for:
 * - Empty required fields
 * - Invalid URLs
 * - Missing thumbnail for .glb files
 *
 * Provides a button to post the project to the gallery.
 *
 * @returns React component
 */
const NewGalleryPostPage = () => {
  const {
    form,
    errors,
    postGalleryPost,
    handleFileChange,
    handleThumbnailFileChange,
    handleInputChange,
    toggleTag,
  } = useNewGalleryPost();
  const { user: currentUser } = useUserContext();
  const [previewFilePath, setPreviewFilePath] = useState<string | undefined>();

  const handleAddMedia = () => {
    if (form.mediaUrl) {
      handleInputChange('mediaPath')({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
      handleInputChange('mediaSize')({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    }
  };

  /**
   * Resets mediaPath and mediaSize when an embed URL is added.
   */
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileChange(e);
    const tempFileUrl = URL.createObjectURL(file);
    setPreviewFilePath(tempFileUrl);

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.glb'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) return;

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
        handleInputChange('mediaPath')({
          target: { value: data.filepathLocation },
        } as ChangeEvent<HTMLInputElement>);
        if (data.fileSize)
          handleInputChange('mediaSize')({
            target: { value: data.fileSize },
          } as ChangeEvent<HTMLInputElement>);
      }
    } catch {
      // intentionally empty
    }
  };

  /**
   * Handles file upload for media files.
   * Updates form state and sets a temporary preview URL.
   * Only accepts .png, .jpg, .jpeg, .mp4, and .glb files.
   *
   * @param e ChangeEvent<HTMLInputElement> - File input change event
   */
  const handleThumbnailFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    handleThumbnailFileChange(e);

    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) return;

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
        handleInputChange('thumbnailMediaPath')({
          target: { value: data.filepathLocation },
        } as ChangeEvent<HTMLInputElement>);
      }
    } catch {
      // intentionally empty
    }
  };

  return (
    <div className='new-question-container'>
      <h2>Create A New Gallery Post</h2>
      {errors.community && <p className='error'>{errors.community}</p>}

      <div className='form-section'>
        <label htmlFor='title'>Title</label>
        <input
          id='title'
          type='text'
          value={form.title}
          onChange={handleInputChange('title')}
          placeholder='Give a name to your project'
        />
        {errors.title && <p className='error'>{errors.title}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='text'>Project Description</label>
        <textarea
          id='text'
          value={form.description}
          onChange={handleInputChange('description')}
          placeholder='Share more details about your project'
        />
        {errors.description && <p className='error'>{errors.description}</p>}
      </div>

      <div className='form-section'>
        <label>Tags</label>
        <div className='tags-container'>
          {GALLERY_TAGS.map((tag: GalleryTag) => (
            <label key={tag} className='tag-checkbox'>
              <input
                type='checkbox'
                checked={form.tags.includes(tag)}
                onChange={() => toggleTag(tag)}
              />
              {tag.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
        {errors.tags && <p className='error'>{errors.tags}</p>}
      </div>

      <div className='form-section'>
        <label htmlFor='projectLink'>Project Link (GitHub, etc.)</label>
        <input
          id='projectLink'
          type='text'
          placeholder='Paste your project link here'
          value={form.projectLink}
          onChange={handleInputChange('projectLink')}
        />
        {errors.projectLink && <p className='error'>{errors.projectLink}</p>}
      </div>

      <div className='form-section media-section'>
        <h3>Media</h3>
        <div className='media-inputs'>
          <input
            type='text'
            placeholder='Paste media URL (YouTube, image, etc.)'
            value={form.mediaUrl}
            onChange={handleInputChange('mediaUrl')}
          />
          <button type='button' onClick={handleAddMedia}>
            Add Embed
          </button>
        </div>

        <div className='file-upload'>
          <input type='file' accept='image/*,video/*,.glb' onChange={handleFileUpload} />
        </div>
        {errors.media && <p className='error'>{errors.media}</p>}

        <div className='media-preview'>
          {form.mediaUrl && (
            <div className='embed-preview'>
              <p>Preview:</p>
              {form.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={form.mediaUrl} alt='Embedded media' />
              ) : (
                (() => {
                  let embedUrl = form.mediaUrl;
                  const youtubeMatch = form.mediaUrl.match(
                    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                  );
                  if (youtubeMatch) embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                  const vimeoMatch = form.mediaUrl.match(/vimeo\.com\/(\d+)/);
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
            </div>
          )}

          {form.mediaPath?.endsWith('.glb') && (
            <>
              <h3>Add Thumbnail</h3>
              <div className='file-upload'>
                <input type='file' accept='image/*' onChange={handleThumbnailFileUpload} />
              </div>
              {errors.thumbnailMedia && <p className='error'>{errors.thumbnailMedia}</p>}
              <div className='model-preview'>
                <p>3D Model Preview:</p>
                <div>
                  {previewFilePath && (
                    <ThreeViewport
                      key={previewFilePath}
                      modelPath={previewFilePath.toString()}
                      rotationSetting={null}
                      setRotationSetting={undefined}
                      translationSetting={null}
                      setTranslationSetting={undefined}
                    />
                  )}
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
