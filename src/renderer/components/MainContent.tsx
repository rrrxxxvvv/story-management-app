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
}

const MainContent: React.FC<MainContentProps> = ({ currentView }) => {
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'project-settings':
        return <ProjectSettings />;
      case 'entities':
        return <EntityManagement />;
      case 'story-arcs':
        return <StoryArcs />;
      case 'timeline':
        return <Timeline />;
      case 'tags':
        return <TagManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="main-content">
      {renderView()}
    </div>
  );
};

export default MainContent;

