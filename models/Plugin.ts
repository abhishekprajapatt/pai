import mongoose, { Document, Schema, type Types } from 'mongoose';

export interface PluginDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'installed' | 'disabled' | 'pending';
  config: Record<string, any>;
  sourceUrl?: string;
  author?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PluginSchema = new Schema<PluginDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    version: { type: String, default: '1.0.0' },
    status: {
      type: String,
      enum: ['installed', 'disabled', 'pending'],
      default: 'installed',
    },
    config: { type: Schema.Types.Mixed, default: {} },
    sourceUrl: { type: String, default: '' },
    author: { type: String, default: 'Prajapatt AI' },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

const Plugin =
  mongoose.models.Plugin ||
  mongoose.model<PluginDocument>('Plugin', PluginSchema);

export default Plugin;
