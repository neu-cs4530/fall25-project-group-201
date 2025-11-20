// Mock for fs.unlink
const unlinkMock = jest.fn().mockResolvedValue(undefined);

jest.mock('fs', () => ({
  promises: {
    unlink: unlinkMock,
  },
}));

import mongoose from 'mongoose';
import GalleryPostModel from '../../models/gallerypost.model';
import { GalleryPost, DatabaseGalleryPost } from '../../types/types';
import {
  createGalleryPost,
  deleteGalleryPost,
  getGalleryPostById,
  getAllGalleryPosts,
  fetchAndIncrementGalleryPostViewsById,
  toggleGalleryPostLikeById,
  fetchAndIncrementGalleryPostDownloadsById,
} from '../../services/gallerypost.service';
import { ObjectId } from 'mongodb';

describe('Gallery Post Service', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGalleryPostInput: GalleryPost = {
    title: 'New Gallery Post',
    description: 'New Description',
    user: 'test_user',
    media: '/test_user/testMedia.png',
    community: '65e9b58910afe6e94fc6e6dd',
    postedAt: new Date('2024-06-06'),
    views: 0,
    downloads: 0,
    likes: [],
    tags: [],
  };

  const mockGalleryPostInputWithThumbnail: GalleryPost = {
    ...mockGalleryPostInput,
    media: '/test_user/test3DMedia.glb',
    thumbnailMedia: '/test_user/testThumbnail.png',
  };

  const mockGalleryPost: DatabaseGalleryPost = {
    _id: new mongoose.Types.ObjectId('65e9123910afe6e94fdef6dd'),
    ...mockGalleryPostInput,
  };

  const mockGalleryPostWithThumbnail: DatabaseGalleryPost = {
    _id: new mongoose.Types.ObjectId('65e9123910afe6e94123f6dd'),
    ...mockGalleryPostInputWithThumbnail,
  };

  const fakeId = new mongoose.Types.ObjectId().toString();

  describe('createGalleryPost', () => {
    test('creates gallery post successfully', async () => {
      jest.spyOn(GalleryPostModel, 'create').mockResolvedValueOnce(mockGalleryPost as any);

      const result = await createGalleryPost(mockGalleryPostInput);

      expect(result).toEqual(mockGalleryPost);
      expect(GalleryPostModel.create).toHaveBeenCalledWith(mockGalleryPostInput);
    });

    test('returns error if creation fails', async () => {
      jest.spyOn(GalleryPostModel, 'create').mockResolvedValueOnce(null as any);

      const result = await createGalleryPost(mockGalleryPostInput);

      expect(result).toEqual({ error: 'Failed to create gallery post' });
    });

    test('returns error if database throws', async () => {
      jest.spyOn(GalleryPostModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const result = await createGalleryPost(mockGalleryPostInput);

      expect(result).toEqual({ error: 'Database error' });
    });
  });

  describe('deleteGalleryPost', () => {
    test('should delete gallery post when it exists and belongs to user', async () => {
      jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
      jest
        .spyOn(GalleryPostModel, 'findOneAndDelete')
        .mockResolvedValueOnce(mockGalleryPost as any);

      const result = await deleteGalleryPost(mockGalleryPost._id.toString(), 'test_user');

      expect(result).toEqual(mockGalleryPost);
      expect(unlinkMock).toHaveBeenCalledTimes(1);
    });

    test('should delete gallery post with thumbnail', async () => {
      jest
        .spyOn(GalleryPostModel, 'findOne')
        .mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);
      jest
        .spyOn(GalleryPostModel, 'findOneAndDelete')
        .mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);

      const result = await deleteGalleryPost(
        mockGalleryPostWithThumbnail._id.toString(),
        'test_user',
      );

      expect(result).toEqual(mockGalleryPostWithThumbnail);
      expect(unlinkMock).toHaveBeenCalledTimes(2);
    });

    test('returns error if gallery post not found', async () => {
      jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(null);

      const result = await deleteGalleryPost(fakeId, 'test_user');

      expect(result).toEqual({ error: 'Gallery post not found' });
    });

    test('returns error if media deletion fails', async () => {
      jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
      unlinkMock.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await deleteGalleryPost(mockGalleryPost._id.toString(), 'test_user');

      expect('error' in result && result.error).toContain('Failed to delete media');
    });

    test('returns error if thumbnail deletion fails', async () => {
      jest
        .spyOn(GalleryPostModel, 'findOne')
        .mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);
      unlinkMock.mockResolvedValueOnce(undefined); // media ok
      unlinkMock.mockRejectedValueOnce(new Error('Permission denied')); // thumbnail fails

      const result = await deleteGalleryPost(
        mockGalleryPostWithThumbnail._id.toString(),
        'test_user',
      );

      expect('error' in result && result.error).toContain('Failed to delete thumbnailMedia');
    });

    test('returns error if final deletion fails', async () => {
      jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
      unlinkMock.mockResolvedValueOnce(undefined);
      jest.spyOn(GalleryPostModel, 'findOneAndDelete').mockResolvedValueOnce(null);

      const result = await deleteGalleryPost(mockGalleryPost._id.toString(), 'test_user');

      expect('error' in result && result.error).toContain(
        'Failed to delete gallery post after deleting media',
      );
    });
  });

  describe('getGalleryPostById', () => {
    test('returns gallery post', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(mockGalleryPost as any);

      const result = await getGalleryPostById(mockGalleryPost._id.toString());

      expect(result).toEqual(mockGalleryPost);
    });

    test('returns error if not found', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(null);

      const result = await getGalleryPostById(fakeId);

      expect(result).toEqual({ error: 'Failed to get gallery post' });
    });

    test('returns error if database throws', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const result = await getGalleryPostById(mockGalleryPost._id.toString());

      expect(result).toEqual({ error: 'Database error' });
    });
  });

  describe('getAllGalleryPosts', () => {
    test('returns all posts', async () => {
      jest
        .spyOn(GalleryPostModel, 'find')
        .mockResolvedValueOnce([mockGalleryPost, mockGalleryPostWithThumbnail] as any);

      const result = await getAllGalleryPosts();

      expect(result).toEqual([mockGalleryPost, mockGalleryPostWithThumbnail]);
    });

    test('returns error if find returns null', async () => {
      jest.spyOn(GalleryPostModel, 'find').mockResolvedValueOnce(null as any);

      const result = await getAllGalleryPosts();

      expect(result).toEqual({ error: 'Failed to get gallery posts' });
    });

    test('returns error if database throws', async () => {
      jest.spyOn(GalleryPostModel, 'find').mockRejectedValueOnce(new Error('Database error'));

      const result = await getAllGalleryPosts();

      expect(result).toEqual({ error: 'Database error' });
    });
  });

  describe('fetchAndIncrementGalleryPostViewsById', () => {
    test('increments views successfully', async () => {
      jest
        .spyOn(GalleryPostModel, 'findOneAndUpdate')
        .mockResolvedValueOnce(mockGalleryPost as any);

      const result = await fetchAndIncrementGalleryPostViewsById(mockGalleryPost._id.toString());

      expect(result).toEqual(mockGalleryPost);
      expect(GalleryPostModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(mockGalleryPost._id.toString()) },
        { $inc: { views: 1 } },
        { new: true },
      );
    });

    test('returns error if post not found', async () => {
      jest.spyOn(GalleryPostModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

      const result = await fetchAndIncrementGalleryPostViewsById(fakeId);

      expect('error' in result).toBe(true);
    });

    test('returns error if database throws', async () => {
      jest.spyOn(GalleryPostModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('DB error'));

      const result = await fetchAndIncrementGalleryPostViewsById(mockGalleryPost._id.toString());

      expect('error' in result).toBe(true);
    });
  });

  describe('fetchAndIncrementGalleryPostDownloadsById', () => {
    test('increments downloads successfully', async () => {
      const updatedPost = { ...mockGalleryPost, downloads: mockGalleryPost.downloads + 1 };

      jest.spyOn(GalleryPostModel, 'findOneAndUpdate').mockResolvedValueOnce(updatedPost as any);

      const result = await fetchAndIncrementGalleryPostDownloadsById(
        mockGalleryPost._id.toString(),
      );

      expect(result).toEqual(updatedPost);
      expect(GalleryPostModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(mockGalleryPost._id.toString()) },
        { $inc: { downloads: 1 } },
        { new: true },
      );
    });

    test('returns error if post not found', async () => {
      jest.spyOn(GalleryPostModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

      const result = await fetchAndIncrementGalleryPostDownloadsById(fakeId);

      expect('error' in result).toBe(true);
    });

    test('returns error if database throws', async () => {
      jest.spyOn(GalleryPostModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('DB error'));

      const result = await fetchAndIncrementGalleryPostDownloadsById(
        mockGalleryPost._id.toString(),
      );

      expect('error' in result).toBe(true);
    });
  });

  describe('toggleGalleryPostLikeById', () => {
    test('adds like if not liked', async () => {
      const post = { ...mockGalleryPost, likes: [] };
      const updatedPost = { ...post, likes: ['user2'] };

      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(post as any);
      jest.spyOn(GalleryPostModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedPost as any);

      const result = await toggleGalleryPostLikeById(post._id.toString(), 'user2');

      expect(result).toEqual(updatedPost);
    });

    test('removes like if already liked', async () => {
      const post = { ...mockGalleryPost, likes: ['user2'] };
      const updatedPost = { ...post, likes: [] };

      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(post as any);
      jest.spyOn(GalleryPostModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedPost as any);

      const result = await toggleGalleryPostLikeById(post._id.toString(), 'user2');

      expect(result).toEqual(updatedPost);
    });

    test('returns error if post not found', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(null);

      const result = await toggleGalleryPostLikeById(fakeId, 'user2');

      expect('error' in result).toBe(true);
    });

    test('returns error if update fails', async () => {
      const post = { ...mockGalleryPost, likes: [] };
      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(post as any);
      jest.spyOn(GalleryPostModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await toggleGalleryPostLikeById(post._id.toString(), 'user2');

      expect('error' in result).toBe(true);
    });

    test('returns error if database throws', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockRejectedValueOnce(new Error('DB error'));

      const result = await toggleGalleryPostLikeById(mockGalleryPost._id.toString(), 'user2');

      expect('error' in result).toBe(true);
    });
  });
});
