import mongoose, { Document, Schema, type Types } from 'mongoose';

export interface ProjectDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  summary: string;
  status: 'draft' | 'active' | 'archived';
  tags: string[];
  ownerId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    summary: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    tags: { type: [String], default: [] },
    ownerId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const Project =
  mongoose.models.Project ||
  mongoose.model<ProjectDocument>('Project', ProjectSchema);

export default Project;
