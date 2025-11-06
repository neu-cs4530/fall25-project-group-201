import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  mediaUrl?: string;
  mediaPath?: string;
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
 * @param mediaUrl Url to the attached media
 * @param mediaPath File path to the uploaded media
 */
const QuestionBody = ({ views, text, askby, meta, mediaUrl, mediaPath }: QuestionBodyProps) => {
  const isVideo = (path: string) => path.match(/\.(mp4|webm|ogg)$/i);
  const isImage = (path: string) => path.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  /**
   * Renders the given url as either an image, youtube video, or vimeo video
   * @param url
   * @returns the rendered embedded media
   */
  const renderEmbeddedMedia = (url: string) => {
    try {
      const parsed = new URL(url);

      // Images
      if (isImage(parsed.pathname)) {
        return <img src={url} alt='Embedded media' className='question-media' />;
      }

      // YouTube
      const ytMatch = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      );
      if (ytMatch) {
        return (
          <div className='iframe-wrapper'>
            <iframe
              src={`https://www.youtube.com/embed/${ytMatch[1]}`}
              title='YouTube video player'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          </div>
        );
      }

      // Vimeo
      const vimeoMatch = url.match(/https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return (
          <div className='iframe-wrapper'>
            <iframe
              src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
              frameBorder='0'
              allow='autoplay; fullscreen; picture-in-picture'
              allowFullScreen
              title='Vimeo video player'
            />
          </div>
        );
      }
    } catch {
      return <div className='question-media'>Invalid media URL</div>;
    }

    return <div className='question-media'>Unsupported media type</div>;
  };

  return (
    <div id='questionBody' className='questionBody right_padding'>
      <div className='bold_title answer_question_view'>{views} views</div>
      <div className='answer_question_text'>
        <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>

        {mediaUrl && renderEmbeddedMedia(mediaUrl)}

        {mediaPath &&
          (isVideo(mediaPath) ? (
            <video src={mediaPath} controls className='question-media' />
          ) : (
            <img src={mediaPath} alt='Uploaded media' className='question-media' />
          ))}
      </div>
      <div className='answer_question_right'>
        <div className='question_author'>{askby}</div>
        <div className='answer_question_meta'>asked {meta}</div>
      </div>
    </div>
  );
};

export default QuestionBody;
