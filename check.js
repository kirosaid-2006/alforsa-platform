const { sequelize } = require('./src/models');
sequelize.query("SELECT COUNT(*) as count FROM users").then(res => {
    console.log("USERS COUNT:", res[0][0].count);
}).catch(console.error);
