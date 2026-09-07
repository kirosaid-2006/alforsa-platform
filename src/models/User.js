const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  whatsapp_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true, // Not strictly required for basic manual workers
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false,
  },
  governorate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  detailed_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  national_id: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  church_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // البيانات التعليمية
  qualification: {
    type: DataTypes.ENUM('none', 'diploma', 'institute', 'bachelors', 'masters', 'phd'),
    allowNull: false,
  },
  college_institute: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  specialization: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  graduation_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  grade_gpa: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  // الحالة الوظيفية
  employment_status: {
    type: DataTypes.ENUM('seeking', 'employed', 'student'),
    allowNull: false,
  },
  // الخبرة العملية
  last_job_title: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  experience_level: {
    type: DataTypes.ENUM('none', 'less_than_year', '1_3_years', '3_5_years', 'more_than_5'),
    allowNull: false,
  },
  skills: {
    type: DataTypes.JSON, // Array of skill strings
    allowNull: true,
  },
  cv_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // الموافقات
  consent_save_data: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  consent_disclaimer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  consent_notifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // حالة الحساب
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ban_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
