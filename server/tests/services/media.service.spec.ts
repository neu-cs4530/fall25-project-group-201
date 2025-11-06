import MediaModel from '../../models/media.model';
import mediaService from '../../services/media.service';
import { Media } from '../../types/types';

describe('Add media', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMediaInput: Media = {
    filepathLocation: '/test/hogwarts-example.png',
    user: 'media1_uploader',
    fileBuffer: 'dummy_file_buffer',
  };

  describe('addMedia', () => {
    test('addMedia should return the added media', async () => {
      const savedMedia = {
        ...mockMediaInput,
        _id: '68ffe20ccbc370b3e921c07b',
        filepathLocation: `/userData/${mockMediaInput.user}/${mockMediaInput.filepathLocation}`,
      };

      // Mock the save() method on the MediaModel instance
      const saveMock = jest.fn().mockResolvedValueOnce(savedMedia);
      jest.spyOn(MediaModel.prototype, 'save').mockImplementation(saveMock);

      const result = await mediaService.addMedia(mockMediaInput);

      expect(result).toEqual(savedMedia);
      expect(saveMock).toHaveBeenCalled();
    });

    test('addMedia should return an object with error if create throws an error', async () => {
      jest.spyOn(MediaModel.prototype, 'save').mockRejectedValue(new Error('Error from db query'));
      const result = await mediaService.addMedia(mockMediaInput);
      expect(result).toEqual({ error: 'Error from db query' });
    });
  });
});
