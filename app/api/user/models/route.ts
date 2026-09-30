import User, { ICustomAIModel, PublicCustomAIModel } from '@/models/User';
import connectDB from '@/database/db';
import { getUserIdFromRequest } from '@/server/auth';
import { NextRequest, NextResponse } from 'next/server';

type ModelPayload = Omit<ICustomAIModel, 'id'>;

async function getAuthenticatedUser(req: NextRequest) {
  const firebaseUid = await getUserIdFromRequest(req);
  if (!firebaseUid) return null;
  const db = await connectDB();
  if (!db) return null;
  return User.findOne({ firebaseUid });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ models: [] }, { status: 200 });
    const models: PublicCustomAIModel[] = (user.customAIModels || []).map(
      (model: ICustomAIModel) => {
        const { apiKey: _apiKey, ...publicModel } = model;
        return publicModel;
      },
    );
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Failed to load user AI models:', error);
    return NextResponse.json({ models: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const model: ModelPayload = await req.json();
    if (
      !model.provider ||
      !model.name ||
      !model.baseUrl ||
      !model.model ||
      !model.apiKey
    ) {
      return NextResponse.json(
        { error: 'Incomplete model configuration' },
        { status: 400 },
      );
    }

    const newModel: ICustomAIModel = {
      ...model,
      id: `custom-${crypto.randomUUID()}`,
    };
    user.customAIModels = [...(user.customAIModels || []), newModel];
    await user.save();
    return NextResponse.json({ model: newModel }, { status: 201 });
  } catch (error) {
    console.error('Failed to save user AI model:', error);
    return NextResponse.json(
      { error: 'Failed to save AI model' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id }: { id?: string } = await req.json();
    if (!id)
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 },
      );

    user.customAIModels = (user.customAIModels || []).filter(
      (model: ICustomAIModel) => model.id !== id,
    );
    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user AI model:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI model' },
      { status: 500 },
    );
  }
}
