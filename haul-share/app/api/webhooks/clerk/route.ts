import { headers } from 'next/headers';
import { Webhook } from 'svix';
import sql from '@/lib/db';

interface ClerkEmailAddress { email_address: string }

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  email_addresses: ClerkEmailAddress[];
}

interface WebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('CLERK_WEBHOOK_SECRET not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await req.text();

  let event: WebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const { type, data } = event;

  if (type === 'user.updated') {
    const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;
    await sql`
      UPDATE users
      SET display_name = COALESCE(${displayName}, display_name),
          avatar_url   = COALESCE(${data.image_url ?? null}, avatar_url)
      WHERE clerk_id = ${data.id}
    `;
  }

  if (type === 'user.deleted') {
    await sql`DELETE FROM users WHERE clerk_id = ${data.id}`;
  }

  return new Response('OK', { status: 200 });
}
