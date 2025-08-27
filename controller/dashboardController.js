const db = require('../db/db');

exports.getDashboardSummary = (req, res) => {
    const queries = {
        kknStats: `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                   FROM kkn_registrations`,
                   
        magangStats: `SELECT 
                      COUNT(*) as total,
                      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                      SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
                      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                     FROM magang_registrations`,
                     
        villageStats: `SELECT 
                       COUNT(*) as total_villages,
                       SUM(max_quota) as total_quota,
                       SUM(current_quota) as used_quota
                      FROM kkn_village_quota`,
                      
        userStats: `SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
                    SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users
                   FROM users`,
                   
        recentKkn: `SELECT nim, full_name, status 
                   FROM kkn_registrations 
                   ORDER BY created_at DESC 
                   LIMIT 5`,
                   
        recentMagang: `SELECT nim, full_name, status 
                      FROM magang_registrations 
                      ORDER BY created_at DESC 
                      LIMIT 5`
    };

    db.query(queries.kknStats, (err, kknStats) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query(queries.magangStats, (err, magangStats) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.query(queries.villageStats, (err, villageStats) => {
                if (err) return res.status(500).json({ error: err.message });
                
                db.query(queries.userStats, (err, userStats) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    db.query(queries.recentKkn, (err, recentKkn) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        db.query(queries.recentMagang, (err, recentMagang) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            const response = {
                                kkn: {
                                    total: kknStats[0].total,
                                    approved: kknStats[0].approved,
                                    pending: kknStats[0].pending,
                                    verified: kknStats[0].verified,
                                    rejected: kknStats[0].rejected
                                },
                                magang: {
                                    total: magangStats[0].total,
                                    approved: magangStats[0].approved,
                                    pending: magangStats[0].pending,
                                    verified: magangStats[0].verified,
                                    rejected: magangStats[0].rejected
                                },
                                villages: {
                                    total: villageStats[0].total_villages,
                                    total_quota: villageStats[0].total_quota,
                                    used_quota: villageStats[0].used_quota
                                },
                                users: {
                                    total: userStats[0].total_users,
                                    admin: userStats[0].admin_users,
                                    regular: userStats[0].regular_users
                                },
                                recentKkn: recentKkn,
                                recentMagang: recentMagang
                            };
                            
                            res.json(response);
                        });
                    });
                });
            });
        });
    });
};