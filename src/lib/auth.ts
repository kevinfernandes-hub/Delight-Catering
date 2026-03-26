import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export interface AdminSession {
  email: string;
  loginTime: string;
  token: string;
  expiresAt?: number;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-dev-secret-key-change-in-production'
);

// Validate login credentials against environment variables
export function validateCredentials(email: string, password: string): boolean {
  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    console.error('Admin credentials not configured');
    return false;
  }

  const emailMatch = email === validEmail;
  const passwordMatch = password === validPassword;

  return emailMatch && passwordMatch;
}

// Generate JWT token with expiration
export async function generateJWT(email: string, expiresIn: string = '24h'): Promise<string> {
  const token = await new SignJWT({ email, iat: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<{ email: string; iat: number } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { email: string; iat: number };
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
}

// Validate admin session from request
export async function validateAdminSession(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);

  return payload !== null;
}

// Parse JWT from Authorization header
export async function getSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    
    if (!payload) return null;

    return {
      email: payload.email,
      loginTime: new Date(payload.iat * 1000).toISOString(),
      token,
      expiresAt: payload.iat
    };
  } catch {
    return null;
  }
}

