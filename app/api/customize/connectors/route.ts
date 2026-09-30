import { NextRequest } from 'next/server';
import {
  directoryDelete,
  directoryGet,
  directoryPost,
} from '@/server/directoryApi';

export const GET = (req: NextRequest) => directoryGet(req, 'connectors');
export const POST = (req: NextRequest) => directoryPost(req, 'connectors');
export const DELETE = (req: NextRequest) => directoryDelete(req, 'connectors');
