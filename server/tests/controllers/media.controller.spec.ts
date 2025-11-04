import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as mediaService from '../../services/media.service';
import { DatabaseMedia } from '../../types/types';

// Service method spies
const addMediaSpy = jest.spyOn(mediaService, 'addMedia');

describe('POST /create', () => {
    test('should create a new media successfully', async () => {
      const mockReqBody = {
        filepathLocation: "New Media",
        user: "media1_uploader",
        fileBuffer: Buffer.from('dummy file content'),
      };

      const createdCommunity: DatabaseMedia = {
        ...mockReqBody,
        _id: new mongoose.Types.ObjectId(),
      };

      addMediaSpy.mockResolvedValueOnce(createdCommunity);

      const response = await supertest(app)
        .post('/api/media/create')
        .field('filepathLocation', 'New Media')
        .field('user', 'media1_uploader')
        .attach('file', Buffer.from('dummy file content'), 'dummy.txt');


      expect(response.status).toBe(200);
      expect(addMediaSpy).toHaveBeenCalledWith({
        filepathLocation: "New Media",
        user: "media1_uploader",
        fileBuffer: Buffer.from('dummy file content')
      });
    });

    /*
    test('should create community with default visibility when not provided', async () => {
      const mockReqBody = {
        name: 'New Community',
        description: 'New Description',
        admin: 'new_admin',
      };

      const createdCommunity: DatabaseCommunity = {
        ...mockReqBody,
        _id: new mongoose.Types.ObjectId(),
        participants: ['new_admin'],
        visibility: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      createCommunitySpy.mockResolvedValueOnce(createdCommunity);

      const response = await supertest(app).post('/api/community/create').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(createCommunitySpy).toHaveBeenCalledWith({
        name: mockReqBody.name,
        description: mockReqBody.description,
        admin: mockReqBody.admin,
        participants: ['new_admin'],
        visibility: 'PUBLIC',
      });
    });

    test('should return 400 when missing name', async () => {
      const mockReqBody = {
        description: 'New Description',
        admin: 'new_admin',
      };

      const response = await supertest(app).post('/api/community/create').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/name');
    });

    test('should return 400 when missing description', async () => {
      const mockReqBody = {
        name: 'New Community',
        admin: 'new_admin',
      };

      const response = await supertest(app).post('/api/community/create').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/description');
    });

    test('should return 400 when missing admin', async () => {
      const mockReqBody = {
        name: 'New Community',
        description: 'New Description',
      };

      const response = await supertest(app).post('/api/community/create').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/admin');
    });

    test('should return 500 when service returns error', async () => {
      const mockReqBody = {
        name: 'New Community',
        description: 'New Description',
        admin: 'new_admin',
      };

      createCommunitySpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).post('/api/community/create').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error creating a community: Database error');
    });*/
  });