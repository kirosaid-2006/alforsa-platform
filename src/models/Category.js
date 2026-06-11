const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false, // Arabic name
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  icon: {
    type: DataTypes.STRING(20),
    allowNull: true, // Emoji icon for the category
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true, // bg color class or hex (e.g., bg-blue-100 text-blue-800)
  },
  jobs_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;
