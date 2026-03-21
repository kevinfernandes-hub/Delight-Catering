import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations';
import { validateCredentials, generateSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Validate credentials against environment variables
    if (!validateCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateSessionToken();

    // Store token in environment for this session
    // In production, use a database or cache like Redis
    process.env.SESSION_TOKEN = token;

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
