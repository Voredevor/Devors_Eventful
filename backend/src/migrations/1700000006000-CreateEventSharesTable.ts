import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateEventSharesTable1700000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "event_shares",
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
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "platform",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "shareLink",
            type: "varchar",
            length: "255",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "sharedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
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
            columnNames: ["userId"],
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
      "event_shares",
      new TableIndex({
        name: "IDX_event_shares_eventId",
        columnNames: ["eventId"],
      })
    );

    await queryRunner.createIndex(
      "event_shares",
      new TableIndex({
        name: "IDX_event_shares_userId",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "event_shares",
      new TableIndex({
        name: "IDX_event_shares_platform",
        columnNames: ["platform"],
      })
    );

    await queryRunner.createIndex(
      "event_shares",
      new TableIndex({
        name: "IDX_event_shares_shareLink",
        columnNames: ["shareLink"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("event_shares");
  }
}
