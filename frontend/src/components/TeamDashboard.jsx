import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Github, Linkedin, Award } from 'lucide-react';

const TeamDashboard = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil data dari backend
  useEffect(() => {
    fetch("http://localhost:5000/api/members")
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Gagal ambil data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
        Loading data dari server...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
      {/* Header */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-10 h-10 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Team Dashboard</h1>
                <p className="text-purple-300 text-sm">Aplikasi Administrasi Jaringan</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-red-600 px-4 py-2 rounded-lg">
              <p className="text-white font-semibold">{teamMembers.length} Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-600 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-purple-200 text-sm">Total Projects</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {teamMembers.reduce((acc, member) => acc + (parseInt(member.project_count) || 0), 0)}
                  </p>
                </div>
                <Award className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
          </div>

          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-6 border border-red-600 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Active Members</p>
                <p className="text-4xl font-bold text-white mt-2">{teamMembers.length}</p>
              </div>
              <Users className="w-12 h-12 text-red-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-800 to-purple-900 rounded-xl p-6 border border-pink-600 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm">Tech Stack</p>
                <p className="text-4xl font-bold text-white mt-2">9+</p>
              </div>
              <Award className="w-12 h-12 text-pink-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-purple-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              {/* Card Header with Avatar */}
              <div className="bg-gradient-to-r from-purple-700 to-red-700 p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto relative z-10"
                />
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white text-center mb-1">
                  {member.name}
                </h3>
                <p className="text-purple-300 text-center mb-4 text-sm font-medium">
                  {member.role}
                </p>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Mail className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Phone className="w-4 h-4 mr-2 text-red-400" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-gray-400 text-xs uppercase font-semibold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects Count */}
                <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Projects Completed</span>
                    <span className="text-purple-400 font-bold text-lg">{member.project_count}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-2">
                  <a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://linkedin.com/in/${member.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm border-t border-purple-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            © 2024 Team Dashboard. Built with React & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;