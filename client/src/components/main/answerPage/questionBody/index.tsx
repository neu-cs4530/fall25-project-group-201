import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ThreeViewport from '../../threeViewport';
import './index.css';

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
  views: number;
  text: string;
  askby: string;
  meta: string;
  mediaPath?: string;
  mediaUrl?: string;
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
const QuestionBody = ({ views, text, askby, meta, mediaPath, mediaUrl }: QuestionBodyProps) => {
  const isGLB = mediaPath?.toLowerCase().endsWith('.glb');

  const isVideoPath = mediaPath?.match(/\.(mp4|webm|ogg)$/i);
  const isImagePath = mediaPath?.match(/\.(png|jpg|jpeg|gif)$/i);

  const isVideoUrl = mediaUrl?.match(/\.(mp4|webm|ogg)$/i);
  const isImageUrl = mediaUrl?.match(/\.(png|jpg|jpeg|gif)$/i);

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
      </div>
    </div>
  );
};

export default QuestionBody;
