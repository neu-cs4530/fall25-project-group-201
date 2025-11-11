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
    deleteGalleryPost
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
    postedAt: new Date('2024-06-06')
  }

  const mockGalleryPostInputWithThumbnail: GalleryPost = {
    title: 'New Gallery Post',
    description: 'New Description',
    user: 'test_user',
    media: '/test_user/test3DMedia.glb',
    community: '65e9b58910afe6e94fc6e6dd',
    thumbnailMedia: '/test_user/testThumbail.png',
    postedAt: new Date('2024-06-06')
  }

   const mockGalleryPost: DatabaseGalleryPost = {
    _id: new mongoose.Types.ObjectId('65e9123910afe6e94fdef6dd'),
    title: 'New Gallery Post',
    description: 'New Description',
    user: 'test_user',
    media: '/test_user/testMedia.png',
    community: '65e9b58910afe6e94fc6e6dd',
    postedAt: new Date('2024-06-06'),
  }

  const mockGalleryPostWithThumbnail: DatabaseGalleryPost = {
    _id: new mongoose.Types.ObjectId('65e9123910afe6e94123f6dd'),
    title: 'New Gallery Post',
    description: 'New Description',
    user: 'test_user',
    media: '/test_user/test3DMedia.glb',
    community: '65e9b58910afe6e94fc6e6dd',
    thumbnailMedia: '/test_user/testThumbail.png',
    postedAt: new Date('2024-06-06'),
  }

  describe('createGalleryPost', () => {
    test('should create a new gallery post successfully', async () => {
        const createdGalleryPost = {
        ...mockGalleryPostInput,
        _id: new mongoose.Types.ObjectId(),
        };

        jest.spyOn(GalleryPostModel, 'create').mockResolvedValueOnce(createdGalleryPost as any);

        const result = await createGalleryPost(mockGalleryPostInput);

        expect(result).toEqual(createdGalleryPost);
        expect(GalleryPostModel.create).toHaveBeenCalledWith(mockGalleryPostInput);
    });

    test('should create a new gallery post with thumbnail successfully', async () => {
        const createdGalleryPost = {
        ...mockGalleryPostInputWithThumbnail,
        _id: new mongoose.Types.ObjectId(),
        };

        jest.spyOn(GalleryPostModel, 'create').mockResolvedValueOnce(createdGalleryPost as any);

        const result = await createGalleryPost(mockGalleryPostInputWithThumbnail);

        expect(result).toEqual(createdGalleryPost);
        expect(GalleryPostModel.create).toHaveBeenCalledWith(mockGalleryPostInputWithThumbnail);
    });

    test('should return error when creation fails', async () => {
        jest.spyOn(GalleryPostModel, 'create').mockResolvedValueOnce(null as any);

        const result = await createGalleryPost(mockGalleryPostInput);

        expect(result).toEqual({ error: 'Failed to create gallery post' });
    });

    test('should return error when database throws error', async () => {
      jest.spyOn(GalleryPostModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const result = await createGalleryPost(mockGalleryPostInput);

      expect(result).toEqual({ error: 'Database error' });
    });
  });

  describe('deleteGalleryPost', () => {
      test('should delete gallery post when it exists and belongs to user', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
            jest.spyOn(GalleryPostModel, 'findOneAndDelete').mockResolvedValueOnce(mockGalleryPost as any);
            unlinkMock.mockResolvedValueOnce(undefined) 
            
            const result = await deleteGalleryPost('65e9123910afe6e94fdef6dd', 'test_user');

            expect(result).toEqual(mockGalleryPost);
            expect(GalleryPostModel.findOne).toHaveBeenCalledWith({
            _id: '65e9123910afe6e94fdef6dd',
            username: 'test_user',
            });
            expect(GalleryPostModel.findOneAndDelete).toHaveBeenCalledWith({
            _id: '65e9123910afe6e94fdef6dd',
            username: 'test_user',
            });
            
            expect(unlinkMock).toHaveBeenCalledTimes(1);
        });

         test('should delete gallery post with thumbnail when it exists and belongs to user', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);
            unlinkMock.mockResolvedValueOnce(undefined) 
            unlinkMock.mockResolvedValueOnce(undefined) 
            jest.spyOn(GalleryPostModel, 'findOneAndDelete').mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);

            const result = await deleteGalleryPost('65e9123910afe6e94123f6dd', 'test_user');

            expect(result).toEqual(mockGalleryPostWithThumbnail);
            expect(GalleryPostModel.findOne).toHaveBeenCalledWith({
            _id: '65e9123910afe6e94123f6dd',
            username: 'test_user',
            });
            expect(GalleryPostModel.findOneAndDelete).toHaveBeenCalledWith({
            _id: '65e9123910afe6e94123f6dd',
            username: 'test_user',
            });
            
            expect(unlinkMock).toHaveBeenCalledTimes(2);
        });

        test('should throw error when gallery post not found', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(null);

            const result = await deleteGalleryPost('65e9123910afe6e94123f6dd', 'test_user');

            expect(result).toEqual({ error: 'Gallery post not found' });
        });

        test('should throw error when media could not be deleted', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
            unlinkMock.mockRejectedValueOnce(new Error('Permission denied'));

            const result = await deleteGalleryPost('65e9123910afe6e94123f6dd', 'test_user');
            
            expect(result).toEqual({
                error: expect.stringContaining('Failed to delete media')
            });
        });

        test('should throw error when thumbnail media could not be deleted', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPostWithThumbnail as any);
            unlinkMock.mockResolvedValueOnce(undefined) 
            unlinkMock.mockRejectedValueOnce(new Error('Permission denied')); // Fails for thumbnail

            const result = await deleteGalleryPost('65e9123910afe6e94123f6dd', 'test_user');
            
            expect(result).toEqual({
                error: expect.stringContaining('Failed to delete thumbnail media')
            });
        });
        
        test('should throw error when deletion fails', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(mockGalleryPost as any);
            unlinkMock.mockResolvedValueOnce(undefined) 
            jest.spyOn(GalleryPostModel, 'findOneAndDelete').mockResolvedValueOnce(null);

            const result = await deleteGalleryPost('65e9123910afe6e94123f6dd', 'test_user');
            
            expect(result).toEqual({
                error: expect.stringContaining('Failed to delete gallery post after deleting media')
            });
        });

        
        test('should not delete collection belonging to another user', async () => {
            jest.spyOn(GalleryPostModel, 'findOne').mockResolvedValueOnce(null);

            const result = await deleteGalleryPost('65e9123910afe6e94123f6dd', 'test_user');

            expect(result).toEqual({
                error: expect.stringContaining('Gallery post not found')
            });
        });
  
    });

});
