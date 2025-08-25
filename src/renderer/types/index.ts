export interface Project {
  id?: number;
  name: string;
  description?: string;
  worldSetting?: string;
  protagonistInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Entity {
  id?: number;
  name: string;
  type: 'character' | 'item' | 'faction';
  description?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id?: number;
  name: string;
  color: string;
  category: string;
  description?: string;
  createdAt?: string;
}

export interface Event {
  id?: number;
  name: string;
  description?: string;
  worldTime?: string;
  chapterNumber?: number;
  relatedEntities?: number[];
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export type NavigationItem = 
  | 'dashboard'
  | 'project-settings'
  | 'entities'
  | 'story-arcs'
  | 'timeline'
  | 'tags';

export interface NavigationState {
  currentView: NavigationItem;
  setCurrentView: (view: NavigationItem) => void;
}

