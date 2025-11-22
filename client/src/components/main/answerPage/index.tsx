import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import { useState } from 'react';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    handleAddMedia,
    handleAddMediaError,
  } = useAnswerPage();

  const [rotationSetting, setRotationSetting] = useState<number[] | null>(null);
  const [translationSetting, setTranslationSetting] = useState<number[] | null>(null);

  if (!question) return null;

  const handleDummyButtonClick = () => {
    setTranslationSetting([0, 1.29, 6.28]);
    setRotationSetting([0.75, -3.16, 0]);
  };

  return (
    <>
      <VoteComponent question={question} />
      <AnswerHeader ansCount={question.answers.length} title={question.title} />
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime))}
        mediaPath={question.mediaPath}
        mediaUrl={question.mediaUrl}
        rotationSetting={rotationSetting}
        setRotationSetting={setRotationSetting}
        translationSetting={translationSetting}
        setTranslationSetting={setTranslationSetting}
        mediaSize={question.mediaSize}
      />
      <CommentSection
        comments={question.comments}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
        handleAddMedia={(file: File) => handleAddMedia(file)}
        handleAddMediaError={handleAddMediaError}
      />
      {question.answers.map(a => (
        <>
          <AnswerView
            key={String(a._id)}
            text={a.text}
            ansBy={a.ansBy}
            meta={getMetaData(new Date(a.ansDateTime))}
            comments={a.comments}
            handleAddComment={(comment: Comment) =>
              handleNewComment(comment, 'answer', String(a._id))
            }
            handleAddMedia={handleAddMedia}
            handleAddMediaError={handleAddMediaError}
            setRotationSetting={setRotationSetting}
            setTranslationSetting={setTranslationSetting}
            glbMedia={question.mediaPath?.toLowerCase().endsWith('.glb') === true}
          />
          <button onClick={handleDummyButtonClick}></button>
        </>
      ))}
      <button
        className='bluebtn ansButton'
        onClick={() => {
          if (translationSetting && rotationSetting) {
            const t = translationSetting.map(n => Number(n).toFixed(2));
            const r = rotationSetting.map(n => Number(n).toFixed(2));

            const cameraRef = `#camera-t(${t[0]},${t[1]},${t[2]})-r(${r[0]},${r[1]},${r[2]})`;

            handleNewAnswer(cameraRef);
          } else {
            handleNewAnswer('no_cam_ref');
          }
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
