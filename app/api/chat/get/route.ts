import Chat from '@/models/Chat';
import connectDB from '@/database/db';
import { getUserIdFromRequest } from '@/server/auth';
import { NextRequest, NextResponse } from 'next/server';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function removeDuplicateMessages<T extends { role: string; content: unknown }>(
  messages: T[],
): T[] {
  return messages.filter((message, index) => {
    const previous = messages[index - 1];
    return (
      !previous ||
      previous.role !== message.role ||
      JSON.stringify(previous.content) !== JSON.stringify(message.content)
    );
  });
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ success: true, data: [] });
    }

    const chatId = req.nextUrl.searchParams.get('id');
    if (chatId) {
      const chat = await Chat.findOne({ _id: chatId, userId }).lean();
      if (!chat) {
        return NextResponse.json(
          { success: false, message: 'Chat not found' },
          { status: 404 },
        );
      }
      const fullChat = chat as typeof chat & {
        messages?: Array<{ role: string; content: unknown }>;
      };
      return NextResponse.json({
        success: true,
        data: {
          ...fullChat,
          messages: removeDuplicateMessages(fullChat.messages || []),
        },
      });
    }

    // Optimize: Exclude full message content, only fetch summary fields
    // This reduces payload size significantly
    const data = await Chat.find({ userId, 'messages.0': { $exists: true } })
      .select('_id name createdAt updatedAt')
      .lean() // Return plain objects for faster serialization
      .sort({ updatedAt: -1 }) // Return newest first
      .limit(100); // Safety limit to prevent large responses

    const response = NextResponse.json({ success: true, data });

    // Cache for 1 minute since chat list doesn't change frequently during session
    response.headers.set('Cache-Control', 'private, max-age=60');

    return response;
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message,
    });
  }
}
