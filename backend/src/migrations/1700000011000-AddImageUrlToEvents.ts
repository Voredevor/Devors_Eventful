import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddImageUrlToEvents1700000011000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "events",
      new TableColumn({
        name: "imageUrl",
        type: "varchar",
        length: "500",
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("events", "imageUrl");
  }
}
