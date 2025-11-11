import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as gallerypostService from '../../services/gallerypost.service';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';

const mockGalleryPostResponse = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  title: 'New Gallery Post',
  description: 'New Description',
  user: 'test_user',
  media: '/test_user/testMedia.png',
  community: '65e9b58910afe6e94fc6e6dd',
  postedAt: new Date('2024-06-06'),
};

// Mock community data
const mockGalleryPost: DatabaseGalleryPost = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  title: 'New Gallery Post',
  description: 'New Description',
  user: 'test_user',
  media: '/test_user/testMedia.png',
  community: '65e9b58910afe6e94fc6e6dd',
  postedAt: new Date('2024-06-06'),
};

const mockGalleryPost2: DatabaseGalleryPost = {
  _id: new mongoose.Types.ObjectId('65e9b58910abc6e94fc6123d'),
  title: 'New Gallery Post 2',
  description: 'New Description 2',
  user: 'test_user2',
  media: '/test_user/testMedia2.png',
  community: '65e9b58910afe6e94fc6e6dd',
  postedAt: new Date('2024-06-05'),
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
        postedAt: new Date('2024-06-06'),
      };

      const createdGalleryPost: DatabaseGalleryPost = {
        ...mockReqBody,
        _id: new mongoose.Types.ObjectId(),
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
      expect(response.body.postedAt).toBe(createdGalleryPost.postedAt.toISOString());

      expect(createGalleryPostSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        postedAt: mockReqBody.postedAt.toISOString(),
      });
    });

    test('should return 400 when missing title', async () => {
      const mockReqBody = {
        description: 'No title here',
        user: 'test_user',
        media: '/test_user/testMedia2.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);
      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/title');
    });

    test('should return 400 when missing description', async () => {
      const mockReqBody = {
        title: 'New Gallery Post No Description',
        user: 'test_user',
        media: '/test_user/testMedia2.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);
      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/description');
    });

    test('should return 400 when missing media', async () => {
      const mockReqBody = {
        title: 'New Gallery Post No Media',
        description: 'No media here',
        user: 'test_user',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);
      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/media');
    });

    test('should return 400 when missing user', async () => {
      const mockReqBody = {
        title: 'New Gallery Post No User',
        description: 'No user here',
        media: '/test_user/testMedia2.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
      };

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);
      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/user');
    });

    test('should return 400 when missing community', async () => {
      const mockReqBody = {
        title: 'New Gallery Post No Community',
        description: 'No community here',
        user: 'test_user',
        media: '/test_user/testMedia2.png',
        postedAt: new Date(),
      };

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);
      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/community');
    });

    test('should return 500 when service returns error', async () => {
      const mockReqBody = {
        title: 'New Gallery Post No Community',
        description: 'No community here',
        user: 'test_user',
        community: '65e9b58910afe6e94fc6e6dd',
        media: '/test_user/testMedia2.png',
        postedAt: new Date(),
      };

      createGalleryPostSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).post('/api/gallery/create').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error creating a gallery post: Database error');
    });
  });

  describe('GET /getAllGalleryPosts', () => {
    test('should get gallery posts successfully', async () => {
      const mockGalleryPosts = [mockGalleryPost, mockGalleryPost2];

      getGalleriesSpy.mockResolvedValueOnce(mockGalleryPosts);

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should get gallery post successfully if there is only one gallery post entry', async () => {
      const mockGalleryPosts = [mockGalleryPost2];

      getGalleriesSpy.mockResolvedValueOnce(mockGalleryPosts);

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    test('should get empty array if there are no gallery posts', async () => {
      const mockGalleryPosts: DatabaseGalleryPost[] = [];

      getGalleriesSpy.mockResolvedValueOnce(mockGalleryPosts);

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test('should return 500 when service returns error', async () => {
      getGalleriesSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).get('/api/gallery/getAllGalleryPosts');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getGalleryPost/:galleryPostID', () => {
    test('should get gallery post by id succesfully', async () => {
      getGalleryByIdSpy.mockResolvedValueOnce(mockGalleryPost);

      const response = await supertest(app).get(
        '/api/gallery/getGalleryPost/65e9b58910afe6e94fc6e6dd',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: mockGalleryPostResponse.title,
          description: mockGalleryPostResponse.description,
        }),
      );
      expect(getGalleryByIdSpy).toHaveBeenCalledWith('65e9b58910afe6e94fc6e6dd');
    });

    test('should return 400 when missing Id', async () => {
      const response = await supertest(app).get('/api/gallery/getGalleryPost/');

      expect(response.status).toBe(404);
    });

    test('should return 500 when service returns error', async () => {
      getGalleryByIdSpy.mockResolvedValueOnce({ error: 'Gallery post not found' });

      const response = await supertest(app).get(
        '/api/gallery/getGalleryPost/65e9b58910afe6e94fc6e6dd',
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error retrieving gallery post: Gallery post not found');
    });
  });

  describe('DELETE /delete/:galleryPostId', () => {
    test('should delete collection successfully', async () => {
      deleteGalleryPostSpy.mockResolvedValueOnce(mockGalleryPost);

      const response = await supertest(app)
        .delete('/api/gallery/delete/65e9b58910afe6e94fc6e6dd')
        .query({ username: 'test_user' });

      expect(response.status).toBe(200);
      expect(deleteGalleryPostSpy).toHaveBeenCalledWith('65e9b58910afe6e94fc6e6dd', 'test_user');
    });

    test('should return 400 when missing username', async () => {
      const response = await supertest(app).delete('/api/gallery/delete/65e9b58910afe6e94fc6e6dd');

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/query/username');
    });

    test('should return 400 when missing Id', async () => {
      const response = await supertest(app).delete('/api/gallery/delete/').query({
        username: 'test_user',
      });

      expect(response.status).toBe(404);
    });

    test('should return 500 when service throws error', async () => {
      deleteGalleryPostSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app)
        .delete('/api/gallery/delete/65e9b58910afe6e94fc6e6dd')
        .query({ username: 'test_user' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error deleting gallery post: Database error');
    });

    test('should return 500 when service returns error', async () => {
      deleteGalleryPostSpy.mockResolvedValueOnce({ error: 'Gallery post not found' });

      const response = await supertest(app)
        .delete('/api/gallery/delete/65e9b58910afe6e94fc6e6dd')
        .query({ username: 'test_user' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error deleting gallery post: Gallery post not found');
    });
  });
});
