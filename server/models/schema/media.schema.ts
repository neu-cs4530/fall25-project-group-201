import { Schema } from 'mongoose';

const mediaSchema: Schema = new Schema(
  {
    text: {
      filepathLocation: String,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { collection: 'Media' },
);

export default mediaSchema;
