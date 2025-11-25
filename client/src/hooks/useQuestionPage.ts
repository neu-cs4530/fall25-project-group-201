import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import {
  AnswerUpdatePayload,
  OrderType,
  PopulatedDatabaseQuestion,
  DatabaseTag,
} from '../types/types';
import { getQuestionsByFilter } from '../services/questionService';

/**
 * Custom hook for managing the question page state, filtering, and real-time updates.
 *
 * @returns titleText - The current title of the question page
 * @returns qlist - The list of questions to display
 * @returns setQuestionOrder - Function to set the sorting order of questions (e.g., newest, oldest).
 */
const useQuestionPage = () => {
  const { socket } = useUserContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [titleText, setTitleText] = useState<string>('All Questions');
  const [search, setSearch] = useState<string>('');
  const [questionOrder, setQuestionOrder] = useState<OrderType>('newest');
  const [qlist, setQlist] = useState<PopulatedDatabaseQuestion[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  /**
   * Updates the page title and search string based on URL search parameters.
   * If a 'search' parameter exists, page title is "Search Results".
   * If a 'tag' parameter exists, page title is the tag name.
   */
  useEffect(() => {
    let pageTitle = 'All Questions';
    let searchString = '';

    const searchQuery = searchParams.get('search');
    const tagQuery = searchParams.get('tag');

    if (searchQuery) {
      pageTitle = 'Search Results';
      searchString = searchQuery;
    } else if (tagQuery) {
      pageTitle = tagQuery;
      searchString = `[${tagQuery}]`;
    }

    setTitleText(pageTitle);
    setSearch(searchString);
  }, [searchParams]);

  /**
   * Updates the selected tag in the URL search parameters.
   * If the tag is empty, it clears the tag filter.
   *
   * @param {string} tag - The tag selected by the user for filtering
   */
  const setSelectedTag = (tag: string) => {
    if (!tag) {
      setSearchParams({});
      return;
    }
    setSearchParams({ tag });
  };

  /**
   * Effect to fetch questions based on the current order and search string.
   * Also sets up real-time socket listeners for:
   * - question updates
   * - answer updates
   * - view count updates
   *
   * The allTags list is initialized on the first fetch and merged when new questions arrive.
   */
  useEffect(() => {
    /**
     * Fetches questions from the server using the current order and search string.
     * Initializes the allTags list from the first fetch.
     */
    const fetchData = async () => {
      try {
        const res = await getQuestionsByFilter(questionOrder, search);
        if (!res) return;
        setQlist(res);

        if (allTags.length === 0) {
          const tagSet = new Set<string>();
          res.forEach(q => q.tags?.forEach((tag: DatabaseTag) => tagSet.add(tag.name)));
          setAllTags(Array.from(tagSet).sort());
        }
      } catch {
        return;
      }
    };

    /**
     * Handles a question update from the socket.
     * Updates the question in qlist or adds it if new.
     * Merges any new tags into the allTags list.
     *
     * @param {PopulatedDatabaseQuestion} question - Updated or new question from the server
     */
    const handleQuestionUpdate = (question: PopulatedDatabaseQuestion) => {
      setQlist(prevQlist => {
        const questionExists = prevQlist.some(q => q._id === question._id);
        const updatedList = questionExists
          ? prevQlist.map(q => (q._id === question._id ? question : q))
          : [question, ...prevQlist];

        if (question.tags) {
          setAllTags(prevTags => {
            const tagSet = new Set(prevTags);
            question.tags.forEach((tag: DatabaseTag) => tagSet.add(tag.name));
            return Array.from(tagSet).sort();
          });
        }

        return updatedList;
      });
    };

    /**
     * Handles a new answer for a question from the socket.
     * Adds the answer to the corresponding question in qlist.
     *
     * @param {AnswerUpdatePayload} payload - The payload containing the question ID and new answer
     */
    const handleAnswerUpdate = ({ qid, answer }: AnswerUpdatePayload) => {
      setQlist(prevQlist =>
        prevQlist.map(q => (q._id === qid ? { ...q, answers: [...q.answers, answer] } : q)),
      );
    };

    /**
     * Handles an updated view count for a question from the socket.
     * Replaces the corresponding question in qlist.
     *
     * @param {PopulatedDatabaseQuestion} question - Question object with updated views
     */
    const handleViewsUpdate = (question: PopulatedDatabaseQuestion) => {
      setQlist(prevQlist => prevQlist.map(q => (q._id === question._id ? question : q)));
    };

    fetchData();

    socket.on('questionUpdate', handleQuestionUpdate);
    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);

    return () => {
      socket.off('questionUpdate', handleQuestionUpdate);
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
    };
  }, [questionOrder, search, socket, allTags.length]);

  return { titleText, qlist, allTags, setQuestionOrder, setSelectedTag };
};

export default useQuestionPage;
