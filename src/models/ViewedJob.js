const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ViewedJob = sequelize.define('ViewedJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true, // Allow guest views tracking by IP if needed, or null if logged out
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  viewed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'viewed_jobs',
  timestamps: false,
});

module.exports = ViewedJob;
