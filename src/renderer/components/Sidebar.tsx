import React, { useState } from 'react';
import { NavigationItem, Project } from '../types';
import './Sidebar.css';

interface SidebarProps {
  currentView: NavigationItem;
  onNavigate: (view: NavigationItem) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  projects: Project[];
  currentProjectId: number | null;
  onProjectSwitch: (projectId: number) => void;
  onProjectsUpdate: () => void;
}

interface NavItem {
  id: NavigationItem;
  label: string;
  icon: string;
}

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: '项目概览', icon: '📊' },
  { id: 'project-settings', label: '项目设置', icon: '⚙️' },
  { id: 'entities', label: '实体管理', icon: '👥' },
  { id: 'story-arcs', label: '故事弧', icon: '📖' },
  { id: 'timeline', label: '时间线', icon: '⏰' },
  { id: 'tags', label: '标签管理', icon: '🏷️' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  theme, 
  toggleTheme,
  projects,
  currentProjectId,
  onProjectSwitch,
  onProjectsUpdate
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const newProject = await window.electronAPI.project.create({
        name: newProjectName.trim(),
        description: ''
      });
      
      setNewProjectName('');
      setShowNewProjectForm(false);
      onProjectsUpdate();
      onProjectSwitch(newProject.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Story Management</span>
        </div>
        
        {/* 项目选择器 */}
        <div className="project-selector">
          <button 
            className="project-selector-btn"
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          >
            <span className="project-name">
              {currentProject?.name || '选择项目'}
            </span>
            <span className="dropdown-arrow">
              {showProjectDropdown ? '▲' : '▼'}
            </span>
          </button>
          
          {showProjectDropdown && (
            <div className="project-dropdown">
              <div className="project-list">
                {projects.map(project => (
                  <button
                    key={project.id}
                    className={`project-item ${project.id === currentProjectId ? 'active' : ''}`}
                    onClick={() => {
                      onProjectSwitch(project.id!);
                      setShowProjectDropdown(false);
                    }}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
              <div className="project-actions">
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => {
                    setShowNewProjectForm(true);
                    setShowProjectDropdown(false);
                  }}
                >
                  + 新建项目
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 深色模式' : '☀️ 浅色模式'}
        </button>
        <div className="version-info">v1.0.1</div>
      </div>

      {/* 新建项目弹窗 */}
      {showNewProjectForm && (
        <div className="modal-overlay" onClick={() => setShowNewProjectForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新建项目</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNewProjectForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>项目名称</label>
                <input
                  type="text"
                  className="input"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="输入项目名称"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewProjectForm(false)}
              >
                取消
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

