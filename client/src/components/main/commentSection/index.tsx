import { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment, DatabaseMedia } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { FaLink } from 'react-icons/fa';
import ThreeViewport from '../threeViewport';
import { Download } from 'lucide-react';

/**
 * Interface representing the props for the Comment Section component.
 *
 * @property comments - List of all comments to be displayed.
 * @property handleAddComment - Function that handles adding a new comment to the thread.
 * @property handleAddMedia - Function that uploads a media file and returns its hosted URL.
 * @property handleAddMediaError - Error message string for media upload failures.
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  handleAddMedia: (file: File) => Promise<DatabaseMedia | undefined>;
  handleAddMediaError: string | null;
}

/**
 * CommentSection component displays all existing comments for a post and
 * allows authenticated users to add text and media comments.
 *
 * @component
 * @param {DatabaseComment[]} comments - Array of existing comments to display.
 * @param {(comment: Comment) => void} handleAddComment - Function called to post a new comment.
 * @param {(file: File) => Promise<DatabaseMedia | undefined>} handleAddMedia - Function that uploads media files.
 * @param {string | null} handleAddMediaError - Error message for media upload issues.
 * @returns A rendered comment section with media upload and markdown support.
 */
const CommentSection = ({
  comments,
  handleAddComment,
  handleAddMedia,
  handleAddMediaError,
}: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);
  const [mediaUrl, setMediaUrl] = useState<string>(''); // for embedded links
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rotationSetting, setRotationSetting] = useState<number[] | null>(null);
  const [translationSetting, setTranslationSetting] = useState<number[] | null>(null);
  let tempMediaPath: string | undefined;
  let mediaSize: string | undefined;

  /**
   * Validates whether a provided string is a valid media URL.
   * Supports image formats, YouTube, and Vimeo links.
   *
   * @param url - The URL string to validate.
   * @returns True if the URL matches a supported media pattern, otherwise false.
   */
  function isValidMediaUrl(url: string): boolean {
    if (!url) return false;

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;

      const imagePattern = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
      if (imagePattern.test(parsed.pathname)) return true;

      const youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)/i;
      if (youtubePattern.test(url)) return true;

      const vimeoPattern = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/\d+/i;
      if (vimeoPattern.test(url)) return true;

      return false;
    } catch {
      return false;
    }
  }

  const handleDownload = (mediaSize: string, extension: string) => {
    const confirmed = window.confirm(
      `This file is ${mediaSize}. Are you sure you want to download this .${extension} file?`,
    );
    if (!confirmed) return;

    {
      /* Logic for downloading the file */
    }
  };

  function getExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    if (lastDot === -1) return '';
    return path.slice(lastDot + 1).toLowerCase();
  }

  /**
   * Handles the posting of a new comment.
   * Validates input, uploads media if attached, and resets input state on success.
   */
  const handleAddCommentClick = async () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    setTextErr('');
    setMediaUrl('');
    setMediaError(null);

    if (file) {
      const resMedia = await handleAddMedia(file);
      if (!resMedia) {
        setMediaError('Failed to upload media');
        return;
      }

      if (!resMedia.filepathLocation) {
        setMediaError('Filepath location of media is undefined.');
        return;
      }

      tempMediaPath = resMedia.filepathLocation;

      if (!resMedia.fileSize) {
        setMediaError('Media size is undefined');
        return;
      }

      mediaSize = resMedia.fileSize;
    }

    if (mediaUrl) {
      if (!isValidMediaUrl(mediaUrl)) {
        setMediaError('Media URL is invalid');
        return;
      }
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
      ...(file ? { mediaPath: tempMediaPath } : {}),
      ...(mediaUrl ? { mediaUrl: mediaUrl } : {}),
      ...(mediaSize ? { mediaSize: mediaSize } : {}),
    };

    await handleAddComment(newComment);

    setText('');
    setMediaUrl('');
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (typeof window !== 'undefined') {
      const commentContainer = document.querySelector('.comments-container');
      commentContainer?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Renders embedded media elements such as images, YouTube, or Vimeo videos
   * when a valid URL is detected in a comment.
   *
   * @param text - The comment text that may contain a media URL.
   * @returns A JSX element representing the embedded media.
   */
  const renderEmbeddedMedia = (text: string) => {
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const imageMatch = text.match(imageRegex);
    if (imageMatch) {
      return <img src={imageMatch[0]} alt='user-uploaded' className='comment-image' />;
    }

    const ytRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = text.match(ytRegex);
    if (ytMatch) {
      return (
        <iframe
          id='comment-iframe'
          width='560'
          height='315'
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title='YouTube video player'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen></iframe>
      );
    }

    const vimeoRegex = /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/;
    const vimeoMatch = text.match(vimeoRegex);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          width='560'
          height='315'
          frameBorder='0'
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
          title='Vimeo video player'></iframe>
      );
    }

    return (
      <div className='comment-media' id='comment-media'>
        Error embedding URL: {text}
      </div>
    );
  };

  /**
   * Handles file selection from the file input element.
   *
   * @param e - The file input change event.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // store the selected file
    }
  };

  /**
   * Clears the selected file or entered media URL,
   * resetting the input state and error messages.
   */
  const handleDeleteMedia = () => {
    setFile(null);
    setMediaUrl('');
    setMediaError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='comment-section' id='comment-section'>
      <button className='toggle-button' onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {showComments && (
        <div className='comments-container' id='comments-container'>
          <div className='add-comment'>
            <div className='input-row'>
              <textarea
                placeholder='Write a comment...'
                value={text}
                onChange={e => setText(e.target.value)}
                className='comment-textarea'
                id='comment-textarea'
              />
              <button
                className='add-comment-button'
                id='add-comment-button'
                onClick={handleAddCommentClick}>
                Post
              </button>
            </div>

            <div className='media-actions'>
              <button
                type='button'
                className='media-button'
                id='media-button'
                onClick={() => setShowMediaInput(!showMediaInput)}>
                <FaLink />
              </button>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
                className='file-input'
                id='file-input'
              />

              {(file || mediaUrl) && (
                <button type='button' className='delete-media-button' onClick={handleDeleteMedia}>
                  ✕ Remove Media
                </button>
              )}

              {showMediaInput && (
                <div className='media-popup'>
                  <input
                    type='text'
                    placeholder='Paste image/YouTube/Vimeo link'
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className='comment-media-input'
                    id='comment-media-input'
                  />
                </div>
              )}
            </div>
            {handleAddMediaError && <small className='error'>{handleAddMediaError}</small>}
            {mediaError && <small className='error'>{mediaError}</small>}
            {textErr && <small className='error'>{textErr}</small>}
          </div>

          <ul className='comments-list' id='comments-list'>
            {comments.length > 0 ? (
              comments.map(comment => (
                <li key={String(comment._id)} className='comment-item'>
                  <div className='comment-text' id='comment-text'>
                    <Markdown remarkPlugins={[remarkGfm]}>{comment.text}</Markdown>
                    {comment.mediaUrl && renderEmbeddedMedia(comment.mediaUrl)}

                    {comment.mediaPath &&
                      (() => {
                        const path = comment.mediaPath.toLowerCase();
                        if (path.endsWith('.glb')) {
                          return (
                            <div className='comment-model-wrapper'>
                              <ThreeViewport
                                key={comment.mediaPath}
                                modelPath={comment.mediaPath}
                                rotationSetting={rotationSetting}
                                setRotationSetting={setRotationSetting}
                                translationSetting={translationSetting}
                                setTranslationSetting={setTranslationSetting}
                              />
                            </div>
                          );
                        } else if (['.mp4', '.webm', '.ogg'].some(ext => path.endsWith(ext))) {
                          return (
                            <video src={comment.mediaPath} controls className='comment-media' />
                          );
                        } else {
                          return (
                            <img src={comment.mediaPath} alt='media' className='comment-media' />
                          );
                        }
                      })()}
                  </div>
                  <small className='comment-meta'>
                    {comment.mediaPath && comment.mediaSize && (
                      <Download
                        className='comment-download-icon'
                        size={20}
                        onClick={() =>
                          handleDownload(comment.mediaSize!, getExtension(comment.mediaPath!))
                        }
                        style={{ cursor: 'pointer' }}
                        color='blue'
                      />
                    )}
                    {comment.commentBy}, {getMetaData(new Date(comment.commentDateTime))}
                  </small>
                </li>
              ))
            ) : (
              <p className='no-comments'>No comments yet.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
