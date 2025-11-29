import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ThreeViewport from '../../threeViewport';
import './index.css';
import preprocessCameraRefs from '../../cameraRef/CameraRefUtils';
import { Download } from 'lucide-react';
import { getQuestionMedia } from '../../../../services/questionService';
import useUserContext from '../../../../hooks/useUserContext';
import useAnswerPage from '../../../../hooks/useAnswerPage';

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
  rotationSetting?: number[] | null;
  setRotationSetting: React.Dispatch<React.SetStateAction<number[] | null>>;
  translationSetting?: number[] | null;
  setTranslationSetting: React.Dispatch<React.SetStateAction<number[] | null>>;
  mediaSize?: string;
}

/**
 * Handles logic when download button is clicked, requesting confirmation
 * @param mediaSize of the media
 * @param extension of the media file
 * @param qid - question ID
 * @returns
 */
const handleDownload = async (mediaSize: string, extension: string, qid: string) => {
  const [valueStr, unit] = mediaSize.split(" ");
  const value = parseFloat(valueStr);

  // Convert to bytes for consistent comparison
  const sizeInBytes =
    unit.toUpperCase() === "KB" ? value * 1024 :
    unit.toUpperCase() === "MB" ? value * 1024 * 1024 :
    unit.toUpperCase() === "GB" ? value * 1024 * 1024 * 1024 :
    value; // assume already bytes if no unit

  // Threshold (example: 10 MB)
  const thresholdBytes = 10 * 1024 * 1024;

  if (sizeInBytes > thresholdBytes) {
    const confirmed = window.confirm(
      `This file is ${mediaSize}. Are you sure you want to download this .${extension} file?`,
    );
    if (!confirmed) return;
  }

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
  rotationSetting,
  setRotationSetting,
  translationSetting,
  setTranslationSetting,
  mediaSize,
}: QuestionBodyProps) => {
  const { user } = useUserContext();
  const isGLB = mediaPath?.toLowerCase().endsWith('.glb');

  const isVideoPath = mediaPath?.match(/\.(mp4|webm|ogg)$/i);
  const isImagePath = mediaPath?.match(/\.(png|jpg|jpeg|gif)$/i);

  const isVideoUrl = mediaUrl?.match(/\.(mp4|webm|ogg)$/i);
  const isImageUrl = mediaUrl?.match(/\.(png|jpg|jpeg|gif)$/i);

  const isAuthor = askby === user.username;

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
  let ext: string | undefined = undefined;

  const { downloadQuestionPermission, handleToggleQuestionPermission } = useAnswerPage();

  if (mediaPath) {
    ext = getExtension(mediaPath);
  }

  return (
    <div id='questionBody' className='questionBody right_padding'>
      <div className='answer_question_view'>{views} views</div>

      <div className='answer_question_text'>
        {!isGLB && <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>}
        {isGLB && (
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
                      id='question-camref-link'
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

        {/* ----- GLB MODEL (mediaPath only) ----- */}
        {mediaPath && isGLB && (
          <div className='three-wrapper'>
            <ThreeViewport
              key={mediaPath}
              modelPath={mediaPath}
              rotationSetting={rotationSetting}
              setRotationSetting={setRotationSetting}
              translationSetting={translationSetting}
              setTranslationSetting={setTranslationSetting}
            />
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
          <>
            <div className='download-label'>
              <Download
                size={20}
                onClick={() => handleDownload(mediaSize, ext, qid)}
                color='#007BFF'
                style={{ cursor: 'pointer' }}
              />
              <div>Download File</div>
            </div>
            <div className='media-file-info'>
              <span className='infoChip'>{ext}</span>
              <span className='infoChip'>{mediaSize}</span>
            </div>
          </>
        )}
        {!downloadQuestionPermission && mediaPath && mediaSize && ext && (
          <div className='download-disabled'>
            <div>Download disabled</div>
          </div>
        )}
        {isAuthor && mediaPath && (
          <button
            type='button'
            className={`download-permission-btn ${downloadQuestionPermission ? 'enabled' : 'disabled'}`}
            onClick={() => {
              handleToggleQuestionPermission();
            }}>
            {downloadQuestionPermission ? '✓ Downloads Allowed' : '✕ Downloads Off'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionBody;
