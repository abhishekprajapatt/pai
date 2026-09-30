import Chat from '@/models/Chat';
import connectDB from '@/database/db';
import { getUserIdFromRequest } from '@/server/auth';
import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isVoiceMessage?: boolean;
}

interface SaveMessageRequestBody {
  chatId: string;
  message: Message;
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
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not authenticated',
        },
        { status: 401 },
      );
    }

    const { chatId, message }: SaveMessageRequestBody = await req.json();

    if (!chatId || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing chatId or message',
        },
        { status: 400 },
      );
    }

    if (
      chatId.startsWith('temp_') ||
      chatId.startsWith('local_') ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        chatId,
      )
    ) {
      return NextResponse.json({
        success: true,
        message: 'Local chat message retained',
      });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Database unavailable; message kept locally',
      });
    }

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chat not found',
        },
        { status: 404 },
      );
    }

    chat.messages.push({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      isVoiceMessage: message.isVoiceMessage || false,
    });

    await chat.save();

    return NextResponse.json({
      success: true,
      message: 'Message saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
