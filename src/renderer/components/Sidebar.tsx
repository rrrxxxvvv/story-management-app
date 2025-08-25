import React from 'react';
import { NavigationItem } from '../types';
import './Sidebar.css';

interface SidebarProps {
  currentView: NavigationItem;
  onNavigate: (view: NavigationItem) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Story Management</span>
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
        <div className="version-info">v1.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;

