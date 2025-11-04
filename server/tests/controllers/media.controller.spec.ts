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
      filepathLocation: 'New Media',
      user: 'media1_uploader',
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
      filepathLocation: 'New Media',
      user: 'media1_uploader',
      fileBuffer: Buffer.from('dummy file content'),
    });
  });

  test('should return 400 when missing filepathLocation', async () => {
    const response2 = await supertest(app)
      .post('/api/media/create')
      .field('user', 'media1_uploader')
      .attach('file', Buffer.from('dummy file content'), 'dummy.txt');

    expect(response2.status).toBe(400);
    expect(response2.body.error).toBe('Filepath missing');
  });

  test('should return 400 when missing file', async () => {
    const response3 = await supertest(app)
      .post('/api/media/create')
      .field('filepathLocation', 'New Media')
      .field('user', 'media1_uploader');

    expect(response3.status).toBe(400);
    expect(response3.body.error).toBe('File missing');
  });

  test('should return 400 when missing user', async () => {
    const response4 = await supertest(app)
      .post('/api/media/create')
      .field('filepathLocation', 'New Media')
      .attach('file', Buffer.from('dummy file content'), 'dummy.txt');

    expect(response4.status).toBe(400);
    expect(response4.body.error).toBe('User missing');
  });

  test('should return 500 when service returns error', async () => {
    const mockReqBody = {
      filepathLocation: 'New Media',
      user: 'media1_uploader',
      fileBuffer: Buffer.from('dummy file content'),
    };

    const createdCommunity: DatabaseMedia = {
      ...mockReqBody,
      _id: new mongoose.Types.ObjectId(),
    };

    addMediaSpy.mockResolvedValueOnce({ error: 'Database error' });

    const response = await supertest(app)
      .post('/api/media/create')
      .field('filepathLocation', 'New Media')
      .field('user', 'media1_uploader')
      .attach('file', Buffer.from('dummy file content'), 'dummy.txt');

    expect(response.status).toBe(500);
    expect(response.text).toContain('Database error');
  });
});
