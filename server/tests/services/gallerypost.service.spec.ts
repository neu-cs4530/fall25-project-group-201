import mongoose from 'mongoose';
import GalleryPostModel from '../../models/gallerypost.model';
import { GalleryPost, DatabaseGalleryPost } from '../../types/types';
import {
    createGalleryPost
} from '../../services/gallerypost.service';

describe('Gallery Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGalleryPostInput: GalleryPost = {
    title: 'New Gallery Post',
    description: 'New Description',
    user: 'new_user',
    media: '/fake/media.png',
    community: '65e9b58910afe6e94fc6e6dd',
    postedAt: new Date('2024-06-06')
  }

  const mockGalleryPostInputWithThumbnail: GalleryPost = {
    title: 'New Gallery Post',
    description: 'New Description',
    user: 'new_user',
    media: '/fake/media.png',
    community: '65e9b58910afe6e94fc6e6dd',
    thumbnailMedia: 'fake/thumbnailMedia.png',
    postedAt: new Date('2024-06-06')
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

});
