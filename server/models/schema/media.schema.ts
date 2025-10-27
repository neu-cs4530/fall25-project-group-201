import { Schema } from 'mongoose';

const mediaSchema: Schema = new Schema(
  {
    filepathLocation: String,
    fileBuffer: String,
    user: String
  },
  { collection: 'Media' },
);

export default mediaSchema;
