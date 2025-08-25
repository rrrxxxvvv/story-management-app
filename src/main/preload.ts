import { contextBridge, ipcRenderer } from 'electron';

// 定义API接口
export interface ElectronAPI {
  // 项目管理
  project: {
    create: (projectData: any) => Promise<any>;
    get: (projectId: number) => Promise<any>;
    update: (projectId: number, projectData: any) => Promise<boolean>;
  };
  
  // 实体管理
  entity: {
    create: (entityData: any) => Promise<any>;
    getAll: () => Promise<any[]>;
    update: (entityId: number, entityData: any) => Promise<boolean>;
    delete: (entityId: number) => Promise<boolean>;
  };
  
  // 标签管理
  tag: {
    create: (tagData: any) => Promise<any>;
    getAll: () => Promise<any[]>;
    update: (tagId: number, tagData: any) => Promise<boolean>;
    delete: (tagId: number) => Promise<boolean>;
  };
  
  // 事件管理
  event: {
    create: (eventData: any) => Promise<any>;
    getAll: () => Promise<any[]>;
    update: (eventId: number, eventData: any) => Promise<boolean>;
    delete: (eventId: number) => Promise<boolean>;
  };
}

// 暴露API到渲染进程
const electronAPI: ElectronAPI = {
  project: {
    create: (projectData) => ipcRenderer.invoke('project:create', projectData),
    get: (projectId) => ipcRenderer.invoke('project:get', projectId),
    update: (projectId, projectData) => ipcRenderer.invoke('project:update', projectId, projectData),
  },
  
  entity: {
    create: (entityData) => ipcRenderer.invoke('entity:create', entityData),
    getAll: () => ipcRenderer.invoke('entity:getAll'),
    update: (entityId, entityData) => ipcRenderer.invoke('entity:update', entityId, entityData),
    delete: (entityId) => ipcRenderer.invoke('entity:delete', entityId),
  },
  
  tag: {
    create: (tagData) => ipcRenderer.invoke('tag:create', tagData),
    getAll: () => ipcRenderer.invoke('tag:getAll'),
    update: (tagId, tagData) => ipcRenderer.invoke('tag:update', tagId, tagData),
    delete: (tagId) => ipcRenderer.invoke('tag:delete', tagId),
  },
  
  event: {
    create: (eventData) => ipcRenderer.invoke('event:create', eventData),
    getAll: () => ipcRenderer.invoke('event:getAll'),
    update: (eventId, eventData) => ipcRenderer.invoke('event:update', eventId, eventData),
    delete: (eventId) => ipcRenderer.invoke('event:delete', eventId),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

