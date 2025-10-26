import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({ comments, handleAddComment }: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);
  const [mediaUrl, setMediaUrl] = useState<string>('');

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
      mediaUrl
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
    setMediaUrl('');
  };

  // Function to detect Image, YouTube or Vimeo URLs and return embed iframe
  const renderEmbeddedMedia = (text: string) => {
    // Image URL
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const imageMatch = text.match(imageRegex);
    if (imageMatch) {
      return <img src={imageMatch[0]} alt="user-uploaded" className="comment-image" />;
    }

    // YouTube URL
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = text.match(ytRegex);
    if (ytMatch) {
      return (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }

    // Vimeo URL
    const vimeoRegex = /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/;
    const vimeoMatch = text.match(vimeoRegex);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          width="560"
          height="315"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        ></iframe>
      );
    }

    return null;
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
              <div className='input-row'>
                <input
                  type='text'
                  placeholder='Optional media URL (image, YouTube, Vimeo)'
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  className='comment-media-input'
                />
              </div>


              <button className='add-comment-button' onClick={handleAddCommentClick}>
                Add Comment
              </button>
            </div>
            {textErr && <small className='error'>{textErr}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
