import React from 'react';

interface StoryArcsProps {
  currentProjectId: number | null;
}

const StoryArcs: React.FC<StoryArcsProps> = ({ currentProjectId }) => {
  if (!currentProjectId) {
    return (
      <div className="view-container">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">请选择项目</div>
          <div className="empty-state-description">
            选择一个项目来管理故事弧
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">故事弧管理</h1>
        <p className="view-subtitle">管理故事的章节结构和情节发展</p>
        <div className="view-actions">
          <button className="btn btn-primary">
            ➕ 创建故事弧
          </button>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">📖</div>
        <div className="empty-state-title">故事弧功能开发中</div>
        <div className="empty-state-description">
          此功能将在后续版本中提供，用于管理故事的章节结构和情节节点
        </div>
      </div>
    </div>
  );
};

export default StoryArcs;

