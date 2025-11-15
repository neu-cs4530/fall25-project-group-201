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
  views: 0,
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
  views: 0,
  downloads: 0,
  likes: [],
};

// Service Spies
const createGalleryPostSpy = jest.spyOn(gallerypostService, 'createGalleryPost');
const getGalleriesSpy = jest.spyOn(gallerypostService, 'getAllGalleryPosts');
const getGalleryByIdSpy = jest.spyOn(gallerypostService, 'getGalleryPostById');
const deleteGalleryPostSpy = jest.spyOn(gallerypostService, 'deleteGalleryPost');
const incrementViewsSpy = jest.spyOn(gallerypostService, 'fetchAndIncrementGalleryPostViewsById');
const incrementDownloadsSpy = jest.spyOn(
  gallerypostService,
  'fetchAndIncrementGalleryPostDownloadsById',
);
const toggleLikesSpy = jest.spyOn(gallerypostService, 'toggleGalleryPostLikeById');

describe('Gallery Post Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /create', () => {
    test('should create a gallery post successfully', async () => {
      const mockReqBody = {
        title: 'New Gallery Post',
        description: 'New Description',
        user: 'test_user',
        media: '/test_user/testMedia.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      const createdPost = {
        ...mockReqBody,
        _id: new mongoose.Types.ObjectId(),
        views: 0,
        downloads: 0,
        likes: [],
      };

      createGalleryPostSpy.mockResolvedValueOnce(createdPost);

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(createdPost._id.toString());
      expect(createGalleryPostSpy).toHaveBeenCalled();
    });

    test('should return 500 on service error', async () => {
      createGalleryPostSpy.mockResolvedValueOnce({ error: 'DB error' });

      const response = await supertest(app).post('/api/gallery/create').send({
        title: 'Bad',
        description: 'Bad',
        user: 'test',
        media: '/x.png',
        community: '123',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error creating a gallery post: DB error');
    });
  });

  describe('GET /getAllGalleryPosts', () => {
    test('should return all gallery posts', async () => {
      getGalleriesSpy.mockResolvedValueOnce([mockGalleryPost, mockGalleryPost2]);

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    test('should return 500 on service error', async () => {
      getGalleriesSpy.mockResolvedValueOnce({ error: 'DB error' });

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getGalleryPost/:id', () => {
    test('should return a gallery post', async () => {
      getGalleryByIdSpy.mockResolvedValueOnce(mockGalleryPost);

      const response = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(mockGalleryPost.title);
    });

    test('should return 500 on service error', async () => {
      getGalleryByIdSpy.mockResolvedValueOnce({ error: 'Not found' });

      const response = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id}`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error retrieving gallery post: Not found');
    });
  });

  describe('DELETE /delete/:id', () => {
    test('should delete successfully', async () => {
      deleteGalleryPostSpy.mockResolvedValueOnce(mockGalleryPost);

      const response = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id}`)
        .query({ username: mockGalleryPost.user });

      expect(response.status).toBe(200);
      expect(deleteGalleryPostSpy).toHaveBeenCalledWith(
        mockGalleryPost._id.toString(),
        mockGalleryPost.user,
      );
    });

    test('should return 500 on thrown error', async () => {
      deleteGalleryPostSpy.mockRejectedValueOnce(new Error('DB error'));

      const response = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id}`)
        .query({ username: mockGalleryPost.user });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error deleting gallery post: DB error');
    });

    test('should return 500 on service error', async () => {
      deleteGalleryPostSpy.mockResolvedValueOnce({ error: 'Not found' });

      const response = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id}`)
        .query({ username: mockGalleryPost.user });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error deleting gallery post: Not found');
    });
  });

  describe('POST /incrementViews/:id/:username', () => {
    test('should increment views', async () => {
      incrementViewsSpy.mockResolvedValueOnce({
        ...mockGalleryPost,
        views: 1,
      });

      const response = await supertest(app).post(
        `/api/gallery/incrementViews/${mockGalleryPost._id}/tester`,
      );

      expect(response.status).toBe(200);
      expect(response.body.views).toBe(1);
      expect(incrementViewsSpy).toHaveBeenCalledWith(mockGalleryPost._id.toString());
    });

    test('should return 500 on service error', async () => {
      incrementViewsSpy.mockResolvedValueOnce({ error: 'DB error' });

      const response = await supertest(app).post(
        `/api/gallery/incrementViews/${mockGalleryPost._id}/tester`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error incrementing gallery post views: DB error');
    });
  });

  describe('POST /incrementDownloads/:id/:username', () => {
    test('should increment downloads', async () => {
      incrementDownloadsSpy.mockResolvedValueOnce({
        ...mockGalleryPost,
        downloads: 1,
      });

      const response = await supertest(app).post(
        `/api/gallery/incrementDownloads/${mockGalleryPost._id}/tester`,
      );

      expect(response.status).toBe(200);
      expect(response.body.downloads).toBe(1);
    });

    test('should return 500 on service error', async () => {
      incrementDownloadsSpy.mockResolvedValueOnce({ error: 'DB error' });

      const response = await supertest(app).post(
        `/api/gallery/incrementDownloads/${mockGalleryPost._id}/tester`,
      );

      expect(response.status).toBe(500);
    });
  });

  describe('POST /toggleLikes/:id/:username', () => {
    test('should toggle likes', async () => {
      toggleLikesSpy.mockResolvedValueOnce({
        ...mockGalleryPost,
        likes: ['tester'],
      });

      const response = await supertest(app).post(
        `/api/gallery/toggleLikes/${mockGalleryPost._id}/tester`,
      );

      expect(response.status).toBe(200);
      expect(response.body.likes).toContain('tester');
    });

    test('should return 500 on service error', async () => {
      toggleLikesSpy.mockResolvedValueOnce({ error: 'DB error' });

      const response = await supertest(app).post(
        `/api/gallery/toggleLikes/${mockGalleryPost._id}/tester`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error toggling gallery post like: DB error');
    });
  });
});
