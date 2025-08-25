import React, { useState, useEffect } from 'react';
import { Entity, Tag } from '../../types';
import EntityForm from '../forms/EntityForm';
import './EntityManagement.css';

const EntityManagement: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEntities();
  }, [entities, searchTerm, typeFilter, tagFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entitiesData, tagsData] = await Promise.all([
        window.electronAPI.entity.getAll(),
        window.electronAPI.tag.getAll(),
      ]);
      setEntities(entitiesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntities = () => {
    let filtered = entities;

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.description && entity.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 按类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entity => entity.type === typeFilter);
    }

    // 按标签过滤
    if (tagFilter !== 'all') {
      filtered = filtered.filter(entity =>
        entity.tags && entity.tags.includes(tagFilter)
      );
    }

    setFilteredEntities(filtered);
  };

  const handleCreateEntity = () => {
    setSelectedEntity(null);
    setShowForm(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowForm(true);
  };

  const handleDeleteEntity = async (entityId: number) => {
    if (window.confirm('确定要删除这个实体吗？')) {
      try {
        await window.electronAPI.entity.delete(entityId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete entity:', error);
        alert('删除失败');
      }
    }
  };

  const handleFormSubmit = async (entityData: Partial<Entity>) => {
    try {
      if (selectedEntity) {
        await window.electronAPI.entity.update(selectedEntity.id!, entityData);
      } else {
        await window.electronAPI.entity.create(entityData);
      }
      setShowForm(false);
      setSelectedEntity(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save entity:', error);
      alert('保存失败');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEntity(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'character': return '人物';
      case 'item': return '物品';
      case 'faction': return '势力';
      default: return type;
    }
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag ? tag.color : '#6b7280';
  };

  if (loading) {
    return (
      <div className="view-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">实体管理</h1>
        <p className="view-subtitle">管理故事中的人物、物品和势力</p>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleCreateEntity}>
            ➕ 添加实体
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            className="input search-input"
            placeholder="搜索实体..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select
            className="input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">所有类型</option>
            <option value="character">人物</option>
            <option value="item">物品</option>
            <option value="faction">势力</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            className="input"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="all">所有标签</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.name}>{tag.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 实体列表 */}
      <div className="entity-list">
        {filteredEntities.length > 0 ? (
          <div className="entity-grid">
            {filteredEntities.map((entity) => (
              <div key={entity.id} className="entity-card">
                <div className="entity-header">
                  <h3 className="entity-name">{entity.name}</h3>
                  <span className="entity-type">{getTypeLabel(entity.type)}</span>
                </div>
                
                {entity.description && (
                  <p className="entity-description">{entity.description}</p>
                )}
                
                {entity.tags && entity.tags.length > 0 && (
                  <div className="entity-tags">
                    {entity.tags.map((tagName) => (
                      <span
                        key={tagName}
                        className="tag"
                        style={{ backgroundColor: getTagColor(tagName) }}
                      >
                        {tagName}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="entity-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditEntity(entity)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteEntity(entity.id!)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">暂无实体</div>
            <div className="empty-state-description">
              {searchTerm || typeFilter !== 'all' || tagFilter !== 'all'
                ? '没有找到符合条件的实体'
                : '开始添加人物、物品或势力来管理你的故事'
              }
            </div>
          </div>
        )}
      </div>

      {/* 实体表单模态框 */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <EntityForm
              entity={selectedEntity}
              tags={tags}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityManagement;

