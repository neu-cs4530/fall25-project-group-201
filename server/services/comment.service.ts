import {
  AnswerResponse,
  Comment,
  CommentResponse,
  DatabaseAnswer,
  DatabaseComment,
  DatabaseQuestion,
  QuestionResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import CommentModel from '../models/comments.model';

/**
 * Saves a new comment to the database.
 * @param {Comment} comment - The comment to save.
 * @returns {Promise<CommentResponse>} - The saved comment or an error message.
 */
export const saveComment = async (comment: Comment): Promise<CommentResponse> => {
  try {
    const result: DatabaseComment = await CommentModel.create(comment);
    return result;
  } catch (error) {
    return { error: 'Error when saving a comment' };
  }
};

/**
 * Adds a comment to a question or answer.
 * @param {string} id - The ID of the question or answer.
 * @param {'question' | 'answer'} type - The type of the item to comment on.
 * @param {DatabaseComment} comment - The comment to add.
 * @returns {Promise<QuestionResponse | AnswerResponse>} - The updated item or an error message.
 */
export const addComment = async (
  id: string,
  type: 'question' | 'answer',
  comment: DatabaseComment,
): Promise<QuestionResponse | AnswerResponse> => {
  try {
    if (!comment || !comment.text || !comment.commentBy || !comment.commentDateTime) {
      throw new Error('Invalid comment');
    }

    let result: DatabaseQuestion | DatabaseAnswer | null;

    if (type === 'question') {
      result = await QuestionModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    } else {
      result = await AnswerModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    }

    if (result === null) {
      throw new Error('Failed to add comment');
    }

    return result;
  } catch (error) {
    return { error: `Error when adding comment: ${(error as Error).message}` };
  }
};

export const downloadCommentMedia = async (id: string): Promise<string | { error: string }> => {
  try {
    const comment = await CommentModel.findById(id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.mediaPath === undefined) {
      throw new Error('No media to download');
    }

    if (comment.permitDownload === undefined || !comment.permitDownload) {
      throw new Error('Downloads are not permitted');
    }

    return comment.mediaPath;
  } catch (error) {
    return { error: 'Error when downloading comment media' };
  }
};

export const toggleCommentMediaPermission = async (id: string, username: string): Promise<boolean | { error: string }> => {
  try {
    const comment = await CommentModel.findById(id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.commentBy !== username) {
      throw new Error('Only the commment asker can change download permissions.');
    }

    if (comment.mediaPath === undefined || comment.permitDownload === undefined) {
      throw new Error('No media found to change permissions for.');
    }

    let updatedComment: Comment | null = await CommentModel.findByIdAndUpdate(
      { _id: id },
      { permitDownload: !comment.permitDownload },
      { new: true },
    );

    if (!updatedComment || updatedComment.permitDownload === undefined) {
      throw new Error('Failed to update commment permissions')
    }

    return updatedComment.permitDownload;
  } catch {
    return { error: 'Error when toggling commment media download permissions' };
  }
}
