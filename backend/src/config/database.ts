import { DataSource } from "typeorm";
import config from "./environment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  migrationsRun: true,
  logging: false,
  entities: [
    "src/models/User.ts",
    "src/models/Event.ts",
    "src/models/Ticket.ts",
    "src/models/Payment.ts",
    "src/models/Notification.ts",
    "src/models/EventShare.ts",
    "src/models/Analytics.ts",
    "src/models/UserReminderPreference.ts",
  ],
  migrations: ["src/migrations/**/*.ts"],
  migrationsTableName: "typeorm_migrations",
  subscribers: [],
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
});

// Alias for backward compatibility
export const appDataSource = AppDataSource;
export const getDatabase = () => AppDataSource;

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✓ Database connection initialized successfully");
    }
  } catch (error) {
    console.error("✗ Failed to initialize database connection:", error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✓ Database connection closed");
    }
  } catch (error) {
    console.error("✗ Failed to close database connection:", error);
  }
};
