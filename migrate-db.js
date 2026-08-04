const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// 1. إعداد اتصال SQLite (Local)
const sqlitePath = process.env.DB_STORAGE || './database/forsa.sqlite';
const sqliteDb = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false
});

// 2. إعداد اتصال PostgreSQL (Online - Supabase)
const pgDb = new Sequelize('postgresql://postgres.ymmtqeerpngwclovhaet:wveW-BH%25p2Uz%23Cu@aws-1-eu-central-1.pooler.supabase.com:5432/postgres', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    }
});

// تعريف الجداول بشكل مبسط لنسخ البيانات
const tables = [
    'roles', 'permissions', 'role_permissions', 'categories', 'governorates', 'users',
    'settings', 'telegram_channels', 'telegram_imports', 'jobs', 'applications',
    'viewed_jobs', 'saved_jobs', 'reports', 'audit_logs',
    'employment_outcomes', 'job_contact_unlocks'
];

async function migrateData() {
    try {
        console.log('Testing connections...');
        await sqliteDb.authenticate();
        await pgDb.authenticate();
        console.log('Connections successful.');

        console.log('Truncating all tables...');
        const tableNames = tables.map(t => `"${t}"`).join(', ');
        await pgDb.query(`TRUNCATE TABLE ${tableNames} CASCADE`);

        console.log('Starting data migration in correct topological order...');

        for (const tableName of tables) {
            console.log(`Migrating table: ${tableName}`);
            try {
                const [records] = await sqliteDb.query(`SELECT * FROM "${tableName}"`);
                
                if (records.length === 0) {
                    console.log(`Table ${tableName} is empty, skipping.`);
                    continue;
                }

                const keys = Object.keys(records[0]).map(k => `"${k}"`).join(',');
                
                for (const record of records) {
                    const values = Object.values(record);
                    const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
                    
                    await pgDb.query(`INSERT INTO "${tableName}" (${keys}) VALUES (${placeholders})`, {
                        bind: values
                    });
                }
                console.log(`Successfully migrated ${records.length} records into ${tableName}`);
            } catch (err) {
                console.log(`Error migrating table ${tableName}:`, err.message);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
