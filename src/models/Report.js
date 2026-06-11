const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
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
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved'),
        defaultValue: 'pending',
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'reports',
    timestamps: true,
});

module.exports = Report;
