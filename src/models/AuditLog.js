const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false, // e.g. job_approved, user_banned, role_updated
  },
  entity_type: {
    type: DataTypes.STRING(100),
    allowNull: false, // e.g. Job, User, Role
  },
  entity_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false, // Only need createdAt
});

module.exports = AuditLog;
