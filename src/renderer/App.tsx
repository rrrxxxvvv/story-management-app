import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { NavigationItem } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavigationItem>('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
      />
      <MainContent currentView={currentView} />
    </div>
  );
};

export default App;

