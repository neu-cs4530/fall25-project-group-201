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
  mediaSize: '13 GB',
  tags: [],
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
  mediaSize: '14 GB',
  tags: [],
};

const createGalleryPostSpy = jest.spyOn(gallerypostService, 'createGalleryPost');
const getEverythingSpy = jest.spyOn(gallerypostService, 'getAllGalleryPosts');
const getByIdSpy = jest.spyOn(gallerypostService, 'getGalleryPostById');
const deleteSpy = jest.spyOn(gallerypostService, 'deleteGalleryPost');
const incrementViewsSpy = jest.spyOn(gallerypostService, 'fetchAndIncrementGalleryPostViewsById');
const incrementDownloadsSpy = jest.spyOn(
  gallerypostService,
  'fetchAndIncrementGalleryPostDownloadsById',
);
const toggleLikesSpy = jest.spyOn(gallerypostService, 'toggleGalleryPostLikeById');

describe('Gallery Post Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /create', () => {
    test('creates a gallery post successfully', async () => {
      const body = {
        title: 'New Gallery Post',
        description: 'New Description',
        user: 'test_user',
        media: '/test_user/testMedia.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date('2024-06-06'),
        mediaSize: '13 GB',
        tags: [],
      };

      const created = {
        ...body,
        _id: new mongoose.Types.ObjectId(),
        views: 0,
        downloads: 0,
        likes: [],
      };

      createGalleryPostSpy.mockResolvedValueOnce(created);

      const res = await supertest(app)
        .post('/api/gallery/create')
        .send({ ...body, postedAt: body.postedAt.toISOString() });

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(created._id.toString());

      expect(createGalleryPostSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...body,
          postedAt: body.postedAt.toISOString(),
        }),
      );
    });

    test('returns 500 on service error', async () => {
      createGalleryPostSpy.mockResolvedValueOnce({ error: 'DB error' });

      const res = await supertest(app).post('/api/gallery/create').send({
        title: 'Bad',
        description: 'Bad',
        user: 'test',
        media: '/x.png',
        community: '123',
        tags: [],
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain('Error creating a gallery post: DB error');
    });
  });

  describe('GET /getAllGalleryPosts', () => {
    test('returns all gallery posts', async () => {
      getEverythingSpy.mockResolvedValueOnce([mockGalleryPost, mockGalleryPost2]);

      const res = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    test('returns 500 on service error', async () => {
      getEverythingSpy.mockResolvedValueOnce({ error: 'DB error' });

      const res = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /getGalleryPost/:id', () => {
    test('returns a gallery post', async () => {
      getByIdSpy.mockResolvedValueOnce(mockGalleryPost);

      const res = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id.toString()}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(mockGalleryPost.title);
    });

    test('returns 500 when service errors', async () => {
      getByIdSpy.mockResolvedValueOnce({ error: 'Not found' });

      const res = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id.toString()}`,
      );

      expect(res.status).toBe(500);
      expect(res.text).toContain('Error retrieving gallery post: Not found');
    });
  });

  describe('DELETE /delete/:id', () => {
    test('deletes successfully', async () => {
      deleteSpy.mockResolvedValueOnce(mockGalleryPost);

      const res = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id}`)
        .query({ username: mockGalleryPost.user });

      expect(res.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalledWith(mockGalleryPost._id.toString(), mockGalleryPost.user);
    });

    test('returns 500 when service throws', async () => {
      deleteSpy.mockRejectedValueOnce(new Error('DB error'));

      const res = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id}`)
        .query({ username: mockGalleryPost.user });

      expect(res.status).toBe(500);
      expect(res.text).toContain('Error deleting gallery post: DB error');
    });

    test('returns 500 on service error return', async () => {
      deleteSpy.mockResolvedValueOnce({ error: 'Not found' });

      const res = await supertest(app)
        .delete(`/api/gallery/delete/${mockGalleryPost._id}`)
        .query({ username: mockGalleryPost.user });

      expect(res.status).toBe(500);
      expect(res.text).toContain('Error deleting gallery post: Not found');
    });
  });

  describe('POST /incrementViews/:id/:username', () => {
    test('increments views', async () => {
      incrementViewsSpy.mockResolvedValueOnce({
        ...mockGalleryPost,
        views: 1,
      });

      const res = await supertest(app).post(
        `/api/gallery/incrementViews/${mockGalleryPost._id}/tester`,
      );

      expect(res.status).toBe(200);
      expect(res.body.views).toBe(1);
      expect(incrementViewsSpy).toHaveBeenCalledWith(mockGalleryPost._id.toString());
    });

    test('returns 500 on service error', async () => {
      incrementViewsSpy.mockResolvedValueOnce({ error: 'DB error' });

      const res = await supertest(app).post(
        `/api/gallery/incrementViews/${mockGalleryPost._id}/tester`,
      );

      expect(res.status).toBe(500);
      expect(res.text).toContain('Error incrementing gallery post views: DB error');
    });
  });

  describe('POST /incrementDownloads/:id/:username', () => {
    test('increments downloads', async () => {
      incrementDownloadsSpy.mockResolvedValueOnce({
        ...mockGalleryPost,
        downloads: 1,
      } as any);

      const res = await supertest(app).post(
        `/api/gallery/incrementDownloads/${mockGalleryPost._id}/tester`,
      );

      expect(res.status).toBe(200);
      expect(res.body.downloads).toBe(1);
      expect(incrementDownloadsSpy).toHaveBeenCalledWith(mockGalleryPost._id.toString());
    });

    test('returns 500 on service error', async () => {
      incrementDownloadsSpy.mockResolvedValueOnce({ error: 'DB error' });

      const res = await supertest(app).post(
        `/api/gallery/incrementDownloads/${mockGalleryPost._id}/tester`,
      );

      expect(res.status).toBe(500);
    });
  });

  describe('POST /toggleLikes/:id/:username', () => {
    test('toggles likes', async () => {
      toggleLikesSpy.mockResolvedValueOnce({
        ...mockGalleryPost,
        likes: ['tester'],
      });

      const res = await supertest(app).post(
        `/api/gallery/toggleLikes/${mockGalleryPost._id}/tester`,
      );

      expect(res.status).toBe(200);
      expect(res.body.likes).toContain('tester');
    });

    test('returns 500 on service error', async () => {
      toggleLikesSpy.mockResolvedValueOnce({ error: 'DB error' });

      const res = await supertest(app).post(
        `/api/gallery/toggleLikes/${mockGalleryPost._id}/tester`,
      );

      expect(res.status).toBe(500);
      expect(res.text).toContain('Error toggling gallery post like: DB error');
    });
  });
});
