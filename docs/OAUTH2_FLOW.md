# PakLoad - OAuth2 Authentication & Authorization

## 🔐 Authentication Flows

### 1. Phone Number + OTP Flow

```
┌─────────┐                                                    ┌─────────┐
│ Mobile  │                                                    │  Auth   │
│   App   │                                                    │ Service │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │  POST /auth/otp/request                                     │
     │  { phone: "+923001234567" }                                 │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │                                                              │ Generate 6-digit OTP
     │                                                              │ Store in Redis (5 min TTL)
     │                                                              │ Send via Twilio/SNS
     │                                                              │
     │  { success: true, expires_in: 300 }                         │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
     │  [User receives SMS with OTP]                               │
     │                                                              │
     │  POST /auth/otp/verify                                      │
     │  { phone: "+923001234567", otp: "123456" }                  │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │                                                              │ Verify OTP
     │                                                              │ Check attempts (max 3)
     │                                                              │ Create/Update User
     │                                                              │ Generate JWT tokens
     │                                                              │
     │  {                                                           │
     │    access_token: "eyJhbG...",                               │
     │    refresh_token: "eyJhbG...",                              │
     │    token_type: "Bearer",                                    │
     │    expires_in: 900,                                         │
     │    user: { id, phone, role, ... }                           │
     │  }                                                           │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
```

### 2. Email/Password Flow

```
┌─────────┐                                                    ┌─────────┐
│   Web   │                                                    │  Auth   │
│   App   │                                                    │ Service │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │  POST /auth/register                                        │
     │  {                                                           │
     │    email: "user@example.com",                               │
     │    password: "SecurePass123!",                              │
     │    first_name: "John",                                      │
     │    last_name: "Doe",                                        │
     │    role: "shipper"                                          │
     │  }                                                           │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │                                                              │ Validate input
     │                                                              │ Check email uniqueness
     │                                                              │ Hash password (bcrypt)
     │                                                              │ Create user record
     │                                                              │ Send verification email
     │                                                              │
     │  {                                                           │
     │    user: { id, email, role, ... },                          │
     │    message: "Verification email sent"                       │
     │  }                                                           │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
     │  [User clicks verification link in email]                   │
     │                                                              │
     │  GET /auth/verify-email?token=abc123                        │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │                                                              │ Verify token
     │                                                              │ Mark email as verified
     │                                                              │
     │  { success: true }                                          │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
     │  POST /auth/login                                           │
     │  {                                                           │
     │    email: "user@example.com",                               │
     │    password: "SecurePass123!"                               │
     │  }                                                           │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │                                                              │ Validate credentials
     │                                                              │ Check account status
     │                                                              │ Generate JWT tokens
     │                                                              │ Create session
     │                                                              │
     │  {                                                           │
     │    access_token: "eyJhbG...",                               │
     │    refresh_token: "eyJhbG...",                              │
     │    token_type: "Bearer",                                    │
     │    expires_in: 900,                                         │
     │    user: { id, email, role, ... }                           │
     │  }                                                           │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
```

### 3. Social Login (Google/Apple)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Mobile  │     │  Auth   │     │ Google  │     │   Our   │
│   App   │     │ Service │     │  OAuth  │     │   DB    │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Tap "Sign in with Google"    │               │
     │               │               │               │
     │ Open Google OAuth            │               │
     ├──────────────────────────────>│               │
     │               │               │               │
     │ [User authenticates]          │               │
     │               │               │               │
     │ Authorization Code            │               │
     │<──────────────────────────────┤               │
     │               │               │               │
     │ POST /auth/google/callback   │               │
     │ { code: "abc123" }           │               │
     ├──────────────>│               │               │
     │               │               │               │
     │               │ Exchange code for tokens      │
     │               ├──────────────>│               │
     │               │               │               │
     │               │ { id_token, access_token }    │
     │               │<──────────────┤               │
     │               │               │               │
     │               │ Verify ID token              │
     │               │ Extract user info            │
     │               │               │               │
     │               │ Find or create user          │
     │               ├──────────────────────────────>│
     │               │               │               │
     │               │ User record                   │
     │               │<──────────────────────────────┤
     │               │               │               │
     │               │ Generate our JWT tokens       │
     │               │               │               │
     │ {             │               │               │
     │   access_token,              │               │
     │   refresh_token,             │               │
     │   user: {...}                │               │
     │ }             │               │               │
     │<──────────────┤               │               │
     │               │               │               │
```

### 4. Token Refresh Flow

```
┌─────────┐                                                    ┌─────────┐
│ Client  │                                                    │  Auth   │
│   App   │                                                    │ Service │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │  API Request with expired access_token                      │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │  401 Unauthorized                                           │
     │  { error: "token_expired" }                                 │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
     │  POST /auth/refresh                                         │
     │  { refresh_token: "eyJhbG..." }                             │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
     │                                                              │ Verify refresh token
     │                                                              │ Check if revoked
     │                                                              │ Check session validity
     │                                                              │ Generate new access token
     │                                                              │ Optionally rotate refresh token
     │                                                              │
     │  {                                                           │
     │    access_token: "eyJhbG...",                               │
     │    refresh_token: "eyJhbG...", // New token                │
     │    expires_in: 900                                          │
     │  }                                                           │
     │<────────────────────────────────────────────────────────────┤
     │                                                              │
     │  Retry original API request with new token                  │
     ├────────────────────────────────────────────────────────────>│
     │                                                              │
```

## 🎫 JWT Token Structure

### Access Token (15 minutes expiry)

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2024-01"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "phone": "+923001234567",
    "role": "carrier",
    "permissions": ["load:read", "load:create", "bid:create"],
    "account_status": "active",
    "kyc_status": "verified",
    "iat": 1704067200,
    "exp": 1704068100,
    "iss": "https://api.pakload.com",
    "aud": "pakload-mobile-app"
  }
}
```

### Refresh Token (7 days expiry)

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2024-01"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "session_id": "sess_abc123",
    "token_type": "refresh",
    "iat": 1704067200,
    "exp": 1704672000,
    "iss": "https://api.pakload.com"
  }
}
```

## 🔑 Role-Based Access Control (RBAC)

### Roles & Permissions Matrix

| Permission | Shipper | Carrier | Broker | Admin |
|-----------|---------|---------|--------|-------|
| **Loads** |
| load:create | ✅ | ❌ | ✅ | ✅ |
| load:read | ✅ | ✅ | ✅ | ✅ |
| load:update_own | ✅ | ❌ | ✅ | ✅ |
| load:delete_own | ✅ | ❌ | ✅ | ✅ |
| load:update_any | ❌ | ❌ | ❌ | ✅ |
| **Bids** |
| bid:create | ❌ | ✅ | ✅ | ✅ |
| bid:read_own | ✅ | ✅ | ✅ | ✅ |
| bid:update_own | ❌ | ✅ | ✅ | ✅ |
| bid:accept | ✅ | ❌ | ✅ | ✅ |
| **Bookings** |
| booking:read_own | ✅ | ✅ | ✅ | ✅ |
| booking:update_status | ❌ | ✅ | ✅ | ✅ |
| booking:cancel_own | ✅ | ✅ | ✅ | ✅ |
| **Vehicles** |
| vehicle:create | ❌ | ✅ | ✅ | ✅ |
| vehicle:read_own | ❌ | ✅ | ✅ | ✅ |
| vehicle:update_own | ❌ | ✅ | ✅ | ✅ |
| **Admin** |
| user:verify | ❌ | ❌ | ❌ | ✅ |
| user:suspend | ❌ | ❌ | ❌ | ✅ |
| document:approve | ❌ | ❌ | ❌ | ✅ |
| analytics:view | ❌ | ❌ | ❌ | ✅ |

### Permission Check Middleware

```typescript
// NestJS Guard Example
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );
    
    if (!requiredPermissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return requiredPermissions.every(permission => 
      user.permissions?.includes(permission)
    );
  }
}

// Usage in controller
@Post('loads')
@Permissions('load:create')
@UseGuards(AuthGuard, PermissionsGuard)
async createLoad(@Body() dto: CreateLoadDto) {
  // Only users with 'load:create' permission can access
}
```

## 🛡️ Security Best Practices

### 1. Token Security

```typescript
// Token generation with security features
const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: getPermissionsForRole(user.role),
      account_status: user.account_status,
      kyc_status: user.kyc_status,
    },
    process.env.JWT_PRIVATE_KEY,
    {
      algorithm: 'RS256',
      expiresIn: '15m',
      issuer: 'https://api.pakload.com',
      audience: 'pakload-mobile-app',
      keyid: 'key-2024-01',
    }
  );
};

// Token verification
const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'https://api.pakload.com',
      audience: 'pakload-mobile-app',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expired');
    }
    throw new UnauthorizedException('Invalid token');
  }
};
```

### 2. Rate Limiting

```typescript
// Rate limit configuration
const rateLimitConfig = {
  // OTP requests: 3 per phone number per hour
  otp_request: {
    points: 3,
    duration: 3600,
    blockDuration: 3600,
  },
  
  // Login attempts: 5 per IP per 15 minutes
  login: {
    points: 5,
    duration: 900,
    blockDuration: 900,
  },
  
  // API requests: 100 per user per minute
  api: {
    points: 100,
    duration: 60,
    blockDuration: 60,
  },
};

// Implementation with Redis
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:login',
  points: 5,
  duration: 900,
});

app.post('/auth/login', async (req, res) => {
  try {
    await rateLimiter.consume(req.ip);
    // Process login
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      retry_after: error.msBeforeNext / 1000,
    });
  }
});
```

### 3. Session Management

```typescript
// Create session on login
const createSession = async (
  userId: string,
  deviceInfo: DeviceInfo
): Promise<string> => {
  const refreshToken = generateRefreshToken(userId);
  
  await db.userSessions.create({
    data: {
      userId,
      refreshToken: await hash(refreshToken),
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  
  return refreshToken;
};

// Revoke session on logout
const revokeSession = async (refreshToken: string): Promise<void> => {
  await db.userSessions.update({
    where: { refreshToken: await hash(refreshToken) },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });
};

// Revoke all sessions (logout from all devices)
const revokeAllSessions = async (userId: string): Promise<void> => {
  await db.userSessions.updateMany({
    where: { userId, revoked: false },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });
};
```

### 4. Password Security

```typescript
// Password hashing with bcrypt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Password strength validation
const validatePasswordStrength = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};
```

### 5. OTP Security

```typescript
// Generate secure OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP in Redis with expiry
const storeOTP = async (
  phone: string,
  otp: string,
  purpose: string
): Promise<void> => {
  const key = `otp:${purpose}:${phone}`;
  const data = {
    otp: await hash(otp),
    attempts: 0,
    createdAt: Date.now(),
  };
  
  await redis.setex(key, 300, JSON.stringify(data)); // 5 minutes
};

// Verify OTP with attempt limiting
const verifyOTP = async (
  phone: string,
  otp: string,
  purpose: string
): Promise<boolean> => {
  const key = `otp:${purpose}:${phone}`;
  const data = JSON.parse(await redis.get(key));
  
  if (!data) {
    throw new Error('OTP expired or not found');
  }
  
  if (data.attempts >= 3) {
    await redis.del(key);
    throw new Error('Maximum attempts exceeded');
  }
  
  const isValid = await verify(otp, data.otp);
  
  if (!isValid) {
    data.attempts++;
    await redis.setex(key, 300, JSON.stringify(data));
    throw new Error('Invalid OTP');
  }
  
  await redis.del(key);
  return true;
};
```

## 🔄 Token Rotation Strategy

```typescript
// Refresh token rotation on each use
const refreshAccessToken = async (
  refreshToken: string
): Promise<TokenPair> => {
  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);
  
  // Check if session is valid
  const session = await db.userSessions.findFirst({
    where: {
      refreshToken: await hash(refreshToken),
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });
  
  if (!session) {
    throw new UnauthorizedException('Invalid session');
  }
  
  // Get user
  const user = await db.users.findUnique({
    where: { id: payload.sub },
  });
  
  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user.id);
  
  // Update session with new refresh token
  await db.userSessions.update({
    where: { id: session.id },
    data: {
      refreshToken: await hash(newRefreshToken),
      lastUsedAt: new Date(),
    },
  });
  
  // Revoke old refresh token
  await revokeSession(refreshToken);
  
  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    expires_in: 900,
  };
};
```

## 📱 Mobile App Token Storage

```dart
// Flutter Secure Storage
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  final storage = FlutterSecureStorage();
  
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await storage.write(key: 'access_token', value: accessToken);
    await storage.write(key: 'refresh_token', value: refreshToken);
  }
  
  Future<String?> getAccessToken() async {
    return await storage.read(key: 'access_token');
  }
  
  Future<String?> getRefreshToken() async {
    return await storage.read(key: 'refresh_token');
  }
  
  Future<void> clearTokens() async {
    await storage.delete(key: 'access_token');
    await storage.delete(key: 'refresh_token');
  }
}
```

## 🌐 API Request with Auto-Refresh

```dart
// Dio Interceptor for automatic token refresh
class AuthInterceptor extends Interceptor {
  final Dio dio;
  final TokenStorage tokenStorage;
  
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
  
  @override
  Future<void> onError(
    DioError err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      try {
        final newTokens = await refreshToken();
        await tokenStorage.saveTokens(
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        );
        
        // Retry original request
        final opts = err.requestOptions;
        opts.headers['Authorization'] = 'Bearer ${newTokens.accessToken}';
        final response = await dio.fetch(opts);
        return handler.resolve(response);
      } catch (e) {
        // Refresh failed, logout user
        await tokenStorage.clearTokens();
        // Navigate to login screen
        return handler.reject(err);
      }
    }
    handler.next(err);
  }
}
```
