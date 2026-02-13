import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateAnalyticsTable1700000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "analytics",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "eventId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "creatorId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "totalAttendees",
            type: "integer",
            default: 0,
          },
          {
            name: "totalTicketsSold",
            type: "integer",
            default: 0,
          },
          {
            name: "ticketHoldersWithScannedQr",
            type: "integer",
            default: 0,
          },
          {
            name: "revenue",
            type: "decimal",
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: "dateTracked",
            type: "date",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["eventId"],
            referencedTableName: "events",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["creatorId"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    // Add indexes
    await queryRunner.createIndex(
      "analytics",
      new TableIndex({
        name: "IDX_analytics_eventId",
        columnNames: ["eventId"],
      })
    );

    await queryRunner.createIndex(
      "analytics",
      new TableIndex({
        name: "IDX_analytics_creatorId",
        columnNames: ["creatorId"],
      })
    );

    await queryRunner.createIndex(
      "analytics",
      new TableIndex({
        name: "IDX_analytics_dateTracked",
        columnNames: ["dateTracked"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("analytics");
  }
}
