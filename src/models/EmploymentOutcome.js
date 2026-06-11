const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmploymentOutcome = sequelize.define('EmploymentOutcome', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  application_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  outcome: {
    type: DataTypes.ENUM('hired', 'rejected', 'waiting', 'no_contact'),
    allowNull: false,
  },
  via_platform: {
    type: DataTypes.BOOLEAN,
    allowNull: true, // Only applicable if hired
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reminder_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  next_reminder_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  responded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'employment_outcomes',
  timestamps: true,
});

module.exports = EmploymentOutcome;
