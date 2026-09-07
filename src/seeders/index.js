const { sequelize } = require('../models');
const seedRoles = require('./roles');
const seedPermissions = require('./permissions');
const seedGovernorates = require('./governorates');
const seedCategories = require('./categories');
const seedSettings = require('./settings');

async function runSeeders(exitAfter = false) {
  try {
    console.log('🌱 Starting seeders...');
    await seedRoles();
    await seedPermissions();
    await seedGovernorates();
    await seedCategories();
    await seedSettings();
    console.log('✨ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
  } finally {
    if (exitAfter) {
      process.exit(0);
    }
  }
}

// Run directly if called via `node src/seeders/index.js`
if (require.main === module) {
  (async () => {
    try {
      console.log('🔄 Connecting to database and syncing...');
      await sequelize.sync({ force: false });
      await runSeeders(true);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

module.exports = runSeeders;
