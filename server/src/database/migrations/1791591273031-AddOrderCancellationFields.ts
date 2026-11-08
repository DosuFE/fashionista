import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderCancellationFields1791591273031 implements MigrationInterface {
    name = 'AddOrderCancellationFields1791591273031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "cancellation_reason" text`);
        await queryRunner.query(`CREATE TYPE "public"."orders_cancellation_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "cancellation_request_status" "public"."orders_cancellation_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "cancellation_requested_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "cancellation_reviewed_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "cancellation_review_note" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cancellation_review_note"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cancellation_reviewed_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cancellation_requested_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cancellation_request_status"`);
        await queryRunner.query(`DROP TYPE "public"."orders_cancellation_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cancellation_reason"`);
    }

}
