import mongoose from 'mongoose';
import QuestionModel from '../../models/questions.model';
import {
  saveComment,
  addComment,
  downloadCommentMedia,
  toggleCommentMediaPermission,
} from '../../services/comment.service';
import { DatabaseComment, DatabaseQuestion, DatabaseAnswer } from '../../types/types';
import AnswerModel from '../../models/answers.model';
import {
  QUESTIONS,
  ans1,
  com1,
  comWithMediaPath,
  comWithMediaUrl,
  comWithMediaPathAndUrl,
} from '../mockData.models';
import CommentModel from '../../models/comments.model';

describe('Comment model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('saveComment', () => {
    test('saveComment should return the saved comment', async () => {
      jest
        .spyOn(CommentModel, 'create')
        .mockResolvedValue(com1 as unknown as ReturnType<typeof CommentModel.create>);
      const result = (await saveComment(com1)) as DatabaseComment;
      expect(result._id).toBeDefined();
      expect(result.text).toEqual(com1.text);
      expect(result.commentBy).toEqual(com1.commentBy);
      expect(result.commentDateTime).toEqual(com1.commentDateTime);
    });

    test('saveComment with mediaPath should return the saved comment with mediaPath', async () => {
      jest
        .spyOn(CommentModel, 'create')
        .mockResolvedValue(comWithMediaPath as unknown as ReturnType<typeof CommentModel.create>);
      const result = (await saveComment(comWithMediaPath)) as DatabaseComment;
      expect(result._id).toBeDefined();
      expect(result.text).toEqual(comWithMediaPath.text);
      expect(result.commentBy).toEqual(comWithMediaPath.commentBy);
      expect(result.commentDateTime).toEqual(comWithMediaPath.commentDateTime);
      expect(result.mediaPath).toEqual(comWithMediaPath.mediaPath);
    });

    test('saveComment with mediaUrl should return the saved comment with mediaUrl', async () => {
      jest
        .spyOn(CommentModel, 'create')
        .mockResolvedValue(comWithMediaUrl as unknown as ReturnType<typeof CommentModel.create>);
      const result = (await saveComment(comWithMediaUrl)) as DatabaseComment;
      expect(result._id).toBeDefined();
      expect(result.text).toEqual(comWithMediaUrl.text);
      expect(result.commentBy).toEqual(comWithMediaUrl.commentBy);
      expect(result.commentDateTime).toEqual(comWithMediaUrl.commentDateTime);
      expect(result.mediaUrl).toEqual(comWithMediaUrl.mediaUrl);
    });

    test('saveComment with mediaUrl and mediaPath should return the saved comment with mediaUrl', async () => {
      jest
        .spyOn(CommentModel, 'create')
        .mockResolvedValue(
          comWithMediaPathAndUrl as unknown as ReturnType<typeof CommentModel.create>,
        );
      const result = (await saveComment(comWithMediaPathAndUrl)) as DatabaseComment;
      expect(result._id).toBeDefined();
      expect(result.text).toEqual(comWithMediaPathAndUrl.text);
      expect(result.commentBy).toEqual(comWithMediaPathAndUrl.commentBy);
      expect(result.commentDateTime).toEqual(comWithMediaPathAndUrl.commentDateTime);
      expect(result.mediaUrl).toEqual(comWithMediaPathAndUrl.mediaUrl);
      expect(result.mediaPath).toEqual(comWithMediaPathAndUrl.mediaPath);
    });

    test('saveComment should return an object with error if create throws an error', async () => {
      jest.spyOn(CommentModel, 'create').mockRejectedValue(new Error('Error from db query'));
      const result = await saveComment(com1);
      expect(result).toEqual({ error: 'Error when saving a comment' });
    });
  });

  describe('addComment', () => {
    test('addComment should return the updated question when given `question`', async () => {
      // mock question to be returned from findOneAndUpdate spy
      const question = { ...QUESTIONS[0], comments: [com1._id] };
      jest.spyOn(QuestionModel, 'findOneAndUpdate').mockResolvedValue(question);
      const result = (await addComment(
        question._id.toString() as string,
        'question',
        com1,
      )) as DatabaseQuestion;
      expect(result.comments.length).toEqual(1);
      expect(result.comments).toContain(com1._id);
    });

    test('addComment should return the updated answer when given `answer`', async () => {
      // mock answer to be returned from findOneAndUpdate spy
      const answer: DatabaseAnswer = { ...ans1, comments: [com1._id] };
      jest.spyOn(AnswerModel, 'findOneAndUpdate').mockResolvedValue(answer);

      const result = (await addComment(answer._id.toString(), 'answer', com1)) as DatabaseAnswer;

      expect(result.comments.length).toEqual(1);
      expect(result.comments).toContain(com1._id);
    });

    test('addComment should return an object with error if findOneAndUpdate throws an error', async () => {
      const question = QUESTIONS[0];
      jest
        .spyOn(QuestionModel, 'findOneAndUpdate')
        .mockRejectedValue(new Error('Error from findOneAndUpdate'));
      const result = await addComment(question._id.toString() as string, 'question', com1);
      expect(result).toEqual({ error: 'Error when adding comment: Error from findOneAndUpdate' });
    });

    test('addComment should return an object with error if findOneAndUpdate returns null', async () => {
      const answer: DatabaseAnswer = { ...ans1 };
      jest.spyOn(AnswerModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await addComment(answer._id.toString(), 'answer', com1);
      expect(result).toEqual({ error: 'Error when adding comment: Failed to add comment' });
    });

    test('addComment should throw an error if a required field is missing in the comment', async () => {
      const invalidComment: DatabaseComment = {
        _id: new mongoose.Types.ObjectId(),
        commentDateTime: new Date(),
        text: '',
        commentBy: 'user123', // Missing commentDateTime
      };

      const qid = 'validQuestionId';

      expect(addComment(qid, 'question', invalidComment)).resolves.toEqual({
        error: `Error when adding comment: Invalid comment`,
      });
    });
  });

  describe('downloadCommentMedia', () => {
    test('downloadCommentMedia should return the mediaPath when comment exists and download is permitted', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = (await downloadCommentMedia('68f0589f28fdad025905af9b')) as string;

      expect(result).toBe('/uploads/media/test-file.jpg');
      expect(CommentModel.findById).toHaveBeenCalledWith('68f0589f28fdad025905af9b');
    });

    test('downloadCommentMedia should return error object when id is not provided', async () => {
      const result = await downloadCommentMedia('');

      expect(result).toEqual({ error: 'Error when downloading comment media' });
    });

    test('downloadCommentMedia should return error object when comment is not found', async () => {
      jest.spyOn(CommentModel, 'findById').mockResolvedValue(null);

      const result = await downloadCommentMedia('32234');

      expect(result).toEqual({ error: 'Error when downloading comment media' });
    });

    test('downloadCommentMedia should return error object when comment has no mediaPath', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: undefined,
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await downloadCommentMedia('68f0589f28fdad025905af9b');

      expect(result).toEqual({ error: 'Error when downloading comment media' });
    });

    test('downloadCommentMedia should return error object when permitDownload is undefined', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: undefined,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await downloadCommentMedia('68f0589f28fdad025905af9b');

      expect(result).toEqual({ error: 'Error when downloading comment media' });
    });

    test('downloadCommentMedia should return error object when permitDownload is false', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: false,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await downloadCommentMedia('68f0589f28fdad025905af9b');

      expect(result).toEqual({ error: 'Error when downloading comment media' });
    });

    test('downloadCommentMedia should return error object when findById throws an error', async () => {
      jest.spyOn(CommentModel, 'findById').mockRejectedValue(new Error('Database error'));

      const result = await downloadCommentMedia('68f0589f28fdad025905af9b');

      expect(result).toEqual({ error: 'Error when downloading comment media' });
    });
  });

  describe('toggleCommentMediaPermission', () => {
    test('toggleCommentMediaPermission should return true when toggling from false to true', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: false,
      };

      const mockUpdatedComment = {
        ...mockComment,
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedComment);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toBe(true);
      expect(CommentModel.findById).toHaveBeenCalledWith('68f0589f28fdad025905af9b');
      expect(CommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: '68f0589f28fdad025905af9b' },
        { permitDownload: true },
        { new: true },
      );
    });

    test('toggleCommentMediaPermission should return false when toggling from true to false', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: true,
      };

      const mockUpdatedComment = {
        ...mockComment,
        permitDownload: false,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedComment);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toBe(false);
      expect(CommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: '68f0589f28fdad025905af9b' },
        { permitDownload: false },
        { new: true },
      );
    });

    test('toggleCommentMediaPermission should return error object when id is not provided', async () => {
      const result = await toggleCommentMediaPermission('', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when username is not provided', async () => {
      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', '');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when both id and username are not provided', async () => {
      const result = await toggleCommentMediaPermission('', '');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when comment is not found', async () => {
      jest.spyOn(CommentModel, 'findById').mockResolvedValue(null);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when username does not match commentBy', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'originaluser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await toggleCommentMediaPermission(
        '68f0589f28fdad025905af9b',
        'differentuser',
      );

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when comment has no mediaPath', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: undefined,
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
      expect(CommentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('toggleCommentMediaPermission should return error object when comment has no permitDownload', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: undefined,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when both mediaPath and permitDownload are undefined', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: undefined,
        permitDownload: undefined,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
      expect(CommentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('toggleCommentMediaPermission should return error object when findByIdAndUpdate returns null', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValue(null);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when updatedComment has undefined permitDownload', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: true,
      };

      const mockUpdatedComment = {
        ...mockComment,
        permitDownload: undefined,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedComment);

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when findById throws an error', async () => {
      jest.spyOn(CommentModel, 'findById').mockRejectedValue(new Error('Database error'));

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });

    test('toggleCommentMediaPermission should return error object when findByIdAndUpdate throws an error', async () => {
      const mockComment = {
        _id: '68f0589f28fdad025905af9b',
        text: 'Test comment',
        commentBy: 'testuser',
        commentDateTime: new Date(),
        mediaPath: '/uploads/media/test-file.jpg',
        permitDownload: true,
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValue(mockComment);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockRejectedValue(new Error('Update failed'));

      const result = await toggleCommentMediaPermission('68f0589f28fdad025905af9b', 'testuser');

      expect(result).toEqual({ error: 'Error when toggling commment media download permissions' });
    });
  });
});
