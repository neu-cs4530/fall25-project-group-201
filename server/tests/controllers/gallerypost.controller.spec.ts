import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as gallerypostService from '../../services/gallerypost.service';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';

const mockGalleryPost: DatabaseGalleryPost = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
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

const mockGalleryPost2: DatabaseGalleryPost = {
  _id: new mongoose.Types.ObjectId('65e9b58910abc6e94fc6123d'),
  title: 'New Gallery Post 2',
  description: 'New Description 2',
  user: 'test_user2',
  media: '/test_user/testMedia2.png',
  community: '65e9b58910afe6e94fc6e6dd',
  postedAt: new Date('2024-06-05'),
  views: [],
  downloads: 0,
  likes: [],
};

// Service method spies
const createGalleryPostSpy = jest.spyOn(gallerypostService, 'createGalleryPost');
const getGalleriesSpy = jest.spyOn(gallerypostService, 'getAllGalleryPosts');
const getGalleryByIdSpy = jest.spyOn(gallerypostService, 'getGalleryPostById');
const deleteGalleryPostSpy = jest.spyOn(gallerypostService, 'deleteGalleryPost');

describe('Gallery Post Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /create', () => {
    test('should create a new gallery post successfully', async () => {
      const mockReqBody = {
        title: 'New Gallery Post',
        description: 'New Description',
        user: 'test_user',
        media: '/test_user/testMedia.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      const createdGalleryPost = {
        ...mockReqBody,
        _id: new mongoose.Types.ObjectId(),
        views: [],
        downloads: 0,
        likes: [],
      };

      createGalleryPostSpy.mockResolvedValueOnce(createdGalleryPost);

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: createdGalleryPost.title,
        description: createdGalleryPost.description,
        user: createdGalleryPost.user,
        media: createdGalleryPost.media,
        community: createdGalleryPost.community,
      });
      expect(response.body._id).toBe(createdGalleryPost._id.toString());
    });

    test('should return 500 when service returns error', async () => {
      const mockReqBody = {
        title: 'New Gallery Post',
        description: 'New Description',
        user: 'test_user',
        media: '/test_user/testMedia.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      createGalleryPostSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error creating a gallery post: Database error');
    });
  });

  describe('GET /getAllGalleryPosts', () => {
    test('should return all gallery posts', async () => {
      getGalleriesSpy.mockResolvedValueOnce([mockGalleryPost, mockGalleryPost2]);

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should return 500 when service returns error', async () => {
      getGalleriesSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getGalleryPost/:galleryPostID', () => {
    test('should get gallery post by ID', async () => {
      getGalleryByIdSpy.mockResolvedValueOnce(mockGalleryPost);

      const response = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id.toString()}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(mockGalleryPost.title);
      expect(getGalleryByIdSpy).toHaveBeenCalledWith(mockGalleryPost._id.toString());
    });

    test('should return 500 when service returns error', async () => {
      getGalleryByIdSpy.mockResolvedValueOnce({ error: 'Gallery post not found' });

      const response = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id.toString()}`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error retrieving gallery post: Gallery post not found');
    });
  });

  describe('DELETE /delete/:galleryPostId', () => {
    test('should delete gallery post successfully', async () => {
      deleteGalleryPostSpy.mockResolvedValueOnce(mockGalleryPost);

      const response = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id.toString()}`)
        .query({ username: mockGalleryPost.user });

      expect(response.status).toBe(200);
      expect(deleteGalleryPostSpy).toHaveBeenCalledWith(
        mockGalleryPost._id.toString(),
        mockGalleryPost.user,
      );
    });

    test('should return 500 when service throws error', async () => {
      deleteGalleryPostSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id.toString()}`)
        .query({ username: mockGalleryPost.user });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error deleting gallery post: Database error');
    });

    test('should return 500 when service returns error', async () => {
      deleteGalleryPostSpy.mockResolvedValueOnce({ error: 'Gallery post not found' });

      const response = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id.toString()}`)
        .query({ username: mockGalleryPost.user });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error deleting gallery post: Gallery post not found');
    });
  });
});
