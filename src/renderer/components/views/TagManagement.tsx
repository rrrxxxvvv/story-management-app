import React, { useState, useEffect } from 'react';
import { Tag } from '../../types';
import TagForm from '../forms/TagForm';
import './TagManagement.css';

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tagsData = await window.electronAPI.tag.getAll();
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = () => {
    setSelectedTag(null);
    setShowForm(true);
  };

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setShowForm(true);
  };

  const handleDeleteTag = async (tagId: number) => {
    if (window.confirm('确定要删除这个标签吗？删除后将从所有实体中移除。')) {
      try {
        await window.electronAPI.tag.delete(tagId);
        await loadTags();
      } catch (error) {
        console.error('Failed to delete tag:', error);
        alert('删除失败');
      }
    }
  };

  const handleFormSubmit = async (tagData: Partial<Tag>) => {
    try {
      if (selectedTag) {
        await window.electronAPI.tag.update(selectedTag.id!, tagData);
      } else {
        await window.electronAPI.tag.create(tagData);
      }
      setShowForm(false);
      setSelectedTag(null);
      await loadTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
      alert('保存失败');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedTag(null);
  };

  // 按分类组织标签
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const categories = Object.keys(tagsByCategory).sort();

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
        <h1 className="view-title">标签管理</h1>
        <p className="view-subtitle">创建和管理用于分类的自定义标签</p>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleCreateTag}>
            ➕ 创建标签
          </button>
        </div>
      </div>

      <div className="tag-management">
        {categories.length > 0 ? (
          <div className="tag-categories">
            {categories.map(category => (
              <div key={category} className="tag-category-section">
                <div className="category-header">
                  <h2 className="category-title">{category}</h2>
                  <span className="category-count">
                    {tagsByCategory[category].length} 个标签
                  </span>
                </div>
                
                <div className="tag-grid">
                  {tagsByCategory[category].map(tag => (
                    <div key={tag.id} className="tag-card">
                      <div className="tag-preview">
                        <span
                          className="tag-color-preview"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="tag-info">
                          <h3 className="tag-name">{tag.name}</h3>
                          {tag.description && (
                            <p className="tag-description">{tag.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="tag-actions">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => handleEditTag(tag)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteTag(tag.id!)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <div className="empty-state-title">暂无标签</div>
            <div className="empty-state-description">
              创建标签来更好地组织和分类你的故事元素
            </div>
            <button className="btn btn-primary" onClick={handleCreateTag}>
              创建第一个标签
            </button>
          </div>
        )}
      </div>

      {/* 标签表单模态框 */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <TagForm
              tag={selectedTag}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagement;

