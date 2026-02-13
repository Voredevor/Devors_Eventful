import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPasswordResetToUsers1700000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "resetPasswordToken",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "resetPasswordTokenExpiresAt",
        type: "timestamp",
        isNullable: true,
      })
    );

    // Increase refreshToken length
    await queryRunner.changeColumn(
      "users",
      "refreshToken",
      new TableColumn({
        name: "refreshToken",
        type: "varchar",
        length: "500",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "resetPasswordTokenExpiresAt");
    await queryRunner.dropColumn("users", "resetPasswordToken");

    // Revert refreshToken length
    await queryRunner.changeColumn(
      "users",
      "refreshToken",
      new TableColumn({
        name: "refreshToken",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }
}
