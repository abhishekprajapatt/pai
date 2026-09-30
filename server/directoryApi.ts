import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/database/db';
import User, { type IUserDirectoryItem } from '@/models/User';
import { getUserIdFromRequest } from '@/server/auth';

export type DirectoryKind = 'skills' | 'connectors' | 'plugins';

async function getMcpCatalog(search: string, cursor: string) {
  const registryUrl = new URL(
    process.env.MCP_REGISTRY_URL ||
      'https://registry.modelcontextprotocol.io/v0.1/servers',
  );
  registryUrl.searchParams.set('limit', '100');
  if (cursor) registryUrl.searchParams.set('cursor', cursor);
  const response = await fetch(registryUrl, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error('MCP registry unavailable');
  const payload = (await response.json()) as {
    servers?: Array<{
      server?: {
        name?: string;
        title?: string;
        description?: string;
        websiteUrl?: string;
        icons?: Array<{ src?: string }>;
        remotes?: Array<{ url?: string }>;
      };
    }>;
    metadata?: { nextCursor?: string };
  };
  const normalizedSearch = search.trim().toLowerCase();
  const catalog = (payload.servers || [])
    .map(({ server }) => server)
    .filter(
      (
        server,
      ): server is {
        name: string;
        title?: string;
        description?: string;
        websiteUrl?: string;
        icons?: Array<{ src?: string }>;
        remotes?: Array<{ url?: string }>;
      } => Boolean(server?.name),
    )
    .filter(
      (server) =>
        !normalizedSearch ||
        `${server.name} ${server.title || ''} ${server.description || ''}`
          .toLowerCase()
          .includes(normalizedSearch),
    )
    .map((server) => ({
      id: `registry:${server.name}`,
      name: server.title || server.name,
      description:
        server.description || 'MCP server from the official registry.',
      author: server.name.split('/')[1] || server.name,
      category: 'MCP',
      downloads: '-',
      remoteUrl: server.remotes?.find((remote) => remote.url)?.url || '',
      iconUrl: server.icons?.find((icon) => icon.src)?.src || '',
      websiteUrl: server.websiteUrl || '',
      source: 'MCP Registry',
    }));
  return {
    items: Array.from(new Map(catalog.map((item) => [item.id, item])).values()),
    nextCursor: payload.metadata?.nextCursor || null,
  };
}

async function getGithubSkills(search: string, cursor: string) {
  const page = Number(cursor || '1');
  const response = await fetch(
    `https://api.github.com/repos/anthropics/skills/contents/skills?per_page=100&page=${page}`,
    {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 300 },
    },
  );
  if (!response.ok) throw new Error('GitHub skills catalog unavailable');
  const entries = (await response.json()) as Array<{
    type?: string;
    name?: string;
    path?: string;
    html_url?: string;
  }>;
  const normalizedSearch = search.trim().toLowerCase();
  const items = entries
    .filter((entry) => entry.type === 'dir' && entry.name)
    .filter((entry) => entry.name!.toLowerCase().includes(normalizedSearch))
    .map((entry) => ({
      id: `github:anthropics/skills:${entry.name}`,
      name: entry.name!,
      description:
        'Skill published in the official Prajapatt skills repository.',
      author: 'Prajapatt',
      category: 'Skills',
      downloads: '-',
      source: 'GitHub',
      sourceUrl:
        entry.html_url ||
        `https://github.com/anthropics/skills/tree/main/${entry.path}`,
    }));
  const nextLink = response.headers
    .get('link')
    ?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
  const nextCursor = nextLink
    ? new URL(nextLink).searchParams.get('page')
    : null;
  return { items, nextCursor };
}

export async function directoryGet(req: NextRequest, kind: DirectoryKind) {
  const searchParams = new URL(req.url).searchParams;
  if (searchParams.get('catalog')) {
    try {
      const catalog =
        kind === 'skills'
          ? await getGithubSkills(
              searchParams.get('search') || '',
              searchParams.get('cursor') || '',
            )
          : await getMcpCatalog(
              searchParams.get('search') || '',
              searchParams.get('cursor') || '',
            );
      return NextResponse.json(catalog);
    } catch {
      return NextResponse.json(
        { message: 'Directory catalog unavailable', items: [] },
        { status: 502 },
      );
    }
  }
  const firebaseUid = await getUserIdFromRequest(req);
  if (!firebaseUid)
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 },
    );
  const db = await connectDB();
  if (!db) return NextResponse.json({ items: [] });
  const user = await User.findOne({ firebaseUid })
    .select('directoryItems')
    .lean();
  const directoryItems =
    (user as unknown as { directoryItems?: IUserDirectoryItem[] } | null)
      ?.directoryItems || [];
  return NextResponse.json({
    items: directoryItems.filter((item) => item.kind === kind),
  });
}

export async function directoryPost(req: NextRequest, kind: DirectoryKind) {
  const firebaseUid = await getUserIdFromRequest(req);
  if (!firebaseUid)
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 },
    );
  const body = await req.json();
  if (!body.name?.trim())
    return NextResponse.json(
      { message: 'Invalid directory item' },
      { status: 400 },
    );
  const db = await connectDB();
  if (!db)
    return NextResponse.json(
      { message: 'Database unavailable' },
      { status: 503 },
    );
  const item = {
    id: randomUUID(),
    kind,
    name: body.name.trim(),
    description: body.description?.trim() || '',
    author: body.author?.trim() || 'You',
    category: body.category?.trim() || 'Other',
    content: body.content || '',
    remoteUrl: body.remoteUrl?.trim() || '',
    source: body.source?.trim() || '',
    sourceUrl: body.sourceUrl?.trim() || '',
    iconUrl: body.iconUrl?.trim() || '',
    websiteUrl: body.websiteUrl?.trim() || '',
    status: kind === 'skills' ? 'installed' : 'connected',
    createdAt: new Date(),
  };
  await User.findOneAndUpdate(
    { firebaseUid },
    { $push: { directoryItems: item } },
  );
  return NextResponse.json({ item }, { status: 201 });
}

export async function directoryDelete(req: NextRequest, kind: DirectoryKind) {
  const firebaseUid = await getUserIdFromRequest(req);
  if (!firebaseUid)
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 },
    );
  const id = new URL(req.url).searchParams.get('id');
  if (!id)
    return NextResponse.json(
      { message: 'Item id is required' },
      { status: 400 },
    );
  const db = await connectDB();
  if (!db)
    return NextResponse.json(
      { message: 'Database unavailable' },
      { status: 503 },
    );
  await User.updateOne(
    { firebaseUid },
    { $pull: { directoryItems: { id, kind } } },
  );
  return NextResponse.json({ success: true });
}
