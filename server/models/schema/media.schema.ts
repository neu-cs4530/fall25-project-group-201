import { Schema } from 'mongoose';

const mediaSchema = new Schema(
  {
    filepathLocation: {
      type: String,
      required: true,
    },
    fileBuffer: {
      type: String,
      required: false,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { collection: 'Media' },
);

export default mediaSchema;
