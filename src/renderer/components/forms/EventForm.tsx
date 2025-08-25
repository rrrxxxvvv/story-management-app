import React, { useState, useEffect } from 'react';
import { Event, Entity, Tag } from '../../types';
import './EventForm.css';

interface EventFormProps {
  event?: Event | null;
  entities: Entity[];
  tags: Tag[];
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, entities, tags, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    worldTime: '',
    chapterNumber: undefined as number | undefined,
    relatedEntities: [] as number[],
    tags: [] as string[],
    customFields: {} as Record<string, any>,
  });

  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        worldTime: event.worldTime || '',
        chapterNumber: event.chapterNumber,
        relatedEntities: event.relatedEntities || [],
        tags: event.tags || [],
        customFields: event.customFields || {},
      });
    }
  }, [event]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEntityToggle = (entityId: number) => {
    setFormData(prev => ({
      ...prev,
      relatedEntities: prev.relatedEntities.includes(entityId)
        ? prev.relatedEntities.filter(id => id !== entityId)
        : [...prev.relatedEntities, entityId],
    }));
  };

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleAddCustomField = () => {
    if (newCustomField.key && newCustomField.value) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [newCustomField.key]: newCustomField.value,
        },
      }));
      setNewCustomField({ key: '', value: '' });
    }
  };

  const handleRemoveCustomField = (key: string) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[key];
      return {
        ...prev,
        customFields: newCustomFields,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入事件名称');
      return;
    }
    
    // 至少需要世界时间或章节数之一
    if (!formData.worldTime && formData.chapterNumber === undefined) {
      alert('请至少填写世界时间或章节数');
      return;
    }

    onSubmit(formData);
  };

  const getEntityLabel = (entity: Entity) => {
    const typeLabel = entity.type === 'character' ? '人物' : 
                     entity.type === 'item' ? '物品' : '势力';
    return `${entity.name} (${typeLabel})`;
  };

  const getTagsByCategory = (category: string) => {
    return tags.filter(tag => tag.category === category);
  };

  const categories = [...new Set(tags.map(tag => tag.category))];

  return (
    <div className="event-form">
      <div className="form-header">
        <h2>{event ? '编辑事件' : '创建事件'}</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* 基本信息 */}
        <div className="form-section">
          <h3>基本信息</h3>
          
          <div className="form-group">
            <label>事件名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="输入事件名称"
              required
            />
          </div>

          <div className="form-group">
            <label>事件描述</label>
            <textarea
              className="input textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="输入事件描述"
              rows={4}
            />
          </div>
        </div>

        {/* 时间信息 */}
        <div className="form-section">
          <h3>时间信息</h3>
          
          <div className="form-group">
            <label>世界时间</label>
            <input
              type="text"
              className="input"
              value={formData.worldTime}
              onChange={(e) => handleInputChange('worldTime', e.target.value)}
              placeholder="例如：创世历1024年春、2023年3月15日"
            />
          </div>

          <div className="form-group">
            <label>章节数</label>
            <input
              type="number"
              className="input"
              value={formData.chapterNumber || ''}
              onChange={(e) => handleInputChange('chapterNumber', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="输入章节数"
              min="1"
            />
          </div>
        </div>

        {/* 关联实体 */}
        <div className="form-section">
          <h3>关联实体</h3>
          {entities.length > 0 ? (
            <div className="entity-selection">
              {['character', 'item', 'faction'].map(type => {
                const typeEntities = entities.filter(entity => entity.type === type);
                if (typeEntities.length === 0) return null;
                
                const typeLabel = type === 'character' ? '人物' : 
                                 type === 'item' ? '物品' : '势力';
                
                return (
                  <div key={type} className="entity-type-group">
                    <h4>{typeLabel}</h4>
                    <div className="entity-list">
                      {typeEntities.map(entity => (
                        <label key={entity.id} className="entity-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.relatedEntities.includes(entity.id!)}
                            onChange={() => handleEntityToggle(entity.id!)}
                          />
                          <span className="entity-label">{entity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-entities">暂无可用实体，请先在实体管理中创建实体</p>
          )}
        </div>

        {/* 标签选择 */}
        <div className="form-section">
          <h3>标签</h3>
          {categories.length > 0 ? (
            categories.map(category => {
              const categoryTags = getTagsByCategory(category);
              if (categoryTags.length === 0) return null;
              
              return (
                <div key={category} className="tag-category">
                  <h4>{category}</h4>
                  <div className="tag-list">
                    {categoryTags.map(tag => (
                      <label key={tag.id} className="tag-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.tags.includes(tag.name)}
                          onChange={() => handleTagToggle(tag.name)}
                        />
                        <span
                          className="tag-label"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-tags">暂无可用标签，请先在标签管理中创建标签</p>
          )}
        </div>

        {/* 自定义字段 */}
        <div className="form-section">
          <h3>自定义字段</h3>
          
          {Object.entries(formData.customFields).map(([key, value]) => (
            <div key={key} className="custom-field">
              <div className="custom-field-content">
                <strong>{key}:</strong> {String(value)}
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => handleRemoveCustomField(key)}
              >
                删除
              </button>
            </div>
          ))}

          <div className="add-custom-field">
            <div className="custom-field-inputs">
              <input
                type="text"
                className="input"
                placeholder="字段名"
                value={newCustomField.key}
                onChange={(e) => setNewCustomField(prev => ({ ...prev, key: e.target.value }))}
              />
              <input
                type="text"
                className="input"
                placeholder="字段值"
                value={newCustomField.value}
                onChange={(e) => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddCustomField}
              >
                添加
              </button>
            </div>
          </div>
        </div>

        {/* 表单操作 */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            {event ? '更新' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;

