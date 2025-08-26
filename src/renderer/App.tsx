import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { NavigationItem, Project } from './types';
import './styles/global.css'; // Ensure global.css is imported for theme variables

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavigationItem>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    return savedProjectId ? parseInt(savedProjectId, 10) : null;
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    document.body.className = ''; // Clear existing classes
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('currentProjectId', currentProjectId.toString());
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const allProjects = await window.electronAPI.project.getAll();
      setProjects(allProjects);
      
      // 如果没有当前项目ID，设置为第一个项目
      if (!currentProjectId && allProjects.length > 0) {
        setCurrentProjectId(allProjects[0].id!);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const switchProject = (projectId: number) => {
    setCurrentProjectId(projectId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        theme={theme}
        toggleTheme={toggleTheme}
        projects={projects}
        currentProjectId={currentProjectId}
        onProjectSwitch={switchProject}
        onProjectsUpdate={loadProjects}
      />
      <MainContent 
        currentView={currentView} 
        currentProjectId={currentProjectId}
      />
    </div>
  );
};

export default App;

