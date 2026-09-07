const sequelize = require('../config/database');

// Import all models
const Role = require('./Role');
const Permission = require('./Permission');
const User = require('./User');
const Category = require('./Category');
const Governorate = require('./Governorate');
const Job = require('./Job');
const Application = require('./Application');
const JobContactUnlock = require('./JobContactUnlock');
const EmploymentOutcome = require('./EmploymentOutcome');
const TelegramChannel = require('./TelegramChannel');
const TelegramImport = require('./TelegramImport');
const Notification = require('./Notification');
const Setting = require('./Setting');
const AuditLog = require('./AuditLog');
const SavedJob = require('./SavedJob');
const ViewedJob = require('./ViewedJob');
const Report = require('./Report');

// ----------------------------------------
// Associations Setup
// ----------------------------------------

// Role & Permission (Many-to-Many)
Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', otherKey: 'role_id' });

// User & Role (One-to-Many)
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// User & Governorate (One-to-Many)
Governorate.hasMany(User, { foreignKey: 'governorate_id' });
User.belongsTo(Governorate, { foreignKey: 'governorate_id' });

// Job & Category (One-to-Many)
Category.hasMany(Job, { foreignKey: 'category_id' });
Job.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Job & Governorate (One-to-Many)
Governorate.hasMany(Job, { foreignKey: 'governorate_id' });
Job.belongsTo(Governorate, { foreignKey: 'governorate_id', as: 'governorate' });

// Job & User (Employer who posted it)
User.hasMany(Job, { foreignKey: 'posted_by', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'posted_by', as: 'employer' });

// Job & User (Admin who approved it)
User.hasMany(Job, { foreignKey: 'approved_by', as: 'approvedJobs' });
Job.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Application (User & Job Many-to-Many via Application model)
User.hasMany(Application, { foreignKey: 'user_id' });
Application.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(Application, { foreignKey: 'job_id' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// Application Reviewer
User.hasMany(Application, { foreignKey: 'reviewed_by', as: 'reviewedApplications' });
Application.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// JobContactUnlock
User.hasMany(JobContactUnlock, { foreignKey: 'user_id' });
JobContactUnlock.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(JobContactUnlock, { foreignKey: 'job_id' });
JobContactUnlock.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

Application.hasOne(JobContactUnlock, { foreignKey: 'application_id' });
JobContactUnlock.belongsTo(Application, { foreignKey: 'application_id' });

// EmploymentOutcome
Application.hasOne(EmploymentOutcome, { foreignKey: 'application_id' });
EmploymentOutcome.belongsTo(Application, { foreignKey: 'application_id' });

User.hasMany(EmploymentOutcome, { foreignKey: 'user_id' });
EmploymentOutcome.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(EmploymentOutcome, { foreignKey: 'job_id' });
EmploymentOutcome.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// TelegramChannel & TelegramImport
TelegramChannel.hasMany(TelegramImport, { foreignKey: 'channel_id' });
TelegramImport.belongsTo(TelegramChannel, { foreignKey: 'channel_id' });

User.hasMany(TelegramChannel, { foreignKey: 'added_by', as: 'addedChannels' });
TelegramChannel.belongsTo(User, { foreignKey: 'added_by', as: 'adder' });

TelegramImport.belongsTo(Job, { foreignKey: 'job_id' });
Job.hasOne(TelegramImport, { foreignKey: 'job_id' });

// Notification
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Settings
User.hasMany(Setting, { foreignKey: 'user_id' });
Setting.belongsTo(User, { foreignKey: 'user_id' });

// Reports
User.hasMany(Report, { foreignKey: 'user_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Job.hasMany(Report, { foreignKey: 'job_id', as: 'reports' });
Report.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// AuditLog
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// SavedJob (Many-to-Many custom)
User.belongsToMany(Job, { through: SavedJob, foreignKey: 'user_id', as: 'savedJobs' });
Job.belongsToMany(User, { through: SavedJob, foreignKey: 'job_id', as: 'savedByUsers' });

// ViewedJob
User.hasMany(ViewedJob, { foreignKey: 'user_id' });
ViewedJob.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(ViewedJob, { foreignKey: 'job_id' });
ViewedJob.belongsTo(Job, { foreignKey: 'job_id' });

module.exports = {
  sequelize,
  Role,
  Permission,
  User,
  Category,
  Governorate,
  Job,
  Application,
  JobContactUnlock,
  EmploymentOutcome,
  TelegramChannel,
  TelegramImport,
  Notification,
  Setting,
  Report,
  AuditLog,
  SavedJob,
  ViewedJob,
};
