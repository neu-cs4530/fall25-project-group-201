import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as gallerypostService from '../../services/gallerypost.service';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';
import * as databaseUtil from '../../utils/database.util';

const mockGalleryPostResponse = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  title: 'New Gallery Post',
  description: 'New Description',
  user: 'test_user',
  media: '/test_user/testMedia.png',
  community: '65e9b58910afe6e94fc6e6dd',
  postedAt: new Date('2024-06-06'),
};

// Service method spies
const createGalleryPostSpy = jest.spyOn(gallerypostService, 'createGalleryPost');

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

        const response = await supertest(app)
        .post('/api/gallery/create')
        .send(mockReqBody);

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

        expect(createGalleryPostSpy).toHaveBeenCalledWith({...mockReqBody, postedAt: mockReqBody.postedAt.toISOString()});
    });

    test('should return 400 when missing title', async () => {
        const mockReqBody = {
        description: 'No title here',
        user: 'test_user',
        media: '/test_user/testMedia2.png',
        community: '65e9b58910afe6e94fc6e6dd',
        postedAt: new Date(),
        };

        const response = await supertest(app)
        .post('/api/gallery/create')
        .send(mockReqBody);
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

        const response = await supertest(app)
        .post('/api/gallery/create')
        .send(mockReqBody);
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

        const response = await supertest(app)
        .post('/api/gallery/create')
        .send(mockReqBody);
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

        const response = await supertest(app)
        .post('/api/gallery/create')
        .send(mockReqBody);
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

        const response = await supertest(app)
        .post('/api/gallery/create')
        .send(mockReqBody);
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
});
