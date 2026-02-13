import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateEventsTable1700000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "events",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "creatorId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "category",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "location",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "startDate",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "endDate",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "totalTickets",
            type: "integer",
            isNullable: false,
            default: 0,
          },
          {
            name: "soldTickets",
            type: "integer",
            isNullable: false,
            default: 0,
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: "status",
            type: "enum",
            enum: ["draft", "published", "cancelled", "completed"],
            default: "'draft'",
            isNullable: false,
          },
          {
            name: "reminderDefault",
            type: "boolean",
            default: true,
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
            name: "FK_events_creatorId",
            columnNames: ["creatorId"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
        indices: [
          {
            name: "IDX_events_creatorId",
            columnNames: ["creatorId"],
          },
          {
            name: "IDX_events_status",
            columnNames: ["status"],
          },
          {
            name: "IDX_events_startDate",
            columnNames: ["startDate"],
          },
          {
            name: "IDX_events_category",
            columnNames: ["category"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("events");
  }
}
