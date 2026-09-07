const { Notification } = require('../models');

class NotificationService {
    
    async createNotification(userId, type, title, message, link = null, data = null) {
        try {
            return await Notification.create({
                user_id: userId,
                type,
                title,
                message,
                link,
                data
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    async getUnreadCount(userId) {
        try {
            return await Notification.count({
                where: {
                    user_id: userId,
                    is_read: false
                }
            });
        } catch (error) {
            console.error('Error getting unread notification count:', error);
            return 0;
        }
    }

    async getUserNotifications(userId, limit = 20, offset = 0) {
        try {
            return await Notification.findAndCountAll({
                where: { user_id: userId },
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return { count: 0, rows: [] };
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            return await Notification.update(
                { is_read: true, read_at: new Date() },
                { where: { id: notificationId, user_id: userId } }
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    async markAllAsRead(userId) {
        try {
            return await Notification.update(
                { is_read: true, read_at: new Date() },
                { where: { user_id: userId, is_read: false } }
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
}

module.exports = new NotificationService();
