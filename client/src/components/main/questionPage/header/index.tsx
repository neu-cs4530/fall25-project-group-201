import './index.css';
import AskQuestionButton from '../../askQuestionButton';
import { OrderType } from '../../../../types/types';
import { orderTypeDisplayName } from '../../../../types/constants';

interface QuestionHeaderProps {
  titleText: string;
  qcnt: number;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * Interface representing the props for the QuestionHeader component.
 *
 * titleText - The title text displayed at the top of the header.
 * qcnt - The number of questions to be displayed in the header.
 * setQuestionOrder - A function that sets the order of questions based on the selected message.
 */
const QuestionHeader = ({ titleText, qcnt, setQuestionOrder }: QuestionHeaderProps) => (
  <div className="questionHeader">
    <div className="space_between">
      <h2 className="title">{titleText}</h2>
    </div>
    <div className="space_between">
  <div className="leftSection">
    <div id="question_count">{qcnt} questions</div>
    <div className="orderWrapper">
      <label className="orderLabel" htmlFor="orderSelect">Sort By</label>
      <select
        id="orderSelect"
        className="orderDropdown"
        onChange={(e) => setQuestionOrder(e.target.value as OrderType)}
      >
        {Object.keys(orderTypeDisplayName).map((order) => (
          <option key={order} value={order}>
            {orderTypeDisplayName[order as OrderType]}
          </option>
        ))}
      </select>
    </div>
  </div>
  <div className="askButtonWrapper">
    <AskQuestionButton />
  </div>
</div>

  </div>
);

export default QuestionHeader;
