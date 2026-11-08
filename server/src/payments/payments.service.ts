import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { Order } from '../orders/entities/order.entity';

import { PaymentStatus } from '../orders/enums/payment-status.enum';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { User, UserStatus } from '../users/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { PaymentAttemptStatus, PaymentProvider } from './enums/payment.enum';

import { DataSource } from 'typeorm';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly configService: ConfigService,

    private readonly dataSource: DataSource,
  ) {}

  async initializePayment(orderId: string, userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account cannot make payments.');
    }

    const order = await this.ordersRepository.findOne({
      where: {
        id: orderId,
        user: { id: userId },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new ConflictException('This order has already been paid.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Payment cannot be initialized for a cancelled order.',
      );
    }

    if (
      order.paymentStatus !== PaymentStatus.PENDING &&
      order.paymentStatus !== PaymentStatus.FAILED
    ) {
      throw new ConflictException('This order is not eligible for payment.');
    }

    // Prevent a second active attempt from being created for the same order.
    const existingPendingPayment = await this.paymentsRepository.findOne({
      where: {
        order: { id: order.id },
        status: PaymentAttemptStatus.PENDING,
      },
    });

    if (existingPendingPayment?.authorizationUrl) {
      return {
        message: 'A pending payment attempt already exists.',
        authorizationUrl: existingPendingPayment.authorizationUrl,
        reference: existingPendingPayment.reference,
      };
    }

    if (existingPendingPayment) {
      throw new ConflictException(
        'A payment attempt is already being processed. Please try again shortly.',
      );
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const callbackUrl = this.configService.get<string>('PAYSTACK_CALLBACK_URL');

    if (!secretKey || !callbackUrl) {
      throw new BadGatewayException(
        'Payment service is not configured correctly.',
      );
    }

    // Order.total is a PostgreSQL decimal string stored in naira.
    const totalInNaira = Number(order.total);

    if (!Number.isFinite(totalInNaira) || totalInNaira <= 0) {
      throw new BadRequestException('The order total is invalid.');
    }

    const amountInKobo = Math.round(totalInNaira * 100);

    if (!Number.isSafeInteger(amountInKobo) || amountInKobo <= 0) {
      throw new BadRequestException('The order amount is invalid.');
    }

    const reference = `FASH-${randomUUID()}`;

    const payment = this.paymentsRepository.create({
      order,
      user,
      provider: PaymentProvider.PAYSTACK,
      reference,
      amount: amountInKobo,
      currency: 'NGN',
      status: PaymentAttemptStatus.PENDING,
    });

    // Save the attempt before contacting Paystack.
    await this.paymentsRepository.save(payment);

    try {
      const response = await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: String(amountInKobo),
            currency: 'NGN',
            reference,
            callback_url: callbackUrl,
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              paymentId: payment.id,
            },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );

      const result = (await response.json()) as {
        status?: boolean;
        message?: string;
        data?: {
          authorization_url?: string;
          reference?: string;
        };
      };

      if (
        !response.ok ||
        result.status !== true ||
        !result.data?.authorization_url ||
        result.data.reference !== reference
      ) {
        payment.status = PaymentAttemptStatus.FAILED;
        payment.failureReason =
          result.message || 'Paystack could not initialize the payment.';
        await this.paymentsRepository.save(payment);

        throw new BadGatewayException(
          'Paystack could not initialize the payment. Please try again.',
        );
      }

      payment.authorizationUrl = result.data.authorization_url;
      await this.paymentsRepository.save(payment);

      return {
        message: 'Payment initialized successfully.',
        authorizationUrl: payment.authorizationUrl,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
      };
    } catch (error) {
      // Keep NestJS HTTP errors intact.
      if (error instanceof BadGatewayException) {
        throw error;
      }

      payment.status = PaymentAttemptStatus.FAILED;
      payment.failureReason = 'Unable to communicate with Paystack.';
      await this.paymentsRepository.save(payment);

      throw new BadGatewayException(
        'Unable to contact the payment provider. Please try again.',
      );
    }
  }

  async verifyPayment(reference: string, userId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: {
        reference,
        user: { id: userId },
      },
      relations: {
        order: true,
        user: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment attempt not found.');
    }

    if (payment.status === PaymentAttemptStatus.SUCCESS) {
      return {
        message: 'Payment has already been verified.',
        status: 'success',
        reference: payment.reference,
        orderId: payment.order.id,
      };
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secretKey) {
      throw new BadGatewayException(
        'Payment service is not configured correctly.',
      );
    }

    let response: Response;

    try {
      response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
          signal: AbortSignal.timeout(15000),
        },
      );
    } catch {
      throw new BadGatewayException(
        'Unable to contact Paystack. Please try again.',
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        'Paystack verification could not be completed.',
      );
    }

    const result = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: {
        id?: number;
        status?: string;
        reference?: string;
        amount?: number;
        currency?: string;
        paid_at?: string | null;
      };
    };

    if (
      result.status !== true ||
      !result.data ||
      result.data.reference !== payment.reference
    ) {
      throw new BadGatewayException(
        'Paystack returned an invalid verification response.',
      );
    }

    const transaction = result.data;

    // The gateway response must match the saved payment attempt.
    if (
      transaction.amount !== payment.amount ||
      transaction.currency !== payment.currency
    ) {
      throw new BadGatewayException(
        'The verified payment amount or currency does not match the order.',
      );
    }

    if (transaction.status !== 'success') {
      const definitelyFailed = ['failed', 'abandoned', 'reversed'].includes(
        transaction.status ?? '',
      );

      if (definitelyFailed) {
        await this.paymentsRepository.update(
          {
            id: payment.id,
            status: PaymentAttemptStatus.PENDING,
          },
          {
            status: PaymentAttemptStatus.FAILED,
            failureReason: `Paystack transaction status: ${transaction.status}`,
          },
        );
      }

      return {
        message: definitelyFailed
          ? 'The payment was not successful.'
          : 'The payment is not yet confirmed. Please check again shortly.',
        status: transaction.status ?? 'pending',
        reference: payment.reference,
        orderId: payment.order.id,
      };
    }

    // Lock and update the payment and order atomically.
    return this.dataSource.transaction(async (manager) => {
      const lockedPayment = await manager.findOne(Payment, {
        where: { id: payment.id },
        relations: { order: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedPayment) {
        throw new NotFoundException('Payment attempt not found.');
      }

      const lockedOrder = await manager.findOne(Order, {
        where: { id: lockedPayment.order.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedOrder) {
        throw new NotFoundException('Order not found.');
      }

      if (lockedPayment.status === PaymentAttemptStatus.SUCCESS) {
        return {
          message: 'Payment has already been verified.',
          status: 'success',
          reference: lockedPayment.reference,
          orderId: lockedOrder.id,
        };
      }

      if (lockedOrder.paymentStatus === PaymentStatus.PAID) {
        throw new ConflictException(
          'This order has already been paid by another payment attempt.',
        );
      }

      if (lockedOrder.status === OrderStatus.CANCELLED) {
        throw new ConflictException(
          'This order has been cancelled. Contact support to resolve the payment.',
        );
      }

      lockedPayment.status = PaymentAttemptStatus.SUCCESS;
      lockedPayment.gatewayTransactionId =
        transaction.id === undefined ? null : String(transaction.id);
      lockedPayment.paidAt = transaction.paid_at
        ? new Date(transaction.paid_at)
        : new Date();

      lockedOrder.paymentStatus = PaymentStatus.PAID;

      await manager.save(Payment, lockedPayment);
      await manager.save(Order, lockedOrder);

      return {
        message: 'Payment verified successfully.',
        status: 'success',
        reference: lockedPayment.reference,
        orderId: lockedOrder.id,
      };
    });
  }

  async handleSuccessfulWebhook(reference: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { reference },
      relations: { user: true },
    });

    // An unrelated or unknown reference must not create a payment.
    if (!payment) {
      return {
        received: true,
        processed: false,
        message: 'No matching payment attempt was found.',
      };
    }

    // Reuse the existing Paystack verification and database logic.
    return this.verifyPayment(reference, payment.user.id);
  }
}
