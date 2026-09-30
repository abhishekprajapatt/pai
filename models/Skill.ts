import mongoose, { Document, Schema, type Types } from 'mongoose';

export interface SkillDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  status: 'enabled' | 'disabled' | 'draft';
  prompt?: string;
  config: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<SkillDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    version: { type: String, default: '1.0.0' },
    author: { type: String, default: 'Prajapatt AI' },
    status: {
      type: String,
      enum: ['enabled', 'disabled', 'draft'],
      default: 'draft',
    },
    prompt: { type: String, default: '' },
    config: { type: Schema.Types.Mixed, default: {} },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

const Skill =
  mongoose.models.Skill || mongoose.model<SkillDocument>('Skill', SkillSchema);

export default Skill;
