import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNotificationsTable1700000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
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
            isNullable: true,
          },
          {
            name: "type",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "message",
            type: "text",
            isNullable: true,
          },
          {
            name: "scheduledDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "sentDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "deliveryMethod",
            type: "enum",
            enum: ["email", "sms", "in_app"],
            default: "'in_app'",
            isNullable: false,
          },
          {
            name: "read",
            type: "boolean",
            default: false,
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
            name: "FK_notifications_userId",
            columnNames: ["userId"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: "FK_notifications_eventId",
            columnNames: ["eventId"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],
        indices: [
          {
            name: "IDX_notifications_userId",
            columnNames: ["userId"],
          },
          {
            name: "IDX_notifications_eventId",
            columnNames: ["eventId"],
          },
          {
            name: "IDX_notifications_read",
            columnNames: ["read"],
          },
          {
            name: "IDX_notifications_scheduledDate",
            columnNames: ["scheduledDate"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("notifications");
  }
}
