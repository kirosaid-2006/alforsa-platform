const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedJob = sequelize.define('SavedJob', {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  job_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  saved_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'saved_jobs',
  timestamps: false,
});

module.exports = SavedJob;
