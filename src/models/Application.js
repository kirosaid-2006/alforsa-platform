const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('submitted', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'),
    defaultValue: 'submitted',
    allowNull: false,
  },
  status_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reminder_sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reminder_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  next_reminder_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'applications',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['job_id', 'user_id']
    }
  ]
});

module.exports = Application;
