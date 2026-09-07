const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TelegramChannel = sequelize.define('TelegramChannel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  channel_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  channel_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channel_username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  added_by: {
    type: DataTypes.UUID,
    allowNull: true, // Admin who added it
  },
  messages_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  jobs_created: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'telegram_channels',
  timestamps: true,
});

module.exports = TelegramChannel;
