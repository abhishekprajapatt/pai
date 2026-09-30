import Chat from '@/models/Chat';
import connectDB from '@/database/db';
import { getUserIdFromRequest } from '@/server/auth';
import { NextRequest, NextResponse } from 'next/server';

interface RenameChatRequestBody {
  chatId: string;
  name: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('[RENAME] POST Request received');
    const authHeader = req.headers.get('Authorization');
    console.log('[RENAME] Auth header present:', !!authHeader);

    const userId = await getUserIdFromRequest(req);
    console.log('[RENAME] User ID extracted:', !!userId);

    if (!userId) {
      console.error('[RENAME] User not authenticated - userId is falsy');
      return NextResponse.json(
        {
          success: false,
          message: 'User not authenticated',
        },
        { status: 401 },
      );
    }

    const { chatId, name }: RenameChatRequestBody = await req.json();
    console.log('[RENAME] Chat ID:', chatId, 'New name:', name);

    if (
      chatId.startsWith('temp_') ||
      chatId.startsWith('local_') ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        chatId,
      )
    ) {
      return NextResponse.json({
        success: true,
        message: 'Local chat renamed',
      });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Database unavailable; chat kept locally',
      });
    }

    const updateResult = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name },
    );
    console.log('[RENAME] Update result:', !!updateResult);

    return NextResponse.json({ success: true, message: 'Chat Renamed' });
  } catch (error: any) {
    console.error('[RENAME] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
