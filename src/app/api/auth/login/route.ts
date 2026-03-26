import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations';
import { validateCredentials, generateJWT } from '@/lib/auth';

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

    // Generate JWT token (24 hour expiration)
    const token = await generateJWT(email, '24h');

    // Create response with token in secure cookie and JSON body
    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        email,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie for browser-based auth
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
