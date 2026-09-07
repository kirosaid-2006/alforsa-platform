const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TelegramImport = sequelize.define('TelegramImport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  channel_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  message_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  extracted_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  confidence_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'failed', 'duplicate'),
    defaultValue: 'pending',
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: true, // Populated if a job was successfully created
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'telegram_imports',
  timestamps: true,
});

module.exports = TelegramImport;
