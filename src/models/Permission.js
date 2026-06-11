const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true, // e.g. jobs.view, jobs.create, users.manage
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: false, // e.g. jobs, users, applications
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'permissions',
  timestamps: true,
});

module.exports = Permission;
