const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true, // e.g. super_admin, admin, moderator, employer, user
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_system: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // System roles cannot be deleted
  }
}, {
  tableName: 'roles',
  timestamps: true,
});

module.exports = Role;
