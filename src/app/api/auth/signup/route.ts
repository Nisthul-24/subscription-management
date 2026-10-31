import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth';
import { signUpSchema } from '@/lib/validators/auth.schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone, company, address } = result.data;

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
        address: address || null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        company: true,
      },
    });

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const refreshToken = await createRefreshToken({ userId: user.id });
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
