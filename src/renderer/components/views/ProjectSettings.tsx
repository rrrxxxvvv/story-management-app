import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import './ProjectSettings.css';

const ProjectSettings: React.FC = () => {
  const [project, setProject] = useState<Project>({
    name: '',
    description: '',
    worldSetting: '',
    protagonistInfo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      setLoading(true);
      // 假设项目ID为1，实际应用中可能需要从上下文获取
      const projectData = await window.electronAPI.project.get(1);
      if (projectData) {
        setProject(projectData);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Project, value: string) => {
    setProject(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (project.id) {
        await window.electronAPI.project.update(project.id, project);
      } else {
        const newProject = await window.electronAPI.project.create(project);
        setProject(newProject);
      }
      alert('项目设置已保存');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
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
        <h1 className="view-title">项目设置</h1>
        <p className="view-subtitle">配置项目的基本信息和世界观设定</p>
        <div className="view-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '💾 保存设置'}
          </button>
        </div>
      </div>

      <div className="project-settings">
        <div className="settings-grid">
          {/* 基本信息 */}
          <div className="settings-section">
            <h2 className="section-title">基本信息</h2>
            
            <div className="form-group">
              <label>项目名称</label>
              <input
                type="text"
                className="input"
                value={project.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="输入项目名称"
              />
            </div>

            <div className="form-group">
              <label>项目描述</label>
              <textarea
                className="input textarea"
                value={project.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="输入项目描述"
                rows={4}
              />
            </div>
          </div>

          {/* 世界观设定 */}
          <div className="settings-section">
            <h2 className="section-title">世界观设定</h2>
            
            <div className="form-group">
              <label>世界观核心设定</label>
              <textarea
                className="input textarea large"
                value={project.worldSetting || ''}
                onChange={(e) => handleInputChange('worldSetting', e.target.value)}
                placeholder="包括力量体系、核心势力、通用设定等..."
                rows={8}
              />
              <div className="form-help">
                包括力量体系（魔法、斗气、异能等）、核心势力关系、货币地理历史等通用规则
              </div>
            </div>
          </div>

          {/* 主角信息 */}
          <div className="settings-section">
            <h2 className="section-title">主角长线信息</h2>
            
            <div className="form-group">
              <label>主角信息</label>
              <textarea
                className="input textarea large"
                value={project.protagonistInfo || ''}
                onChange={(e) => handleInputChange('protagonistInfo', e.target.value)}
                placeholder="主角姓名、长期目标、核心动机等..."
                rows={6}
              />
              <div className="form-help">
                包括主角姓名、贯穿全文的终极目标、核心动机和背景故事
              </div>
            </div>
          </div>
        </div>

        {/* 项目统计 */}
        <div className="project-stats">
          <h2 className="section-title">项目统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-label">总实体数</div>
                <div className="stat-value">-</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <div className="stat-label">时间线事件</div>
                <div className="stat-value">-</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <div className="stat-label">自定义标签</div>
                <div className="stat-value">-</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-label">创建时间</div>
                <div className="stat-value">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;

