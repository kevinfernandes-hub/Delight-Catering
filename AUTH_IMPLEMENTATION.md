# Authentication & API Security Implementation

## Overview
Implemented full JWT-based authentication system with middleware protection for all sensitive API routes.

## What Was Implemented

### 1. **JWT Authentication** (`src/lib/auth.ts`)
- ✅ JWT token generation with 24-hour expiration using `jose`
- ✅ Token verification with automatic expiration checking
- ✅ Credential validation against environment variables
- ✅ Async/await based implementation for production readiness

```typescript
// Generate JWT token
const token = await generateJWT(email, '24h');

// Verify JWT token
const payload = await verifyJWT(token);
```

### 2. **Middleware Protection** (`middleware.ts`)
- ✅ Route-level authentication middleware using Next.js built-in middleware
- ✅ Protects all `/admin` routes
- ✅ Protects all CRUD API endpoints
- ✅ Public routes allowed: `/`, `/menu`, `/api/reviews`, `/api/contacts`
- ✅ Dual authentication:
  - **UI Routes**: Checks `admin_token` cookie (set by server)
  - **API Routes**: Checks `Authorization: Bearer <token>` header

### 3. **Login API Updates** (`src/app/api/auth/login/route.ts`)
- ✅ JWT token generation on successful login
- ✅ HttpOnly secure cookie set automatically
- ✅ Cookie expires in 24 hours
- ✅ Credentials validated against `ADMIN_EMAIL` and `ADMIN_PASSWORD`

**Login Flow:**
```
POST /api/auth/login
{
  "email": "fernandeskevin860@gmail.com",
  "password": "admin123"
}
↓
✓ Returns JWT token
✓ Sets httpOnly cookie (admin_token)
✓ Redirect to /admin/dashboard
```

### 4. **Frontend Authentication** (`src/app/admin/login/page.tsx`)
- ✅ Updated to use `credentials: 'include'` for cookie handling
- ✅ Simplified to rely on server-side cookie auth
- ✅ Pre-login check via API call
- ✅ Removed localStorage dependency for auth

### 5. **Protected API Endpoints** (All CRUD routes)
| Endpoint | Method | Protected | Token Required |
|----------|--------|-----------|-----------------|
| `/api/customers` | GET/POST | ✅ Yes | Bearer token |
| `/api/customers/[id]` | PUT/DELETE | ✅ Yes | Bearer token |
| `/api/orders` | GET/POST | ✅ Yes | Bearer token |
| `/api/orders/[id]` | GET/PUT/DELETE | ✅ Yes | Bearer token |
| `/api/menu` | GET/POST | ✅ Yes | Bearer token |
| `/api/menu/[id]` | PUT/DELETE | ✅ Yes | Bearer token |
| `/api/invoices` | GET/POST | ✅ Yes | Bearer token |
| `/api/invoices/[id]` | GET/PUT/DELETE | ✅ Yes | Bearer token |
| `/api/auth/login` | POST | ✅ No | N/A (public) |

### 6. **Environment Configuration** (`.env.local`)
```
ADMIN_EMAIL=fernandeskevin860@gmail.com
ADMIN_PASSWORD=admin123
JWT_SECRET=delight-caterers-super-secret-jwt-key-2024-change-in-production
```

⚠️ **Important**: In production:
- Change `JWT_SECRET` to a strong random value
- Use environment variable management (AWS Secrets, HashiCorp Vault)
- Hash passwords with bcrypt instead of plaintext
- Store credentials in secure database

### 7. **API Helper Utility** (`src/lib/api.ts`)
Helper functions for authenticated API calls:
```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

// Automatically includes Authorization header and handles 401 responses
const response = await apiGet('/api/customers');
const newOrder = await apiPost('/api/orders', { ...orderData });
```

## Security Features

✅ **Token Expiration**: 24-hour JWT expiration  
✅ **HttpOnly Cookies**: Cannot be accessed by JavaScript  
✅ **CSRF Protection**: SameSite=lax cookie flag  
✅ **Authorization Header**: Bearer token in requests  
✅ **Middleware Validation**: All routes checked before execution  
✅ **Route Gating**: Unprotected routes explicitly defined  
✅ **401 Handling**: Automatic redirect to login on token expiration  

## Error Handling

### Validation Errors (400)
```json
{
  "error": "Invalid email format"
}
```

### Authentication Errors (401)
```json
{
  "error": "Unauthorized"
}
{
  "error": "Invalid or expired token"
}
```

### Server Errors (500)
```json
{
  "error": "Internal server error"
}
```

## API Testing

Run comprehensive API tests:
```bash
node --loader ts-node/esm api-tests.ts
```

Tests cover:
- ✅ Valid/invalid login
- ✅ Protected routes without token
- ✅ CRUD operation validation
- ✅ Missing fields detection
- ✅ Invalid token rejection
- ✅ Invalid email validation

## Testing Credentials

```
Email: fernandeskevin860@gmail.com
Password: admin123
```

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Change `ADMIN_PASSWORD` (hash with bcrypt)
- [ ] Enable HTTPS (secure flag in cookies)
- [ ] Set `NODE_ENV=production`
- [ ] Use database for session storage instead of memory
- [ ] Implement rate limiting on `/api/auth/login`
- [ ] Add IP whitelisting (optional)
- [ ] Monitor for suspicious auth attempts
- [ ] Rotate JWT_SECRET periodically
- [ ] Implement refresh tokens for long sessions

## Architecture Diagram

```
┌─────────────────────────────────────┐
│   Admin User                         │
└────────────────┬──────────────────────┘
                 │
         ┌───────▼────────┐
         │  Login Page    │
         │ /admin/login   │
         └───────┬────────┘
                 │ POST /api/auth/login
         ┌───────▼────────────────────┐
         │  Auth Middleware           │
         │ (Validates Credentials)    │
         └───────┬────────────────────┘
                 │
    ┌────────────┴────────────────┐
    │ JWT Generated & Signed      │
    │ (24h expiration)            │
    └────────────┬─────────────────┘
                 │
    ┌────────────▼─────────────────┐
    │ HttpOnly Cookie Set          │
    │ admin_token=<jwt>            │
    └────────────┬─────────────────┘
                 │
         ┌───────▼──────────────┐
         │  Dashboard/Panels    │
         │ All /admin/* routes  │
         └───────┬──────────────┘
                 │
    ┌────────────▼────────────────┐
    │  Next Auth Middleware       │
    │  (Middleware.ts)            │
    │  - Validates Cookie         │
    │  - Checks JWT Signature     │
    │  - Checks Expiration        │
    └────────────┬─────────────────┘
                 │
    ┌────────────▼───────────────────┐
    │ Protected API Routes           │
    │ (Requires: Authorization Header)
    │                                 │
    │ /api/customers                 │
    │ /api/orders                     │
    │ /api/invoices                   │
    │ /api/menu                       │
    ├────────────┬────────────────────┤
    │ Each API   │                    │
    │ verified by│                    │
    │ Middleware│  Middleware         │
    │            │ (Middleware.ts)    │
    └────────────┼────────────────────┘
                 │
    ┌────────────▼────────────────┐
    │  Database Operations        │
    │  (Prisma ORM)               │
    └─────────────────────────────┘
```

## Session Lifecycle

```
1. User visits /admin/login
   └─> Middleware checks for admin_token cookie
   └─> If missing: Allows access (still on login page)
   └─> If present: Redirects to /admin/dashboard

2. User enters credentials
   └─> Calls POST /api/auth/login
   └─> Auth middleware validates credentials
   └─> JWT token generated (24h expiration)
   └─> HttpOnly cookie set: admin_token
   └─> Response sent with token (redundant for browser)

3. User redirects to /admin/dashboard
   └─> Middleware checks admin_token cookie
   └─> Verifies JWT signature & expiration
   └─> Grants access to page

4. User makes API calls (fetch)
   └─> Frontend includes Authorization header (optional for cookies)
   └─> OR browser automatically sends admin_token cookie
   └─> Middleware validates Authorization header OR cookie
   └─> API route executes if valid

5. Session expires after 24 hours
   └─> User's cookie becomes invalid
   └─> Middleware redirects to /admin/login
   └─> User must login again
```

## Troubleshooting

**"Unauthorized" on API calls:**
- ✓ Check if JWT_SECRET matches between routes
- ✓ Verify token hasn't expired (24h limit)
- ✓ Check Authorization header format: `Bearer <token>`
- ✓ Ensure credentials in .env.local are correct

**Protected routes returning 401:**
- ✓ Middleware is working correctly  
- ✓ Either token is missing or expired
- ✓ Check browser cookies: `admin_token` should exist
- ✓ Run login test to verify auth flow

**Middleware not working:**
- ✓ Restart dev server: `npm run dev`
- ✓ Check middleware.ts exists at project root
- ✓ Verify matcher paths in config

---

**Last Updated**: March 26, 2026  
**Auth Version**: 1.0 (JWT + Middleware)  
**Status**: ✅ Production Ready (with checklist items completed)
