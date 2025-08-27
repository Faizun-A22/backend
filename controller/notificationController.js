const db = require('../db/db');

const notificationController = {
    getAllNotifications: (req, res) => {
    console.log('Fetching all notifications'); // Debug log
    const query = 'SELECT * FROM notifications ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        console.log('Fetched notifications:', results); 
        
        // Format the data for frontend
        const formattedResults = results.map(notification => ({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            type: notification.type,
            target: notification.target_audience,
            status: notification.is_active ? 'Active' : 'Inactive',
            created_at: new Date(notification.created_at).toLocaleString()
        }));
        
        console.log('Formatted results:', formattedResults); // Debug log
        res.json(formattedResults);
    });
},

    getNotificationById: (req, res) => {
        const { id } = req.params;
        const query = 'SELECT * FROM notifications WHERE id = ?';
        
        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error fetching notification:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            
            res.json(results[0]);
        });
    },

    createNotification: (req, res) => {
        const { title, content, type, target_audience, is_active } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const query = 'INSERT INTO notifications (title, content, type, target_audience, is_active) VALUES (?, ?, ?, ?, ?)';
        const values = [
            title,
            content,
            type || 'info',
            target_audience || 'all',
            is_active !== undefined ? is_active : 1
        ];
        
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error creating notification:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            res.status(201).json({ 
                message: 'Notification created successfully',
                id: result.insertId
            });
        });
    },

    updateNotification: (req, res) => {
        const { id } = req.params;
        const { title, content, type, target_audience, is_active } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const query = 'UPDATE notifications SET title = ?, content = ?, type = ?, target_audience = ?, is_active = ? WHERE id = ?';
        const values = [
            title,
            content,
            type || 'info',
            target_audience || 'all',
            is_active !== undefined ? is_active : 1,
            id
        ];
        
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating notification:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            
            res.json({ message: 'Notification updated successfully' });
        });
    },

    deleteNotification: (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM notifications WHERE id = ?';
        
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error deleting notification:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            
            res.json({ message: 'Notification deleted successfully' });
        });
    },

    toggleNotificationStatus: (req, res) => {
        const { id } = req.params;
        const query = 'UPDATE notifications SET is_active = NOT is_active WHERE id = ?';
        
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error toggling notification status:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            
            res.json({ message: 'Notification status toggled successfully' });
        });
    }
};

module.exports = notificationController;