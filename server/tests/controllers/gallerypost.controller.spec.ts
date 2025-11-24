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
        mediaSize: '1 GB',
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

  describe('File Size Preview for 3D Models', () => {
    test('creates gallery post with 3D model file size and retrieves it correctly', async () => {
      const glbFileSize = '48576000 bytes'; // 46.3 MB

      const body = {
        title: 'Dragon 3D Model',
        description: 'Fantasy dragon model',
        user: 'test_user',
        media: '/test_user/dragon.glb',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date('2024-06-06'),
        mediaSize: glbFileSize,
        tags: [],
      };

      const created = {
        ...body,
        _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6ee'),
        views: 0,
        downloads: 0,
        likes: [],
      };

      createGalleryPostSpy.mockResolvedValueOnce(created);
      getByIdSpy.mockResolvedValueOnce(created);

      // Test creation with file size
      const createRes = await supertest(app)
        .post('/api/gallery/create')
        .send({ ...body, postedAt: body.postedAt.toISOString() });

      expect(createRes.status).toBe(200);
      expect(createRes.body.mediaSize).toBe(glbFileSize);
      expect(createGalleryPostSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaSize: glbFileSize,
        }),
      );

      // Test retrieval includes file size for download preview
      const getRes = await supertest(app).get(
        `/api/gallery/getGalleryPost/${created._id.toString()}`,
      );

      expect(getRes.status).toBe(200);
      expect(getRes.body.mediaSize).toBe(glbFileSize);
      expect(getRes.body.media).toContain('.glb');
    });

    test('file size is preserved when creating post without permitDownload', async () => {
      const body = {
        title: 'Test Model',
        description: 'Testing file size without download permission',
        user: 'test_user',
        media: '/test_user/model.glb',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date('2024-06-06'),
        mediaSize: '25000000 bytes',
        tags: [],
        // permitDownload intentionally not set (defaults to undefined)
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
      expect(res.body.mediaSize).toBe('25000000 bytes');
      // File size should be present even if downloads are disabled
      expect(res.body).toHaveProperty('mediaSize');
    });

    test('displays correct file size format for download confirmation', async () => {
      const postWithFormattedSize: DatabaseGalleryPost = {
        ...mockGalleryPost,
        media: '/test_user/large_model.glb',
        mediaSize: '157286400 bytes', // 150 MB
        permitDownload: true,
      };

      getByIdSpy.mockResolvedValueOnce(postWithFormattedSize);

      const res = await supertest(app).get(
        `/api/gallery/getGalleryPost/${mockGalleryPost._id.toString()}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.mediaSize).toBe('157286400 bytes');
      expect(res.body.permitDownload).toBe(true);

      // verify all data needed for download confirmation is present
      expect(res.body).toHaveProperty('mediaSize');
      expect(res.body).toHaveProperty('media');
      expect(res.body).toHaveProperty('permitDownload');
      expect(res.body.media).toContain('.glb');
    });

    test('handles gallery post without mediaSize', async () => {
      const postWithoutSize: DatabaseGalleryPost = {
        _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
        title: 'Old Gallery Post',
        description: 'Legacy post without size',
        user: 'test_user',
        media: '/test_user/old_model.glb',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date('2024-06-06'),
        views: 0,
        downloads: 0,
        likes: [],
        tags: [],
        // mediaSize omitted
      };

      getByIdSpy.mockResolvedValueOnce(postWithoutSize);

      const res = await supertest(app).get(
        `/api/gallery/getGalleryPost/${postWithoutSize._id.toString()}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.mediaSize).toBeUndefined();
    });

    test('multiple file sizes are handled correctly across different posts', async () => {
      const posts = [
        { ...mockGalleryPost, mediaSize: '5242880 bytes' }, // 5 MB
        { ...mockGalleryPost2, mediaSize: '52428800 bytes' }, // 50 MB
      ];

      getEverythingSpy.mockResolvedValueOnce(posts);

      const res = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].mediaSize).toBe('5242880 bytes');
      expect(res.body[1].mediaSize).toBe('52428800 bytes');
    });

    test('rejects gallery post with file size over 50MB limit for .glb files', async () => {
      const oversizedFile = {
        title: 'Huge Model',
        description: 'This file is too large',
        user: 'test_user',
        media: '/test_user/giant_dragon.glb',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date('2024-06-06'),
        mediaSize: '52428800 bytes', // 50MB exactly (at limit)
        tags: [],
      };

      const wayOversized = {
        ...oversizedFile,
        mediaSize: '104857600 bytes', // 100MB
      };

      createGalleryPostSpy.mockResolvedValueOnce({
        error: 'File size exceeds maximum allowed (50MB for .glb files)'
      });

      const res = await supertest(app)
        .post('/api/gallery/create')
        .send({ ...wayOversized, postedAt: wayOversized.postedAt.toISOString() });

      expect(res.status).toBe(500);
      expect(res.text).toContain('File size exceeds maximum');
    });
  });
});

