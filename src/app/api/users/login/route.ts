import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/repository';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(validated.data.email);
    if (!user) {
      return NextResponse.json(
        { error: `No account found for "${validated.data.email}". Please create an account.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}