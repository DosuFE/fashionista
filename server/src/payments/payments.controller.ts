import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import type { RawBodyRequest } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

import { VerifyPaymentDto } from './dto/verify-payment.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('orders/:orderId/initialize')
  initializePayment(
    @Param('orderId') orderId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.paymentsService.initializePayment(orderId, request.user.id);
  }

  @Post('verify')
  verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.paymentsService.verifyPayment(dto.reference, request.user.id);
  }

  @Post('webhook')
  async handlePaystackWebhook(
    @Headers('x-paystack-signature') signature: string | undefined,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secret) {
      throw new InternalServerErrorException(
        'Paystack configuration is missing.',
      );
    }

    const rawBody = request.rawBody;

    if (!rawBody || !signature || !/^[a-f0-9]{128}$/i.test(signature)) {
      throw new UnauthorizedException('Invalid webhook signature.');
    }

    const expectedSignature = createHmac('sha512', secret)
      .update(rawBody)
      .digest();

    const receivedSignature = Buffer.from(signature, 'hex');

    if (
      receivedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      throw new UnauthorizedException('Invalid webhook signature.');
    }

    const payload = request.body as {
      event?: string;
      data?: {
        reference?: string;
        status?: string;
      };
    };

    // Acknowledge other valid Paystack events without processing them.
    if (payload.event !== 'charge.success') {
      return { received: true, processed: false };
    }

    const reference = payload.data?.reference;

    if (!reference || payload.data?.status !== 'success') {
      return { received: true, processed: false };
    }

    return this.paymentsService.handleSuccessfulWebhook(reference);
  }
}
