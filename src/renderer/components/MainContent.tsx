import React from 'react';
import { NavigationItem } from '../types';
import Dashboard from './views/Dashboard';
import ProjectSettings from './views/ProjectSettings';
import EntityManagement from './views/EntityManagement';
import StoryArcs from './views/StoryArcs';
import Timeline from './views/Timeline';
import TagManagement from './views/TagManagement';
import './MainContent.css';

interface MainContentProps {
  currentView: NavigationItem;
  currentProjectId: number | null;
}

const MainContent: React.FC<MainContentProps> = ({ currentView, currentProjectId }) => {
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentProjectId={currentProjectId} />;
      case 'project-settings':
        return <ProjectSettings currentProjectId={currentProjectId} />;
      case 'entities':
        return <EntityManagement currentProjectId={currentProjectId} />;
      case 'story-arcs':
        return <StoryArcs currentProjectId={currentProjectId} />;
      case 'timeline':
        return <Timeline currentProjectId={currentProjectId} />;
      case 'tags':
        return <TagManagement currentProjectId={currentProjectId} />;
      default:
        return <Dashboard currentProjectId={currentProjectId} />;
    }
  };

  return (
    <div className="main-content">
      {renderView()}
    </div>
  );
};

export default MainContent;

