import './index.css';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import useAnswerForm from '../../../hooks/useAnswerForm';
import { useLocation } from "react-router-dom";

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewAnswerPage = () => {
  const { text, textErr, setText, postAnswer } = useAnswerForm();
  const location = useLocation();
  let isGLBMedia = false;

  if (location.hash.startsWith("#camera-")) {
    isGLBMedia = true;
  } else {
    isGLBMedia = false;
  } 

  // remove the leading "#"
  const cameraRef = location.hash.slice(1);

  const handleUpdateText = () => {
    let tempText = text + "#" + cameraRef;
    setText(tempText)
  }

  return (
    <Form>
      <TextArea
        title={'Answer Text'}
        id={'answerTextInput'}
        val={text}
        setState={setText}
        err={textErr}
      />
      {isGLBMedia && <button onClick={handleUpdateText}>Add Camera Reference</button>}
      <h5>
        <i>Markdown formatting is supported.</i>
      </h5>
      <div className='btn_indicator_container'>
        <button className='form_postBtn' onClick={postAnswer}>
          Post Answer
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewAnswerPage;
