import { NextRequest } from 'next/server';
import {
  directoryDelete,
  directoryGet,
  directoryPost,
} from '@/server/directoryApi';

export const GET = (req: NextRequest) => directoryGet(req, 'plugins');
export const POST = (req: NextRequest) => directoryPost(req, 'plugins');
export const DELETE = (req: NextRequest) => directoryDelete(req, 'plugins');
