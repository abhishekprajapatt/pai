import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/database/db';
import { parseSyncUserPayload } from '@/validations/auth';

export async function POST(req: NextRequest) {
  try {
    const body = parseSyncUserPayload(await req.json());

    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { uid, email, name, image, authProvider } = body;

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message:
            'Database unavailable; authentication is still active locally',
        },
        { status: 200 },
      );
    }

    // Optimize: Use findOneAndUpdate with upsert to reduce queries from 2 to 1
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        name,
        image: image || undefined,
        firebaseUid: uid,
        authProvider,
      },
      {
        new: true,
        upsert: true,
        lean: true, // Returns plain object instead of Mongoose document for faster serialization
        projection: { __v: 0 }, // Exclude unnecessary fields
      },
    );

    // Add cache headers for better performance
    const response = NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: updatedUser ? 'User synced' : 'User created',
      },
      { status: 200 },
    );

    // Cache this response for 5 minutes since user data doesn't change frequently
    response.headers.set('Cache-Control', 'private, max-age=300');

    return response;
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { success: false, message: 'Error syncing user', error },
      { status: 500 },
    );
  }
}
