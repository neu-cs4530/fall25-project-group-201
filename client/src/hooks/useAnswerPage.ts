import { ObjectId } from 'mongodb';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Comment,
  VoteUpdatePayload,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseAnswer,
  DatabaseMedia,
} from '../types/types';
import useUserContext from './useUserContext';
import { addComment } from '../services/commentService';
import { getQuestionById, toggleMediaPermission } from '../services/questionService';
import mediaService from '../services/mediaService';

/**
 * Custom React hook for managing the Answer Page functionality.
 * Handles fetching and updating question data, comments, answers, media uploads,
 * and real-time socket updates.
 *
 * @returns {object} Object containing:
 * - `questionID`: The current question ID from URL parameters.
 * - `question`: The current question object (with answers, comments, votes, etc.).
 * - `handleNewComment`: Function to handle new comment submission.
 * - `handleNewAnswer`: Function to navigate to the "New Answer" page.
 * - `handleAddMedia`: Function to upload new media files.
 * - `handleAddMediaError`: Error message related to media uploads, if any.
 */
const useAnswerPage = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user, socket } = useUserContext();
  const [questionID, setQuestionID] = useState<string>(qid || '');
  const [question, setQuestion] = useState<PopulatedDatabaseQuestion | null>(null);
  const [handleAddMediaError, setHandleAddMediaError] = useState<string | null>(null);
  const [downloadQuestionPermission, setDownloadQuestionPermission] = useState<
    boolean | undefined
  >();

  /**
   * Navigates the user to the "New Answer" page for the current question.
   *
   * @function
   * @returns {void}
   */
  const handleNewAnswer = (cameraRef: string) => {
    navigate(`/new/answer/${questionID}?${cameraRef}`);
  };

  /**
   * Handles the addition of new media by uploading files to the server.
   * Validates file type, size, and user authentication before uploading.
   *
   * @async
   * @function
   * @param {File} file - The media file to upload.
   * @returns {Promise<string | undefined>} The uploaded file path or `undefined` on failure.
   */
  const handleAddMedia = async (file: File): Promise<DatabaseMedia | undefined> => {
    if (!file || !file.name) {
      setHandleAddMediaError('File with valid path is required');
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSize) {
      setHandleAddMediaError('File size cannot exceed 20 MB');
      return;
    }

    if (!user.username) {
      setHandleAddMediaError('User is required');
      return;
    }

    const allowedExtensions = ['.png', '.jpeg', '.jpg', '.mp4', '.glb'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setHandleAddMediaError('Only .png, .jpeg, .jpg, .mp4, and .glb files are allowed');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filepathLocation', file.name);

      const newMedia = await mediaService.addMedia(user.username, formData);
      return newMedia;
    } catch (err) {
      return undefined;
    }
  };

  /**
   * Syncs the `questionID` state with the URL parameter (`qid`).
   * Redirects to the home page if `qid` is not found.
   */
  useEffect(() => {
    if (!qid) {
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Adds a new comment to a question or answer, then refreshes the question data.
   *
   * @async
   * @function
   * @param {Comment} comment - The comment to add.
   * @param {'question' | 'answer'} targetType - Whether the comment is for a question or answer.
   * @param {string | undefined} targetId - The ID of the target being commented on.
   * @returns {Promise<void>}
   */
  const handleNewComment = async (
    comment: Comment,
    targetType: 'question' | 'answer',
    targetId: string | undefined,
  ): Promise<void> => {
    try {
      if (!targetId) throw new Error('No target ID provided.');

      await addComment(targetId, targetType, comment);
      const updatedQuestion = await getQuestionById(questionID, user.username);
      setQuestion(updatedQuestion);
    } catch (error) {
      return;
    }
  };

  const handleToggleQuestionPermission = async (): Promise<void> => {
    if (!qid) {
      return;
    }

    try {
      const updatedPermission = await toggleMediaPermission(qid, user.username);
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
        const res = await getQuestionById(questionID, user.username);
        setQuestion(res || null);
        setDownloadQuestionPermission(res.permitDownload);
      } catch (error) {
        return;
      }
    };

    fetchData();
  }, [questionID, user.username]);

  /**
   * Sets up socket listeners for real-time updates to answers, comments, views, and votes.
   * Cleans up listeners when the component is unmounted.
   */
  useEffect(() => {
    /**
     * Handles updates when a new answer is added to the current question.
     *
     * @param {{ qid: ObjectId, answer: PopulatedDatabaseAnswer }} payload - The updated answer data.
     */
    const handleAnswerUpdate = ({
      qid: id,
      answer,
    }: {
      qid: ObjectId;
      answer: PopulatedDatabaseAnswer;
    }) => {
      if (String(id) === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? { ...prevQuestion, answers: [...prevQuestion.answers, answer] }
            : prevQuestion,
        );
      }
    };

    /**
     * Handles updates to comments for both questions and answers.
     *
     * @param {{ result: PopulatedDatabaseQuestion | PopulatedDatabaseAnswer, type: 'question' | 'answer' }} data - The updated data payload.
     */
    const handleCommentUpdate = ({
      result,
      type,
    }: {
      result: PopulatedDatabaseQuestion | PopulatedDatabaseAnswer;
      type: 'question' | 'answer';
    }) => {
      if (type === 'question') {
        const questionResult = result as PopulatedDatabaseQuestion;
        if (String(questionResult._id) === questionID) {
          setQuestion(questionResult);
        }
      } else if (type === 'answer') {
        setQuestion(prevQuestion =>
          prevQuestion
            ? {
                ...prevQuestion,
                answers: prevQuestion.answers.map(a =>
                  a._id === result._id ? (result as PopulatedDatabaseAnswer) : a,
                ),
              }
            : prevQuestion,
        );
      }
    };

    /**
     * Handles updates to the view count of a question.
     *
     * @param {PopulatedDatabaseQuestion} q - The updated question with new view data.
     */
    const handleViewsUpdate = (q: PopulatedDatabaseQuestion) => {
      if (String(q._id) === questionID) {
        setQuestion(q);
      }
    };

    /**
     * Handles vote count updates for the question.
     *
     * @param {VoteUpdatePayload} voteData - The updated vote data payload.
     */
    const handleVoteUpdate = (voteData: VoteUpdatePayload) => {
      if (voteData.qid === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? {
                ...prevQuestion,
                upVotes: [...voteData.upVotes],
                downVotes: [...voteData.downVotes],
              }
            : prevQuestion,
        );
      }
    };

    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);
    socket.on('commentUpdate', handleCommentUpdate);
    socket.on('voteUpdate', handleVoteUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
      socket.off('commentUpdate', handleCommentUpdate);
      socket.off('voteUpdate', handleVoteUpdate);
    };
  }, [questionID, socket]);

  return {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    handleAddMedia,
    handleAddMediaError,
    downloadQuestionPermission,
    handleToggleQuestionPermission,
  };
};

export default useAnswerPage;
