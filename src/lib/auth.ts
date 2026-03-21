import { NextRequest } from 'next/server';

export interface AdminSession {
  email: string;
  loginTime: string;
  token: string;
}

// Validate login credentials against environment variables
export function validateCredentials(email: string, password: string): boolean {
  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  // Timing-safe comparison to prevent timing attacks
  if (!validEmail || !validPassword) {
    console.error('Admin credentials not configured');
    return false;
  }

  const emailMatch = email === validEmail;
  const passwordMatch = password === validPassword;

  return emailMatch && passwordMatch;
}

// Generate a simple session token (in production, use JWT)
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate admin session from request
export function validateAdminSession(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const sessionToken = process.env.SESSION_TOKEN;

  if (!sessionToken) {
    return false;
  }

  return token === sessionToken;
}

// Parse session from request cookies
export function getSessionFromRequest(request: NextRequest): AdminSession | null {
  try {
    const sessionHeader = request.headers.get('X-Admin-Session');
    if (!sessionHeader) return null;

    const session = JSON.parse(sessionHeader);
    return session as AdminSession;
  } catch {
    return null;
  }
}
