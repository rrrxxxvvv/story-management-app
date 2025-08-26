import React, { useState, useEffect } from 'react';
import { Entity, Event, Tag } from '../../types';

interface DashboardProps {
  currentProjectId: number | null;
}

const Dashboard: React.FC<DashboardProps> = ({ currentProjectId }) => {
  const [stats, setStats] = useState({
    entities: 0,
    events: 0,
    tags: 0,
    characters: 0,
    items: 0,
    factions: 0,
    eventEntities: 0,
  });
  const [recentEntities, setRecentEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProjectId) {
      loadDashboardData();
    }
  }, [currentProjectId]);

  const loadDashboardData = async () => {
    if (!currentProjectId) return;
    
    try {
      setLoading(true);
      
      // 获取所有数据
      const [entities, tags] = await Promise.all([
        window.electronAPI.entity.getAll(currentProjectId),
        window.electronAPI.tag.getAll(currentProjectId),
      ]);

      // 计算统计数据
      const characters = entities.filter(e => e.type === 'character').length;
      const items = entities.filter(e => e.type === 'item').length;
      const factions = entities.filter(e => e.type === 'faction').length;
      const eventEntities = entities.filter(e => e.type === 'event').length;

      setStats({
        entities: entities.length,
        events: 0, // 保留兼容性
        tags: tags.length,
        characters,
        items,
        factions,
        eventEntities,
      });

      // 获取最近的实体
      setRecentEntities(entities.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentProjectId) {
    return (
      <div className="view-container">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">请选择项目</div>
          <div className="empty-state-description">
            选择一个项目来查看概览
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="view-title">项目概览</h1>
        <p className="view-subtitle">查看项目的整体状态和最新活动</p>
      </div>

      {/* 统计卡片 */}
      <div className="content-grid three-columns" style={{ marginBottom: '24px' }}>
        <div className="content-section">
          <div className="section-title">总实体数</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>
            {stats.entities}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            人物: {stats.characters} | 物品: {stats.items} | 势力: {stats.factions} | 事件: {stats.eventEntities}
          </div>
        </div>

        <div className="content-section">
          <div className="section-title">自动时间线</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
            {stats.eventEntities}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            从实体信息自动生成
          </div>
        </div>

        <div className="content-section">
          <div className="section-title">自定义标签</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
            {stats.tags}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            用于分类管理
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="content-grid">
        <div className="content-section">
          <div className="section-title">最近添加的实体</div>
          <div className="section-content">
            {recentEntities.length > 0 ? (
              <div>
                {recentEntities.map((entity) => (
                  <div
                    key={entity.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500' }}>{entity.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {entity.type === 'character' ? '👤 人物' : 
                         entity.type === 'item' ? '📦 物品' : 
                         entity.type === 'faction' ? '🏛️ 势力' : 
                         entity.type === 'event' ? '⚡ 事件' : entity.type}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {entity.createdAt ? new Date(entity.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">暂无实体</div>
                <div className="empty-state-description">
                  开始添加人物、物品、势力或事件来管理你的故事
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

