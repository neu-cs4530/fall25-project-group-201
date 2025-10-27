import { Schema } from 'mongoose';

const mediaSchema: Schema = new Schema(
  {
    filepathLocation: String,
    fileBuffer: String,
    fileSize: Number,
    fileType: String,
  },
  { collection: 'Media' },
);

export default mediaSchema;
