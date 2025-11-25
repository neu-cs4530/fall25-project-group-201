import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseComment, DatabaseMedia } from '../../../../types/types';
import preprocessCameraRefs from '../../cameraRef/CameraRefUtils';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 * - handleAddMedia Callback function to handle adding media.
 * - handleAddMediaError to set media errors encountered
 * - setRotationSetting to set rotation settings for 3D viewport, if applicable
 * - setTranslationSetting to set translation settings for 3D viewport if applicable
 * - glbMedia if the question being answered contains 3D media
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  handleAddMedia: (file: File) => Promise<DatabaseMedia | undefined>;
  handleAddMediaError: string | null;
  setRotationSetting: React.Dispatch<React.SetStateAction<number[] | null>>;
  setTranslationSetting: React.Dispatch<React.SetStateAction<number[] | null>>;
  glbMedia: boolean;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */
const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  handleAddComment,
  handleAddMedia,
  handleAddMediaError,
  setRotationSetting,
  setTranslationSetting,
  glbMedia,
}: AnswerProps) => {
  /**
   * Logic to convert cameraRef to set rotationSettings and translationSettings of the 3D viewport
   * @param cameraRef that is being clicked
   */
  const handleCameraRefClick = (cameraRef: string) => {
    // Remove leading "#camera-" prefix
    const ref = cameraRef.replace(/^#camera-/, '');

    // Regex supporting decimals, negatives, and optional rotation
    // Matches t(x,y,z) and optional -r(x,y,z)
    const regex = /t\(\s*([^)]+?)\s*\)(?:-r\(\s*([^)]+?)\s*\))?/;
    const match = ref.match(regex);

    if (!match) {
      return;
    }

    // Translation is required → split and parse safely
    const translation = match[1].split(',').map(v => Number(v.trim())); // handles decimals / negatives

    // Rotation is optional
    const rotation = match[2] ? match[2].split(',').map(v => Number(v.trim())) : null;

    if (rotation) {
      setRotationSetting(rotation);
    }

    if (translation) {
      setTranslationSetting(translation);
    }
  };

  return (
    <div className='answer right_padding'>
      <div id='answerText' className='answerText'>
        {!glbMedia && <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>}
        {glbMedia && (
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                // Detect camera links
                if (href && href.startsWith('#camera-')) {
                  // We want: "camera-t(1,2,3)-r(0,90,0)"
                  const cleanRef = href.replace(/^#/, '');

                  return (
                    <span
                      style={{
                        color: 'blue',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                      id='answer-camref-link'
                      onClick={() => handleCameraRefClick(cleanRef)}>
                      {children}
                    </span>
                  );
                }

                // Normal links
                return <a href={href}>{children}</a>;
              },
            }}>
            {preprocessCameraRefs(text)}
          </Markdown>
        )}
      </div>

      <div className='answerAuthor'>
        <div className='answer_author'>{ansBy}</div>
        <div className='answer_question_meta'>{meta}</div>
      </div>

      <CommentSection
        comments={comments}
        handleAddComment={handleAddComment}
        handleAddMedia={handleAddMedia}
        handleAddMediaError={handleAddMediaError}
      />
    </div>
  );
};

export default AnswerView;
