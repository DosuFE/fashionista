import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      success: true,
      statusCode: 200,
      message: 'API is healthy',
      data: {
        status: 'ok',
      },
    };
  }
}