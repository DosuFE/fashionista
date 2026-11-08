import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { randomUUID } from 'crypto';

import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionsService } from './sessions.service';

@Injectable()
export class AuthService {
  private readonly refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    const user = await this.usersService.createFromAuth({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const sessionId = randomUUID();

    const accessToken = await this.createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.createRefreshToken(user.id, sessionId);

    const refreshTokenExpiresAt = this.getRefreshTokenExpiresAt();

    await this.sessionsService.createSession(
      sessionId,
      user.id,
      refreshToken,
      refreshTokenExpiresAt,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  private getRefreshTokenExpiresAt() {
    return new Date(Date.now() + this.refreshTokenTtlMs);
  }

  private async createAccessToken(user: {
    id: string;
    email: string;
    role: string;
  }) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );
  }

  private async createRefreshToken(userId: string, sessionId: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        sid: sessionId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  async refresh(refreshToken: string) {
    let payload: {
      sub: string;
      sid: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.sessionsService.findSession(payload.sid);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.sessionsService.validateRefreshToken(session, refreshToken);

    const user = await this.usersService.findOne(payload.sub);

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active');
    }

    const newAccessToken = await this.createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await this.createRefreshToken(user.id, session.id);

    const newExpiresAt = this.getRefreshTokenExpiresAt();

    await this.sessionsService.rotateRefreshToken(
      session,
      newRefreshToken,
      newExpiresAt,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    let payload: {
      sub: string;
      sid: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      return;
    }

    await this.sessionsService.revokeSession(payload.sid);
  }
}
