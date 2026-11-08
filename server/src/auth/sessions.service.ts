import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  async createSession(
    sessionId: string,
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    const session = this.sessionsRepository.create({
      id: sessionId,
      userId,
      refreshTokenHash,
      expiresAt,
      revokedAt: null,
    });

    return this.sessionsRepository.save(session);
  }

  async findSession(id: string) {
    return this.sessionsRepository.findOne({
      where: { id },
    });
  }

  async validateRefreshToken(session: Session, refreshToken: string) {
    if (session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked');
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return true;
  }

  async rotateRefreshToken(
    session: Session,
    refreshToken: string,
    expiresAt: Date,
  ) {
    session.refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    session.expiresAt = expiresAt;

    return this.sessionsRepository.save(session);
  }

  //   async revokeSession(sessionId: string) {
  //     await this.sessionsRepository.update(sessionId, {
  //       revokedAt: new Date(),
  //     });
  //   }

  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      return;
    }

    session.revokedAt = new Date();

    await this.sessionsRepository.save(session);
  }
}
