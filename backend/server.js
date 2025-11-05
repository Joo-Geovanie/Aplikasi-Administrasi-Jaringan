import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; // cukup sekali

dotenv.config(); // load .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// ==================== MEMBERS ROUTES ====================

// GET all members
app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, 
             COUNT(p.id) as project_count,
             json_agg(
               json_build_object(
                 'skill_name', s.skill_name,
                 'proficiency', s.proficiency
               )
             ) FILTER (WHERE s.id IS NOT NULL) as skills
      FROM members m
      LEFT JOIN projects p ON m.id = p.member_id
      LEFT JOIN skills s ON m.id = s.member_id
      GROUP BY m.id
      ORDER BY m.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single member
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT m.*, 
             json_agg(
               json_build_object(
                 'skill_name', s.skill_name,
                 'proficiency', s.proficiency
               )
             ) FILTER (WHERE s.id IS NOT NULL) as skills
      FROM members m
      LEFT JOIN skills s ON m.id = s.member_id
      WHERE m.id = $1
      GROUP BY m.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new member
app.post('/api/members', async (req, res) => {
  try {
    const { name, role, avatar, email, phone, github, linkedin } = req.body;
    const result = await pool.query(
      `INSERT INTO members (name, role, avatar, email, phone, github, linkedin) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, role, avatar, email, phone, github, linkedin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT update member
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, avatar, email, phone, github, linkedin } = req.body;
    const result = await pool.query(
      `UPDATE members 
       SET name = $1, role = $2, avatar = $3, email = $4, phone = $5, 
           github = $6, linkedin = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, role, avatar, email, phone, github, linkedin, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROJECTS ROUTES ====================

// GET all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { status, member_id } = req.query;
    let query = `
      SELECT p.*, m.name as member_name, m.avatar as member_avatar
      FROM projects p
      LEFT JOIN members m ON p.member_id = m.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }
    if (member_id) {
      conditions.push(`p.member_id = $${params.length + 1}`);
      params.push(member_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, m.name as member_name, m.avatar as member_avatar, m.email as member_email
      FROM projects p
      LEFT JOIN members m ON p.member_id = m.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, member_id, status, priority, start_date, end_date, progress, technologies, github_repo } = req.body;
    const result = await pool.query(
      `INSERT INTO projects (title, description, member_id, status, priority, start_date, end_date, progress, technologies, github_repo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, description, member_id, status, priority, start_date, end_date, progress, technologies, github_repo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, member_id, status, priority, start_date, end_date, progress, technologies, github_repo } = req.body;
    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, description = $2, member_id = $3, status = $4, priority = $5,
           start_date = $6, end_date = $7, progress = $8, technologies = $9, 
           github_repo = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, description, member_id, status, priority, start_date, end_date, progress, technologies, github_repo, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DASHBOARD STATS ====================

// GET dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM members) as total_members,
        (SELECT COUNT(*) FROM projects) as total_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'completed') as completed_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'in-progress') as ongoing_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'pending') as pending_projects,
        (SELECT AVG(progress) FROM projects WHERE status != 'completed') as avg_progress
    `);
    
    const projectsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM projects
      GROUP BY status
    `);
    
    const projectsByMember = await pool.query(`
      SELECT m.name, COUNT(p.id) as project_count
      FROM members m
      LEFT JOIN projects p ON m.id = p.member_id
      GROUP BY m.id, m.name
      ORDER BY project_count DESC
    `);

    res.json({
      ...stats.rows[0],
      projectsByStatus: projectsByStatus.rows,
      projectsByMember: projectsByMember.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});