import React, { useState, useEffect } from 'react';
import { Tag } from '../../types';
import './TagForm.css';

interface TagFormProps {
  tag?: Tag | null;
  onSubmit: (tagData: Partial<Tag>) => void;
  onCancel: () => void;
}

const predefinedColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280', '#374151', '#1f2937'
];

const predefinedCategories = [
  '人物标签',
  '物品标签',
  '势力标签',
  '自定义标签'
];

const TagForm: React.FC<TagFormProps> = ({ tag, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#4f46e5',
    category: '自定义标签',
    description: '',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || '',
        color: tag.color || '#4f46e5',
        category: tag.category || '自定义标签',
        description: tag.description || '',
      });
      
      // 检查是否使用自定义分类
      if (!predefinedCategories.includes(tag.category)) {
        setUseCustomCategory(true);
        setCustomCategory(tag.category);
      }
    }
  }, [tag]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('请输入标签名称');
      return;
    }

    const finalCategory = useCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : formData.category;

    onSubmit({
      ...formData,
      category: finalCategory,
    });
  };

  return (
    <div className="tag-form">
      <div className="form-header">
        <h2>{tag ? '编辑标签' : '创建标签'}</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-section">
          <div className="form-group">
            <label>标签名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="输入标签名称"
              required
            />
          </div>

          <div className="form-group">
            <label>标签颜色</label>
            <div className="color-picker">
              <div className="color-grid">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('color', color)}
                  />
                ))}
              </div>
              <div className="custom-color">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="color-input"
                />
                <span className="color-value">{formData.color}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>标签分类</label>
            <div className="category-selection">
              <div className="category-options">
                <label className="category-option">
                  <input
                    type="radio"
                    name="categoryType"
                    checked={!useCustomCategory}
                    onChange={() => setUseCustomCategory(false)}
                  />
                  <span>预定义分类</span>
                </label>
                <label className="category-option">
                  <input
                    type="radio"
                    name="categoryType"
                    checked={useCustomCategory}
                    onChange={() => setUseCustomCategory(true)}
                  />
                  <span>自定义分类</span>
                </label>
              </div>
              
              {useCustomCategory ? (
                <input
                  type="text"
                  className="input"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="输入自定义分类名称"
                />
              ) : (
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {predefinedCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              className="input textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="输入标签描述（可选）"
              rows={3}
            />
          </div>
        </div>

        {/* 预览 */}
        <div className="form-section">
          <h3>预览</h3>
          <div className="tag-preview">
            <span
              className="tag"
              style={{ backgroundColor: formData.color }}
            >
              {formData.name || '标签名称'}
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            {tag ? '更新' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TagForm;

