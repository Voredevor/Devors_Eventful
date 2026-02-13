import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTicketsTable1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tickets",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "eventId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "qrCodeData",
            type: "text",
            isNullable: true,
          },
          {
            name: "qrCodeImageUrl",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "qrScanned",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "qrScannedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "purchaseDate",
            type: "timestamp",
            default: "NOW()",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "used", "refunded"],
            default: "'active'",
            isNullable: false,
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
            name: "FK_tickets_eventId",
            columnNames: ["eventId"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: "FK_tickets_userId",
            columnNames: ["userId"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
        indices: [
          {
            name: "IDX_tickets_eventId",
            columnNames: ["eventId"],
          },
          {
            name: "IDX_tickets_userId",
            columnNames: ["userId"],
          },
          {
            name: "IDX_tickets_status",
            columnNames: ["status"],
          },
          {
            name: "IDX_tickets_qrCodeData",
            columnNames: ["qrCodeData"],
            isUnique: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("tickets");
  }
}
