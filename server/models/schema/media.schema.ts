import { Schema } from 'mongoose';

const mediaSchema: Schema = new Schema(
  {
    text: {
      filepathLocation: String,
      fileBuffer: String,
      fileSize: Number,
      fileType: String,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  },
  { collection: 'Media' },
);

export default mediaSchema;
