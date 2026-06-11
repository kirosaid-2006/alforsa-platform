const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DB_DIALECT === 'sqlite' || !process.env.DB_DIALECT) {
    const storagePath = process.env.DB_STORAGE || './database/forsa.sqlite';
    // التأكد من أن المجلد الرئيسي لملف SQLite موجود
    const fs = require('fs');
    const dir = path.dirname(path.resolve(storagePath));
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false, // تعيين true لعرض استعلامات SQL في الكونسول
    });
} else {
    // الاتصال بـ PostgreSQL للإنتاج
    sequelize = new Sequelize(process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.NODE_ENV === 'production' ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {},
    });
}

module.exports = sequelize;
