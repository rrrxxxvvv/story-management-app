import React, { useState, useEffect } from 'react';
import { Entity, Tag } from '../../types';
import './EntityForm.css';

interface EntityFormProps {
  entity?: Entity | null;
  tags: Tag[];
  onSubmit: (entityData: Partial<Entity>) => void;
  onCancel: () => void;
}

const EntityForm: React.FC<EntityFormProps> = ({ entity, tags, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'character' as Entity['type'],
    description: '',
    tags: [] as string[],
    customFields: {} as Record<string, any>,
  });

  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name || '',
        type: entity.type || 'character',
        description: entity.description || '',
        tags: entity.tags || [],
        customFields: entity.customFields || {},
      });
    }
  }, [entity]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
      alert('请输入实体名称');
      return;
    }
    onSubmit(formData);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'character': return '人物';
      case 'item': return '物品';
      case 'faction': return '势力';
      default: return type;
    }
  };

  const getTagsByCategory = (category: string) => {
    return tags.filter(tag => tag.category === category);
  };

  const categories = [...new Set(tags.map(tag => tag.category))];

  return (
    <div className="entity-form">
      <div className="form-header">
        <h2>{entity ? '编辑实体' : '创建实体'}</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* 基本信息 */}
        <div className="form-section">
          <h3>基本信息</h3>
          
          <div className="form-group">
            <label>名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="输入实体名称"
              required
            />
          </div>

          <div className="form-group">
            <label>类型</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as Entity['type'])}
            >
              <option value="character">人物</option>
              <option value="item">物品</option>
              <option value="faction">势力</option>
            </select>
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              className="input textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="输入实体描述"
              rows={4}
            />
          </div>
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
            {entity ? '更新' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;

