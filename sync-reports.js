const { sequelize } = require('./src/models');
async function sync() {
    await sequelize.query(`CREATE TABLE IF NOT EXISTS reports (
        id CHAR(36) PRIMARY KEY, 
        user_id CHAR(36) NOT NULL, 
        job_id CHAR(36) NOT NULL, 
        reason TEXT NOT NULL, 
        status VARCHAR(255) DEFAULT 'pending', 
        admin_notes TEXT, 
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL
    )`);
    console.log('Created reports table');
}
sync().catch(console.error);
