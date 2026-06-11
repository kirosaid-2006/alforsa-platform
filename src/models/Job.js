const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  company_logo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  governorate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  qualification: {
    type: DataTypes.ENUM('none', 'diploma', 'institute', 'bachelors', 'masters', 'phd'),
    allowNull: true, // Some jobs don't specify
  },
  min_experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  working_hours: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  salary_min: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  salary_max: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  salary_currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'EGP',
  },
  show_salary: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  skills_required: {
    type: DataTypes.JSON, // Array of required skill strings
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'pending_review', 'published', 'closed', 'rejected', 'expired', 'archived'),
    defaultValue: 'pending',
    allowNull: false,
  },
  rejection_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  posted_by: {
    type: DataTypes.UUID, // User who posted it (null for automated telegram imports until claimed)
    allowNull: true,
  },
  approved_by: {
    type: DataTypes.UUID, // Admin who approved it
    allowNull: true,
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  applications_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hired_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Contact info (hidden by default)
  contact_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  contact_whatsapp: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  contact_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  contact_info: {
    type: DataTypes.TEXT, // Catch-all for address or other methods
    allowNull: true,
  },
  // Telegram integration fields
  telegram_message_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telegram_message_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telegram_raw_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM('web', 'telegram', 'api', 'import'),
    defaultValue: 'web',
    allowNull: false,
  },
  external_id: {
    type: DataTypes.STRING,
    allowNull: true, // useful for deduplication
    unique: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'jobs',
  timestamps: true,
});

module.exports = Job;
