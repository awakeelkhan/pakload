import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { MockDataService } from '../mock-data/mock-data.service';
import { LoginDto, RegisterDto, RequestOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();

  constructor(
    private mockDataService: MockDataService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = this.mockDataService.getUserByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (registerDto.phone) {
      const existingPhone = this.mockDataService.getUserByPhone(registerDto.phone);
      if (existingPhone) {
        throw new BadRequestException('User with this phone number already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.mockDataService.createUser({
      ...registerDto,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email or phone
    let user;
    if (loginDto.email) {
      user = this.mockDataService.getUserByEmail(loginDto.email);
    } else if (loginDto.phone) {
      user = this.mockDataService.getUserByPhone(loginDto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    this.mockDataService.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async requestOtp(requestOtpDto: RequestOtpDto) {
    const { phone } = requestOtpDto;

    // Generate OTP (in production, use crypto.randomInt)
    const mockOtp = this.configService.get('MOCK_OTP_CODE') || '123456';
    const otp = this.configService.get('USE_MOCK_DATA') === 'true' ? mockOtp : this.generateOtp();

    // Store OTP with expiration
    this.otpStore.set(phone, {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
    });

    // In production, send SMS via Twilio
    console.log(`OTP for ${phone}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes in seconds
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp } = verifyOtpDto;

    const storedOtp = this.otpStore.get(phone);
    if (!storedOtp) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    // Check expiration
    if (new Date() > storedOtp.expiresAt) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('OTP expired');
    }

    // Check attempts
    if (storedOtp.attempts >= 3) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('Maximum OTP attempts exceeded');
    }

    // Verify OTP
    if (storedOtp.otp !== otp) {
      storedOtp.attempts++;
      this.otpStore.set(phone, storedOtp);
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP verified, remove from store
    this.otpStore.delete(phone);

    // Find or create user
    let user = this.mockDataService.getUserByPhone(phone);
    if (!user) {
      // Create new user with phone
      user = this.mockDataService.createUser({
        phone,
        phoneVerified: true,
        firstName: 'User',
        lastName: phone.slice(-4),
        role: 'carrier', // Default role
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    this.mockDataService.createSession({
      userId: user.id,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if session exists
      const session = this.mockDataService.getSession(refreshToken);
      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      // Get user
      const user = this.mockDataService.getUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update session with new refresh token
      this.mockDataService.deleteSession(refreshToken);
      this.mockDataService.createSession({
        userId: user.id,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    this.mockDataService.deleteSession(refreshToken);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes in seconds
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
