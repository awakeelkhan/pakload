import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@pakload.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+923001234567' })
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+923001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  otp: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@pakload.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Khan' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'shipper', enum: ['shipper', 'carrier', 'broker'] })
  @IsString()
  role: string;

  @ApiProperty({ example: 'Khan Logistics', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
