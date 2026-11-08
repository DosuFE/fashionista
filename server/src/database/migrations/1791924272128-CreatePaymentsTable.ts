import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1791924272128 implements MigrationInterface {
  name = 'CreatePaymentsTable1791924272128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payments_provider_enum" AS ENUM('PAYSTACK')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED')`,
    );

    await queryRunner.query(
      `CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "provider" "public"."payments_provider_enum" NOT NULL DEFAULT 'PAYSTACK',
        "reference" character varying NOT NULL,
        "amount" integer NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'NGN',
        "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING',
        "authorization_url" text,
        "gateway_transaction_id" character varying,
        "failure_reason" text,
        "paid_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "UQ_866ddee0e17d9385b4e3b86851d" UNIQUE ("reference"),
        CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "payments"
       ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"
       FOREIGN KEY ("order_id") REFERENCES "orders"("id")
       ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "payments"
       ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"
       FOREIGN KEY ("user_id") REFERENCES "users"("id")
       ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`,
    );

    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`,
    );

    await queryRunner.query(`DROP TABLE "payments"`);

    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);

    await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
  }
}
