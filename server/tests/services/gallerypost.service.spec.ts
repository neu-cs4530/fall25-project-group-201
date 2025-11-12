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
} from '../../services/gallerypost.service';

describe('Gallery Post Service', () => {
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
    views: [],
    downloads: 0,
    likes: [],
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
    test('returns error when media deletion fails', async () => {
      jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
      unlinkMock.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await deleteGalleryPost(mockGalleryPost._id.toString(), 'test_user');

      if ('error' in result) {
        expect(result.error).toContain('Failed to delete media');
      } else {
        throw new Error('Expected error result, got success');
      }
    });

    test('returns error when thumbnail deletion fails', async () => {
      jest
        .spyOn(GalleryPostModel, 'findOne')
        .mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);
      unlinkMock.mockResolvedValueOnce(undefined); // media deletion succeeds
      unlinkMock.mockRejectedValueOnce(new Error('Permission denied')); // thumbnail deletion fails

      const result = await deleteGalleryPost(
        mockGalleryPostWithThumbnail._id.toString(),
        'test_user',
      );

      if ('error' in result) {
        expect(result.error).toContain('Failed to delete thumbnailMedia');
      } else {
        throw new Error('Expected error result, got success');
      }
    });

    test('returns error when final deletion fails', async () => {
      jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
      unlinkMock.mockResolvedValueOnce(undefined);
      jest.spyOn(GalleryPostModel, 'findOneAndDelete').mockResolvedValueOnce(null);

      const result = await deleteGalleryPost(mockGalleryPost._id.toString(), 'test_user');

      if ('error' in result) {
        expect(result.error).toContain('Failed to delete gallery post after deleting media');
      } else {
        throw new Error('Expected error result, got success');
      }
    });
  });

  describe('getGalleryPostById', () => {
    test('returns gallery post', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(mockGalleryPost);

      const result = await getGalleryPostById(mockGalleryPost._id.toString());

      expect(result).toEqual(mockGalleryPost);
      expect(GalleryPostModel.findById).toHaveBeenCalledWith(mockGalleryPost._id.toString());
    });

    test('returns error if not found', async () => {
      jest.spyOn(GalleryPostModel, 'findById').mockResolvedValueOnce(null);

      const result = await getGalleryPostById('invalid_id');

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
      const mockPosts = [mockGalleryPost, mockGalleryPostWithThumbnail];
      jest.spyOn(GalleryPostModel, 'find').mockResolvedValueOnce(mockPosts);

      const result = await getAllGalleryPosts();

      expect(result).toEqual(mockPosts);
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
});
