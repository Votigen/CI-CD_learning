// controllers/contactsController.js
const { pool } = require('../config/database');

//获取我的联系人列表
const getContacts = async (req, res) => {
    try {
        const userId = req.user.userId; // 从 JWT payload 中获取

        const query = `
      SELECT 
        u.uid,
        u.username,
        u.avatar_url,
        u.company,
        u.bio,
        c.created_at
      FROM contacts c
      JOIN users u ON c.contact_id = u.uid
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;

        const [rows] = await pool.execute(query, [userId]);

        return res.status(200).json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('获取联系人失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 添加联系人
const createContact = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const userId = req.user.userId;
        const { contact_id } = req.body;

        // 验证必要参数
        if (!contact_id) {
            return res.status(400).json({
                success: false,
                message: '联系人ID不能为空'
            });
        }

        if (userId === contact_id) {
            return res.status(400).json({
                success: false,
                message: '不能添加自己为联系人'
            });
        }

        // 检查联系人是否存在
        const checkUserQuery = 'SELECT uid FROM users WHERE uid = ?';
        const [userRows] = await connection.execute(checkUserQuery, [contact_id]);

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: '指定的联系人不存在'
            });
        }

        // 检查是否已经是联系人（单向检查）
        const checkContactQuery = `
            SELECT id FROM contacts 
            WHERE user_id = ? AND contact_id = ?
        `;
        const [existingRows] = await connection.execute(checkContactQuery, [userId, contact_id]);

        if (existingRows.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: '该用户已经是您的联系人'
            });
        }

        // 插入新联系人（单向）
        const insertQuery = `
            INSERT INTO contacts (user_id, contact_id) 
            VALUES (?, ?)
        `;

        await connection.execute(insertQuery, [userId, contact_id]);


        const [reverseRows] = await connection.execute(checkContactQuery, [contact_id, userId]);
        if (reverseRows.length === 0) {
            await connection.execute(insertQuery, [contact_id, userId]);
        }


        await connection.commit();

        // 获取刚创建的联系人详细信息
        const getContactQuery = `
            SELECT 
                u.uid,
                u.username,
                u.avatar_url,
                u.company,
                u.bio,
                c.created_at
            FROM contacts c
            JOIN users u ON c.contact_id = u.uid
            WHERE c.user_id = ? AND c.contact_id = ?
        `;

        const [contactRows] = await connection.execute(getContactQuery, [userId, contact_id]);

        return res.status(201).json({
            success: true,
            message: '联系人添加成功',
            data: contactRows[0]
        });

    } catch (error) {
        await connection.rollback();
        console.error('创建联系人失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    } finally {
        connection.release();
    }
};


module.exports = { getContacts, createContact };