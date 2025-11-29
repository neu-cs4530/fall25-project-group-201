import { useEffect, useState } from 'react';
import useUserContext from '../../../../hooks/useUserContext';
import { getCommentMedia, toggleMediaPermission } from '../../../../services/commentService';
import { DatabaseComment } from '@fake-stack-overflow/shared';
import './index.css';
import { Download } from 'lucide-react';

interface CommentPermissionButtonProps {
  comment: DatabaseComment;
}

const CommentPermissionButton = ({ comment }: CommentPermissionButtonProps) => {
  const { user } = useUserContext();
  const [downloadQuestionPermission, setDownloadQuestionPermission] = useState<
    boolean | undefined
  >();
  const isAuthor = comment.commentBy === user.username;

  const handleToggleCommentPermission = async (): Promise<void> => {
    try {
      const updatedPermission = await toggleMediaPermission(comment._id.toString(), user.username);
      setDownloadQuestionPermission(updatedPermission);
    } catch (error) {
      window.alert('Something went wrong with changing the download permission');
    }
  };

  /**
   * Fetches the full question data when the question ID or user changes.
   */
  useEffect(() => {
    /**
     * Fetches the question data by its ID from the server.
     *
     * @async
     * @function
     * @returns {Promise<void>}
     */
    const fetchData = async (): Promise<void> => {
      try {
        setDownloadQuestionPermission(comment.permitDownload);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching question:', error);
      }
    };

    fetchData();
  }, [comment, user.username]);

  /**
   * Handles logic when download button is clicked, requesting confirmation
   * @param mediaSize of the media
   * @param extension of the media file
   * @param cid - comment ID
   * @returns
   */
  const handleDownload = async (mediaSize: string, extension: string, cid: string) => {
    const confirmed = window.confirm(
      `This file is ${mediaSize}. Are you sure you want to download this .${extension} file?`,
    );
    if (!confirmed) return;

    try {
      const mediaPath = await getCommentMedia(cid);

      const link = document.createElement('a');
      link.href = mediaPath;
      link.download = `file.${extension}`;
      link.click();
    } catch (error) {
      window.alert('Something went wrong with downloading the file');
    }
  };

  /**
   * Gets extension of the file
   * @param path of the media file
   * @returns
   */
  function getExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    if (lastDot === -1) return '';
    return path.slice(lastDot + 1).toLowerCase();
  }

  return (
    <>
      {isAuthor && comment.mediaSize && (
        <button
          type='button'
          className={`download-permission-comment-btn ${downloadQuestionPermission ? 'enabled' : 'disabled'}`}
          onClick={() => {
            handleToggleCommentPermission();
          }}>
          {downloadQuestionPermission ? '✓ Downloads Allowed' : '✕ Downloads Off'}
        </button>
      )}
      {downloadQuestionPermission && comment.mediaPath && comment.mediaSize && (
        <>
        <div className='download-actions'>
          Download file
          <Download
            className='comment-download-icon'
            size={20}
            onClick={() =>
              handleDownload(
                comment.mediaSize!,
                getExtension(comment.mediaPath!),
                String(comment._id),
              )
            }
            style={{ cursor: 'pointer' }}
            color='#007BFF'
          />
        </div>
        <div className='media-file-info'>
          <span className='infoChip'>{getExtension(comment.mediaPath!)}</span>
          <span className='infoChip'>{comment.mediaSize}</span>
        </div>
        </>
      )}
      {!downloadQuestionPermission && comment.mediaPath && comment.mediaSize && (
        <div className='download-disabled'>Download disabled</div>
      )}
    </>
  );
};

export default CommentPermissionButton;
