import mongoose, { Document, Schema, type Types } from 'mongoose';

export interface BlogDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  category: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, default: '', trim: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    category: { type: String, default: 'General' },
    author: { type: String, default: 'Prajapatt AI' },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    featuredImage: { type: String, default: '' },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

const Blog =
  mongoose.models.Blog || mongoose.model<BlogDocument>('Blog', BlogSchema);

export default Blog;
