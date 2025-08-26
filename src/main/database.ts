import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

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
  projectId?: number;
  name: string;
  type: 'character' | 'item' | 'faction' | 'event';
  description?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id?: number;
  projectId?: number;
  name: string;
  color: string;
  category: string;
  description?: string;
  createdAt?: string;
}

export interface Event {
  id?: number;
  projectId?: number;
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

export class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'story-management.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // 创建项目表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        world_setting TEXT,
        protagonist_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建实体表 - 添加项目ID和事件类型
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL DEFAULT 1,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('character', 'item', 'faction', 'event')),
        description TEXT,
        tags TEXT, -- JSON array of tag names
        custom_fields TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 创建标签表 - 添加项目ID
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL DEFAULT 1,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        UNIQUE(project_id, name)
      )
    `);

    // 创建事件表 - 添加项目ID
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL DEFAULT 1,
        name TEXT NOT NULL,
        description TEXT,
        world_time TEXT,
        chapter_number INTEGER,
        related_entities TEXT, -- JSON array of entity IDs
        tags TEXT, -- JSON array of tag names
        custom_fields TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_entities_project ON entities(project_id);
      CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
      CREATE INDEX IF NOT EXISTS idx_tags_project ON tags(project_id);
      CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id);
      CREATE INDEX IF NOT EXISTS idx_events_chapter ON events(chapter_number);
      CREATE INDEX IF NOT EXISTS idx_events_world_time ON events(world_time);
    `);

    // 检查是否需要添加project_id列到现有表
    this.migrateExistingData();
  }

  private migrateExistingData(): void {
    try {
      // 检查entities表是否有project_id列
      const entitiesColumns = this.db.pragma('table_info(entities)') as any[];
      const hasProjectIdInEntities = entitiesColumns.some((col: any) => col.name === 'project_id');
      
      if (!hasProjectIdInEntities) {
        this.db.exec('ALTER TABLE entities ADD COLUMN project_id INTEGER NOT NULL DEFAULT 1');
      }

      // 检查tags表是否有project_id列
      const tagsColumns = this.db.pragma('table_info(tags)') as any[];
      const hasProjectIdInTags = tagsColumns.some((col: any) => col.name === 'project_id');
      
      if (!hasProjectIdInTags) {
        this.db.exec('ALTER TABLE tags ADD COLUMN project_id INTEGER NOT NULL DEFAULT 1');
      }

      // 检查events表是否有project_id列
      const eventsColumns = this.db.pragma('table_info(events)') as any[];
      const hasProjectIdInEvents = eventsColumns.some((col: any) => col.name === 'project_id');
      
      if (!hasProjectIdInEvents) {
        this.db.exec('ALTER TABLE events ADD COLUMN project_id INTEGER NOT NULL DEFAULT 1');
      }

      // 确保至少有一个默认项目
      const projectCount = this.db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
      if (projectCount.count === 0) {
        this.createProject({
          name: '默认项目',
          description: '系统自动创建的默认项目'
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  // 项目管理方法
  createProject(project: Project): Project {
    const stmt = this.db.prepare(`
      INSERT INTO projects (name, description, world_setting, protagonist_info)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      project.name,
      project.description || null,
      project.worldSetting || null,
      project.protagonistInfo || null
    );
    return { ...project, id: result.lastInsertRowid as number };
  }

  getAllProjects(): Project[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      worldSetting: row.world_setting,
      protagonistInfo: row.protagonist_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  getProject(id: number): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      worldSetting: row.world_setting,
      protagonistInfo: row.protagonist_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  updateProject(id: number, project: Partial<Project>): boolean {
    const stmt = this.db.prepare(`
      UPDATE projects 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          world_setting = COALESCE(?, world_setting),
          protagonist_info = COALESCE(?, protagonist_info),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(
      project.name || null,
      project.description || null,
      project.worldSetting || null,
      project.protagonistInfo || null,
      id
    );
    return result.changes > 0;
  }

  deleteProject(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 实体管理方法
  createEntity(entity: Entity): Entity {
    const stmt = this.db.prepare(`
      INSERT INTO entities (project_id, name, type, description, tags, custom_fields)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      entity.projectId || 1,
      entity.name,
      entity.type,
      entity.description || null,
      JSON.stringify(entity.tags || []),
      JSON.stringify(entity.customFields || {})
    );
    return { ...entity, id: result.lastInsertRowid as number };
  }

  getAllEntities(projectId?: number): Entity[] {
    const query = projectId 
      ? 'SELECT * FROM entities WHERE project_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM entities ORDER BY created_at DESC';
    const stmt = this.db.prepare(query);
    const rows = projectId ? stmt.all(projectId) as any[] : stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      type: row.type,
      description: row.description,
      tags: JSON.parse(row.tags || '[]'),
      customFields: JSON.parse(row.custom_fields || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  updateEntity(id: number, entity: Partial<Entity>): boolean {
    const stmt = this.db.prepare(`
      UPDATE entities 
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          description = COALESCE(?, description),
          tags = COALESCE(?, tags),
          custom_fields = COALESCE(?, custom_fields),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(
      entity.name || null,
      entity.type || null,
      entity.description || null,
      entity.tags ? JSON.stringify(entity.tags) : null,
      entity.customFields ? JSON.stringify(entity.customFields) : null,
      id
    );
    return result.changes > 0;
  }

  deleteEntity(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM entities WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 标签管理方法
  createTag(tag: Tag): Tag {
    const stmt = this.db.prepare(`
      INSERT INTO tags (project_id, name, color, category, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      tag.projectId || 1,
      tag.name,
      tag.color,
      tag.category,
      tag.description || null
    );
    return { ...tag, id: result.lastInsertRowid as number };
  }

  getAllTags(projectId?: number): Tag[] {
    const query = projectId 
      ? 'SELECT * FROM tags WHERE project_id = ? ORDER BY category, name'
      : 'SELECT * FROM tags ORDER BY category, name';
    const stmt = this.db.prepare(query);
    const rows = projectId ? stmt.all(projectId) as any[] : stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      color: row.color,
      category: row.category,
      description: row.description,
      createdAt: row.created_at,
    }));
  }

  updateTag(id: number, tag: Partial<Tag>): boolean {
    const stmt = this.db.prepare(`
      UPDATE tags 
      SET name = COALESCE(?, name),
          color = COALESCE(?, color),
          category = COALESCE(?, category),
          description = COALESCE(?, description)
      WHERE id = ?
    `);
    const result = stmt.run(
      tag.name || null,
      tag.color || null,
      tag.category || null,
      tag.description || null,
      id
    );
    return result.changes > 0;
  }

  deleteTag(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 事件管理方法
  createEvent(event: Event): Event {
    const stmt = this.db.prepare(`
      INSERT INTO events (project_id, name, description, world_time, chapter_number, related_entities, tags, custom_fields)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      event.projectId || 1,
      event.name,
      event.description || null,
      event.worldTime || null,
      event.chapterNumber || null,
      JSON.stringify(event.relatedEntities || []),
      JSON.stringify(event.tags || []),
      JSON.stringify(event.customFields || {})
    );
    return { ...event, id: result.lastInsertRowid as number };
  }

  getAllEvents(projectId?: number): Event[] {
    const query = projectId 
      ? 'SELECT * FROM events WHERE project_id = ? ORDER BY chapter_number, world_time'
      : 'SELECT * FROM events ORDER BY chapter_number, world_time';
    const stmt = this.db.prepare(query);
    const rows = projectId ? stmt.all(projectId) as any[] : stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      description: row.description,
      worldTime: row.world_time,
      chapterNumber: row.chapter_number,
      relatedEntities: JSON.parse(row.related_entities || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      customFields: JSON.parse(row.custom_fields || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  updateEvent(id: number, event: Partial<Event>): boolean {
    const stmt = this.db.prepare(`
      UPDATE events 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          world_time = COALESCE(?, world_time),
          chapter_number = COALESCE(?, chapter_number),
          related_entities = COALESCE(?, related_entities),
          tags = COALESCE(?, tags),
          custom_fields = COALESCE(?, custom_fields),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(
      event.name || null,
      event.description || null,
      event.worldTime || null,
      event.chapterNumber || null,
      event.relatedEntities ? JSON.stringify(event.relatedEntities) : null,
      event.tags ? JSON.stringify(event.tags) : null,
      event.customFields ? JSON.stringify(event.customFields) : null,
      id
    );
    return result.changes > 0;
  }

  deleteEvent(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}

