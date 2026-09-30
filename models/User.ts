import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICustomAIModel {
  id: string;
  provider: 'anthropic' | 'deepseek' | 'openai' | 'gemini';
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface IUserDirectoryItem {
  id: string;
  kind: 'skills' | 'connectors' | 'plugins';
  name: string;
  description: string;
  author: string;
  category: string;
  content?: string;
  remoteUrl?: string;
  source?: string;
  sourceUrl?: string;
  iconUrl?: string;
  websiteUrl?: string;
  status: 'installed' | 'connected';
  createdAt: Date;
}

export type PublicCustomAIModel = Omit<ICustomAIModel, 'apiKey'>;

interface IUser extends Document {
  _id: Types.ObjectId;
  firebaseUid: string;
  name: string;
  email: string;
  image?: string;
  authProvider: string;
  customAIModels: ICustomAIModel[];
  directoryItems: IUserDirectoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    authProvider: { type: String, default: 'password' },
    customAIModels: {
      type: [
        {
          id: { type: String, required: true },
          provider: { type: String, required: true },
          name: { type: String, required: true },
          baseUrl: { type: String, required: true },
          model: { type: String, required: true },
          apiKey: { type: String, required: true },
        },
      ],
      default: [],
    },
    directoryItems: {
      type: [
        {
          id: { type: String, required: true },
          kind: {
            type: String,
            enum: ['skills', 'connectors', 'plugins'],
            required: true,
          },
          name: { type: String, required: true },
          description: { type: String, default: '' },
          author: { type: String, default: 'You' },
          category: { type: String, default: 'Other' },
          content: { type: String, default: '' },
          remoteUrl: { type: String, default: '' },
          source: { type: String, default: '' },
          sourceUrl: { type: String, default: '' },
          iconUrl: { type: String, default: '' },
          websiteUrl: { type: String, default: '' },
          status: {
            type: String,
            enum: ['installed', 'connected'],
            required: true,
          },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
