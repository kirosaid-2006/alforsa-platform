const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobContactUnlock = sequelize.define('JobContactUnlock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  application_id: {
    type: DataTypes.UUID,
    allowNull: true, // Because some views might just be contact reveal
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  unlocked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  }
}, {
  tableName: 'job_contact_unlocks',
  timestamps: false, // only need unlocked_at
  indexes: [
    {
      unique: true,
      fields: ['job_id', 'user_id']
    }
  ]
});

module.exports = JobContactUnlock;
