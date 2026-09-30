import { NextRequest } from 'next/server';
import {
  directoryDelete,
  directoryGet,
  directoryPost,
} from '@/server/directoryApi';

export const GET = (req: NextRequest) => directoryGet(req, 'skills');
export const POST = (req: NextRequest) => directoryPost(req, 'skills');
export const DELETE = (req: NextRequest) => directoryDelete(req, 'skills');
