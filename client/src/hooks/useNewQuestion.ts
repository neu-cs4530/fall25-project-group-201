import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addQuestion } from '../services/questionService';
import useUserContext from './useUserContext';
import { DatabaseCommunity, Question } from '../types/types';
import { getCommunities } from '../services/communityService';
import xss from 'xss';
import validator from 'validator';

/**
 * Custom hook for managing a new question form, including state, validation,
 * file handling, media, and submission logic.
 *
 * @returns Object - Form state, error messages, handlers, and submission function
 */
const useNewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [tagNames, setTagNames] = useState<string>('');
  const [community, setCommunity] = useState<DatabaseCommunity | null>(null);

  const [titleErr, setTitleErr] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [tagErr, setTagErr] = useState<string>('');

  const [mediaErr, setMediaErr] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaPath, setUploadedMediaPath] = useState<string | undefined>(undefined);
  const [mediaSize, setMediaSize] = useState<string | undefined>(undefined);
  const [downloadPermission, setDownloadPermission] = useState<boolean>(true);

  const [fileName, setFileName] = useState<string>('');

  const [communityList, setCommunityList] = useState<DatabaseCommunity[]>([]);

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    const sanitizedTitle = xss(validator.trim(title));
    setTitle(sanitizedTitle);

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    const sanitizedText = xss(validator.trim(text));
    setText(sanitizedText);

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    if (!validator.isAlphanumeric(tagNames)) {
      setTagErr('Invalid tag; check your format');
      isValid = false;
    }
    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    if (tagnames.length === 0) {
      setTagErr('Should have at least 1 tag');
      isValid = false;
    } else if (tagnames.length > 5) {
      setTagErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      setTagErr('');
    }

    for (const tagName of tagnames) {
      if (tagName.length > 20) {
        setTagErr('New tag length cannot be more than 20');
        isValid = false;
        break;
      }
    }

    // sanitize URL if provided
    if (mediaUrl) {
      const trimmedUrl = validator.trim(mediaUrl);
      if (!validator.isURL(trimmedUrl, { protocols: ['http', 'https'] })) {
        setMediaErr('Invalid url');
      }
      setMediaUrl(trimmedUrl);
    }

    return isValid;
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postQuestion = async () => {
    if (!validateForm()) return;

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    const tags = tagnames.map(tagName => ({
      name: xss(tagName),
      description: 'user added tag',
    }));

    const question: Question = {
      title,
      text,
      tags,
      askedBy: user.username,
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: community ? community._id : null,
      ...(mediaUrl ? { mediaUrl } : {}),
      ...(mediaPath ? { mediaPath } : {}),
      ...(mediaSize ? { mediaSize } : {}),
      ...(mediaPath ? { permitDownload: downloadPermission } : {}),
    };

    try {
      const res = await addQuestion(question);
      if (res && res._id) {
        navigate('/home');
      }
    } catch (err) {
      setMediaErr('Failed to post question');
    }
  };

  /**
   * Handles the drag-over event to allow dropping a file.
   * Prevents the default behavior to enable dropping.
   *
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event triggered when a file is dragged over the drop zone.
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /**
   * Handles changes to the community select dropdown
   *
   * @param {ChangeEvent<HTMLSelectElement>} event - The change event
   */
  const handleDropdownChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedCommunity = communityList.find(com => com._id.toString() === event.target.value);
    if (selectedCommunity) setCommunity(selectedCommunity);
  };

  /**
   * Handles a file input change event by setting the uploaded media path
   * @param {ChangeEvent<HTMLInputElement>} e - The file input change event
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  };

  /**
   * Fetches the list of communities the user is a participant in
   * and sets the community list state
   */
  useEffect(() => {
    const fetchCommunities = async () => {
      const allCommunities = await getCommunities();
      setCommunityList(allCommunities.filter(com => com.participants.includes(user.username)));
    };

    fetchCommunities();
  }, [user.username]);

  return {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    community,
    setCommunity,
    titleErr,
    textErr,
    tagErr,
    mediaErr,
    setMediaErr,
    mediaUrl,
    setMediaUrl,
    mediaPath,
    mediaSize,
    setMediaSize,
    setUploadedMediaPath,
    postQuestion,
    communityList,
    handleDropdownChange,
    handleFileChange,
    handleDragOver,
    downloadPermission,
    setDownloadPermission,
    fileName,
    setFileName,
  };
};

export default useNewQuestion;
