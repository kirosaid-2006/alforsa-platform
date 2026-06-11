const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Governorate = sequelize.define('Governorate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false, // Arabic name
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: true, // English name
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'governorates',
  timestamps: false,
});

module.exports = Governorate;
