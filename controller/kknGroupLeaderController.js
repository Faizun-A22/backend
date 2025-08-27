const db = require('../db/db');

// Get all group leaders with optional filtering
exports.getAllGroupLeaders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, nim, village_name, status, created_at, updated_at 
      FROM kkn_group_leaders 
    `;
    let countQuery = `SELECT COUNT(*) as total FROM kkn_group_leaders`;
    let queryParams = [];
    let countParams = [];
    
    if (status && status !== 'all') {
      query += ` WHERE status = ?`;
      countQuery += ` WHERE status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    console.log('SQL Query:', query);
    console.log('Query Params:', queryParams);
    
    // PERBAIKI BAGIAN INI - gunakan promise() untuk mysql2
    const [leaders] = await db.promise().execute(query, queryParams);
    const [countResult] = await db.promise().execute(countQuery, countParams);
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    console.log('Leaders found:', leaders.length);
    console.log('Total count:', total);
    
    res.json({
      leaders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching group leaders:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single group leader by ID
exports.getGroupLeaderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [leader] = await db.promise().execute(
      'SELECT * FROM kkn_group_leaders WHERE id = ?',
      [id]
    );
    
    if (leader.length === 0) {
      return res.status(404).json({ message: 'Group leader not found' });
    }
    
    res.json(leader[0]);
  } catch (error) {
    console.error('Error fetching group leader:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update group leader status
exports.updateGroupLeaderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const [result] = await db.promise().execute(
      'UPDATE kkn_group_leaders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Group leader not found' });
    }
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating group leader status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete group leader
exports.deleteGroupLeader = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.promise().execute(
      'DELETE FROM kkn_group_leaders WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Group leader not found' });
    }
    
    res.json({ message: 'Group leader deleted successfully' });
  } catch (error) {
    console.error('Error deleting group leader:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};