import mongoose, { Document, Schema, type Types } from 'mongoose';

export interface ConnectorDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending';
  config: Record<string, any>;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectorSchema = new Schema<ConnectorDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'pending'],
      default: 'pending',
    },
    config: { type: Schema.Types.Mixed, default: {} },
    icon: { type: String, default: '' },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

const Connector =
  mongoose.models.Connector ||
  mongoose.model<ConnectorDocument>('Connector', ConnectorSchema);

export default Connector;
