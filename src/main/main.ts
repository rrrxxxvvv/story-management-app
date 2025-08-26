import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { DatabaseManager } from './database';

class StoryManagementApp {
  private mainWindow: BrowserWindow | null = null;
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIpcHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }
  }

  private setupIpcHandlers(): void {
    // 项目管理
    ipcMain.handle('project:create', async (_, projectData) => {
      return this.dbManager.createProject(projectData);
    });

    ipcMain.handle('project:getAll', async () => {
      return this.dbManager.getAllProjects();
    });

    ipcMain.handle('project:get', async (_, projectId) => {
      return this.dbManager.getProject(projectId);
    });

    ipcMain.handle('project:update', async (_, projectId, projectData) => {
      return this.dbManager.updateProject(projectId, projectData);
    });

    ipcMain.handle('project:delete', async (_, projectId) => {
      return this.dbManager.deleteProject(projectId);
    });

    // 实体管理
    ipcMain.handle('entity:create', async (_, entityData) => {
      return this.dbManager.createEntity(entityData);
    });

    ipcMain.handle('entity:getAll', async (_, projectId) => {
      return this.dbManager.getAllEntities(projectId);
    });

    ipcMain.handle('entity:update', async (_, entityId, entityData) => {
      return this.dbManager.updateEntity(entityId, entityData);
    });

    ipcMain.handle('entity:delete', async (_, entityId) => {
      return this.dbManager.deleteEntity(entityId);
    });

    // 标签管理
    ipcMain.handle('tag:create', async (_, tagData) => {
      return this.dbManager.createTag(tagData);
    });

    ipcMain.handle('tag:getAll', async (_, projectId) => {
      return this.dbManager.getAllTags(projectId);
    });

    ipcMain.handle('tag:update', async (_, tagId, tagData) => {
      return this.dbManager.updateTag(tagId, tagData);
    });

    ipcMain.handle('tag:delete', async (_, tagId) => {
      return this.dbManager.deleteTag(tagId);
    });

    // 事件管理
    ipcMain.handle('event:create', async (_, eventData) => {
      return this.dbManager.createEvent(eventData);
    });

    ipcMain.handle('event:getAll', async (_, projectId) => {
      return this.dbManager.getAllEvents(projectId);
    });

    ipcMain.handle('event:update', async (_, eventId, eventData) => {
      return this.dbManager.updateEvent(eventId, eventData);
    });

    ipcMain.handle('event:delete', async (_, eventId) => {
      return this.dbManager.deleteEvent(eventId);
    });
  }
}

new StoryManagementApp();

