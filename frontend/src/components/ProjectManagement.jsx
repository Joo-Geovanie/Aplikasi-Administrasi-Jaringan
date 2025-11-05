// src/components/ProjectManagement.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, GitBranch, AlertCircle, CheckCircle, Clock, Pause, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    member_id: '',
    status: 'pending',
    priority: 'medium',
    start_date: '',
    end_date: '',
    progress: 0,
    technologies: '',
    github_repo: ''
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const [projectsRes, membersRes] = await Promise.all([
        fetch(`${API_URL}/projects${params}`),
        fetch(`${API_URL}/members`)
      ]);
      const projectsData = await projectsRes.json();
      const membersData = await membersRes.json();
      setProjects(projectsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
        progress: parseInt(formData.progress),
        member_id: parseInt(formData.member_id)
      };

      const url = editingProject 
        ? `${API_URL}/projects/${editingProject.id}`
        : `${API_URL}/projects`;
      
      const response = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) throw new Error('Failed to save project');
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      member_id: project.member_id,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      progress: project.progress,
      technologies: project.technologies?.join(', ') || '',
      github_repo: project.github_repo || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      member_id: '',
      status: 'pending',
      priority: 'medium',
      start_date: '',
      end_date: '',
      progress: 0,
      technologies: '',
      github_repo: ''
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'on-hold': return <Pause className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
      {/* Header */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Project Management</h1>
              <p className="text-purple-300 text-sm mt-1">Manage team projects and assignments</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'in-progress', 'completed', 'on-hold'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-purple-700 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 transition-all"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <span className={`${getPriorityColor(project.priority)} w-2 h-2 rounded-full`}></span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={project.member_avatar || `https://ui-avatars.com/api/?name=${project.member_name}`}
                    alt={project.member_name}
                    className="w-10 h-10 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <p className="text-white font-medium text-sm">{project.member_name}</p>
                    <p className="text-gray-400 text-xs">Assigned Developer</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies?.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-700 text-purple-300 text-xs px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies?.length > 3 && (
                      <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {(project.start_date || project.end_date) && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {project.start_date && new Date(project.start_date).toLocaleDateString()}
                      {project.start_date && project.end_date && ' - '}
                      {project.end_date && new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {project.github_repo && (
                  <a
                    href={project.github_repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <GitBranch className="w-3 h-3" />
                    View Repository
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No projects found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-purple-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To *</label>
                  <select
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Member</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Technologies (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, PostgreSQL"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Repository</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.github_repo}
                  onChange={(e) => setFormData({ ...formData, github_repo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.member_id}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingProject ? 'Update' : 'Create'} Project
                </button>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;