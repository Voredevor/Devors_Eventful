import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentsTable1700000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payments",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "eventId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "ticketId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "amount",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "currency",
            type: "varchar",
            length: "10",
            default: "'NGN'",
            isNullable: false,
          },
          {
            name: "paymentReference",
            type: "varchar",
            length: "255",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "completed", "failed", "refunded"],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: "paymentMethod",
            type: "varchar",
            length: "50",
            default: "'paystack'",
            isNullable: false,
          },
          {
            name: "paymentDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "NOW()",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "NOW()",
            isNullable: false,
            onUpdate: "NOW()",
          },
        ],
        foreignKeys: [
          {
            name: "FK_payments_userId",
            columnNames: ["userId"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: "FK_payments_eventId",
            columnNames: ["eventId"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: "FK_payments_ticketId",
            columnNames: ["ticketId"],
            referencedTableName: "tickets",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
        indices: [
          {
            name: "IDX_payments_userId",
            columnNames: ["userId"],
          },
          {
            name: "IDX_payments_eventId",
            columnNames: ["eventId"],
          },
          {
            name: "IDX_payments_status",
            columnNames: ["status"],
          },
          {
            name: "IDX_payments_paymentReference",
            columnNames: ["paymentReference"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payments");
  }
}
