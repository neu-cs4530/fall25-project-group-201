import './index.css';
import AskQuestionButton from '../../askQuestionButton';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  ansCount: number;
  title: string;
}

/**
 * AnswerHeader component that displays a header section for the answer page.
 * It includes the number of answers, the title of the question, and a button to ask a new question.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ ansCount, title }: AnswerHeaderProps) => (
  <div className='answer-header'>
    <div className='answer-text-block'>
      <h1 className='answer-title'>{title}</h1>
      <p className='answer-count'>{ansCount} answers</p>
    </div>

    <AskQuestionButton />
  </div>
);

export default AnswerHeader;
