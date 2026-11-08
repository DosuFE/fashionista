import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderInventoryTracking1791702773813 implements MigrationInterface {
    name = 'AddOrderInventoryTracking1791702773813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "inventory_deducted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "inventory_restored" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "inventory_restored"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "inventory_deducted"`);
    }

}
