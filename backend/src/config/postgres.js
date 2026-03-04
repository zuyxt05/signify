import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

let sequelize;

if (process.env.DATABASE_URL) {
    // Production: Use connection string (Render provides this)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        } : {},
    });
} else {
    // Local development: Use individual env vars
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: "postgres",
            logging: false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
            retry: {
                max: 3,
            },
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL");
    } catch (error) {
        console.error("Database connection error:", error.message);
        throw error;
    }
};

connectDB();

export default sequelize;
export { sequelize, connectDB };

