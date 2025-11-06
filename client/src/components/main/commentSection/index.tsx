import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { FaLink } from 'react-icons/fa';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  handleAddMedia: (file: File) => Promise<string | undefined>;
  handleAddMediaError: string | null;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
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

  /**
   * Validate whether a string is a valid media URL.
   * Supports image URLs, YouTube, and Vimeo links.
   */
  function isValidMediaUrl(url: string): boolean {
    if (!url) return false;

    try {
      const parsed = new URL(url);

      // Allowed protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;

      // Image file extensions
      const imagePattern = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
      if (imagePattern.test(parsed.pathname)) return true;

      // YouTube URL patterns
      const youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)/i;
      if (youtubePattern.test(url)) return true;

      // Vimeo URL pattern
      const vimeoPattern = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/\d+/i;
      if (vimeoPattern.test(url)) return true;

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = async () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    setTextErr('');
    setMediaError(null);

    let tempMediaPath: string | undefined;

    // Upload file if present
    if (file) {
      tempMediaPath = await handleAddMedia(file);
      if (!tempMediaPath) {
        setMediaError('Failed to upload media');
        return;
      }
    }

    if (mediaUrl) {
      if (!isValidMediaUrl(mediaUrl)) {
        setMediaError('Media URL is invalid');
        return;
      }
      setMediaUrl(mediaUrl);
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
      ...(file ? { mediaPath: tempMediaPath } : {}),
      ...(mediaUrl ? { mediaUrl: mediaUrl } : {}),
    };

    handleAddComment(newComment);

    setText('');
    setMediaUrl('');
  };

  // Function to detect Image, YouTube or Vimeo URLs and return embed iframe
  const renderEmbeddedMedia = (text: string) => {
    // Image URL
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const imageMatch = text.match(imageRegex);
    if (imageMatch) {
      return <img src={imageMatch[0]} alt='user-uploaded' className='comment-image' />;
    }

    // YouTube URL
    const ytRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = text.match(ytRegex);
    if (ytMatch) {
      return (
        <iframe
          width='560'
          height='315'
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title='YouTube video player'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen></iframe>
      );
    }

    // Vimeo URL
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

    return <div className='comment-media'>Error embedding URL: {text}</div>;
  };

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // store the selected file
    }
  };

  const isVideo = (mediaPath: string) => {
    return mediaPath.endsWith('.mp4');
  };

  return (
    <div className='comment-section'>
      <button className='toggle-button' onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {showComments && (
        <div className='comments-container'>
          <ul className='comments-list'>
            {comments.length > 0 ? (
              comments.map(comment => (
                <li key={String(comment._id)} className='comment-item'>
                  <div className='comment-text'>
                    <Markdown remarkPlugins={[remarkGfm]}>{comment.text}</Markdown>
                    {comment.mediaUrl && renderEmbeddedMedia(comment.mediaUrl)}
                    {comment.mediaPath &&
                      (isVideo(comment.mediaPath) ? (
                        <video src={comment.mediaPath} controls className='comment-media' />
                      ) : (
                        <img src={comment.mediaPath} alt='Loading...' className='comment-media' />
                      ))}
                  </div>
                  <small className='comment-meta'>
                    {comment.commentBy}, {getMetaData(new Date(comment.commentDateTime))}
                  </small>
                </li>
              ))
            ) : (
              <p className='no-comments'>No comments yet.</p>
            )}
          </ul>

          <div className='add-comment'>
            <div className='input-row'>
              <textarea
                placeholder='Comment'
                value={text}
                onChange={e => setText(e.target.value)}
                className='comment-textarea'
              />

              {/* Media button */}
              <div
                className='media-button-wrapper'
                style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type='button'
                  className='media-button'
                  onClick={() => setShowMediaInput(!showMediaInput)}>
                  <FaLink />
                </button>

                {/* Popup input above button */}
                {showMediaInput && (
                  <div
                    className='media-popup'
                    style={{
                      position: 'absolute',
                      bottom: '100%', // popup above the button
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: '8px',
                      backgroundColor: 'white',
                      padding: '6px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      zIndex: 10,
                    }}>
                    <input
                      type='text'
                      placeholder='Paste image/YouTube/Vimeo link'
                      value={mediaUrl}
                      onChange={e => setMediaUrl(e.target.value)}
                      className='comment-media-input'
                      style={{ width: '200px', padding: '4px' }}
                    />
                  </div>
                )}
              </div>

              <button className='add-comment-button' onClick={handleAddCommentClick}>
                Add Comment
              </button>
            </div>
            <div>
              <input type='file' onChange={handleFileChange} />
            </div>
            {handleAddMediaError && <small className='error'>{handleAddMediaError}</small>}
            {mediaError && <small className='error'>{mediaError}</small>}
            {textErr && <small className='error'>{textErr}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
