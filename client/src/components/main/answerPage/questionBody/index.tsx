import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ThreeViewport from '../../threeViewport';
import './index.css';
import { Download } from 'lucide-react';
import { getQuestionMedia } from '../../../../services/questionService';
import useUserContext from '../../../../hooks/useUserContext';
import useAnswerPage from '../../../../hooks/useAnswerPage';
import { useState } from 'react';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 * - mediaUrl: The url string of the embedded media file.
 * - mediaPath: The file path of the uploaded media file.
 */
interface QuestionBodyProps {
  qid: string;
  views: number;
  text: string;
  askby: string;
  meta: string;
  mediaPath?: string;
  mediaUrl?: string;
  mediaSize?: string;
}

const handleDownload = async (mediaSize: string, extension: string, qid: string) => {
  const confirmed = window.confirm(
    `This file is ${mediaSize}. Are you sure you want to download this .${extension} file?`,
  );
  if (!confirmed) return;

  try {
    const mediaPath = await getQuestionMedia(qid);

    const link = document.createElement('a');
    link.href = mediaPath;
    link.download = `file.${extension}`;
    link.click();
  } catch (error) {
    window.alert('Something went wrong with downloading the file');
  }
};

function getExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) return '';
  return path.slice(lastDot + 1).toLowerCase();
}

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 * @param mediaPath File path to the uploaded media
 * @param mediaUrl Url to the attached media
 */
const QuestionBody = ({
  qid,
  views,
  text,
  askby,
  meta,
  mediaPath,
  mediaUrl,
  mediaSize,
}: QuestionBodyProps) => {
  const { user } = useUserContext();
  const isGLB = mediaPath?.toLowerCase().endsWith('.glb');

  const isVideoPath = mediaPath?.match(/\.(mp4|webm|ogg)$/i);
  const isImagePath = mediaPath?.match(/\.(png|jpg|jpeg|gif)$/i);

  const isVideoUrl = mediaUrl?.match(/\.(mp4|webm|ogg)$/i);
  const isImageUrl = mediaUrl?.match(/\.(png|jpg|jpeg|gif)$/i);

  const isAuthor = askby === user.username;

  let ext: string | undefined = undefined;

  const {downloadQuestionPermission, handleToggleQuestionPermission } = useAnswerPage();

  if (mediaPath) {
    ext = getExtension(mediaPath);
  }

  return (
    <div id='questionBody' className='questionBody right_padding'>
      <div className='bold_title answer_question_view'>{views} views</div>

      <div className='answer_question_text'>
        <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>

        {/* ----- GLB MODEL (mediaPath only) ----- */}
        {mediaPath && isGLB && (
          <div className='three-wrapper'>
            <ThreeViewport key={mediaPath} modelPath={mediaPath} />
          </div>
        )}

        {/* ----- IMAGE (either path or url) ----- */}
        {(isImagePath || isImageUrl) && (
          <div className='question-media'>
            <img src={mediaPath || mediaUrl} alt='uploaded media' />
          </div>
        )}

        {/* ----- VIDEO (either path or url) ----- */}
        {(isVideoPath || isVideoUrl) && (
          <video controls>
            <source src={mediaPath || mediaUrl} />
            Your browser does not support video.
          </video>
        )}

        {/* ----- EMBED (YouTube/Vimeo/other URLs only) ----- */}
        {mediaUrl && !isVideoUrl && !isImageUrl && (
          <div className='iframe-wrapper'>
            <iframe
              src={(() => {
                let embed = mediaUrl;

                const youtube = mediaUrl.match(
                  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                );
                if (youtube) embed = `https://www.youtube.com/embed/${youtube[1]}`;

                const vimeo = mediaUrl.match(/vimeo\.com\/(\d+)/);
                if (vimeo) embed = `https://player.vimeo.com/video/${vimeo[1]}`;

                return embed;
              })()}
              title='embedded content'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          </div>
        )}
      </div>

      <div className='answer_question_right'>
        <div className='question_author'>{askby}</div>
        <div className='answer_question_meta'>asked {meta}</div>
        {downloadQuestionPermission && mediaPath && mediaSize && ext && (
          <div className='download-label'>
            <Download
              size={20}
              onClick={() => handleDownload(mediaSize, ext, qid)}
              color='#007BFF'
              style={{ cursor: 'pointer' }}
            />
            <div>Download 3D model</div>
          </div>
        )}
        {!downloadQuestionPermission && mediaPath && mediaSize && ext && (
          <div className='download-disabled'>
            <div>Download disabled</div>
          </div>
        )}
        {(isAuthor && mediaPath) && (
          <button 
            type="button" 
            className={`download-permission-btn ${downloadQuestionPermission ? 'enabled' : 'disabled'}`}
            onClick={() => {handleToggleQuestionPermission();}}
          >
            {downloadQuestionPermission ? '✓ Downloads On' : '✕ Downloads Off'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionBody;
