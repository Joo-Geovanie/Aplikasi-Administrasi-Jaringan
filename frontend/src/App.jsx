// src/App.jsx
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import TeamDashboard from './components/TeamDashboard';
import ProjectManagement from './components/ProjectManagement';
import { FolderKanban, Users, Home } from 'lucide-react';

function App() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
      {/* Navigation Bar */}
      <nav className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-purple-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Admin Jaringan</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Team</span>
              </Link>
              
              <Link
                to="/projects"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/projects')
                    ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <FolderKanban className="w-5 h-5" />
                <span className="font-medium">Projects</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<TeamDashboard />} />
        <Route path="/projects" element={<ProjectManagement />} />
      </Routes>
    </div>
  );
}

export default App;