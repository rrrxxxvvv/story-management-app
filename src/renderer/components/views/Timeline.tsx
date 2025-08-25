import React, { useState, useEffect, useRef } from 'react';
import { Event, Entity, Tag } from '../../types';
import TimelineCanvas from '../timeline/TimelineCanvas';
import EventForm from '../forms/EventForm';
import './Timeline.css';

type TimelineType = 'world' | 'chapter';

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<TimelineType>('world');
  const [filters, setFilters] = useState({
    entityType: 'all',
    tag: 'all',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filters, activeTimeline]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, entitiesData, tagsData] = await Promise.all([
        window.electronAPI.event.getAll(),
        window.electronAPI.entity.getAll(),
        window.electronAPI.tag.getAll(),
      ]);
      setEvents(eventsData);
      setEntities(entitiesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // 按时间线类型过滤
    if (activeTimeline === 'world') {
      filtered = filtered.filter(event => event.worldTime);
    } else {
      filtered = filtered.filter(event => event.chapterNumber !== undefined);
    }

    // 按搜索词过滤
    if (filters.search) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // 按实体类型过滤
    if (filters.entityType !== 'all') {
      filtered = filtered.filter(event => {
        if (!event.relatedEntities || event.relatedEntities.length === 0) return false;
        return event.relatedEntities.some(entityId => {
          const entity = entities.find(e => e.id === entityId);
          return entity && entity.type === filters.entityType;
        });
      });
    }

    // 按标签过滤
    if (filters.tag !== 'all') {
      filtered = filtered.filter(event =>
        event.tags && event.tags.includes(filters.tag)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      try {
        await window.electronAPI.event.delete(eventId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('删除失败');
      }
    }
  };

  const handleFormSubmit = async (eventData: Partial<Event>) => {
    try {
      if (selectedEvent) {
        await window.electronAPI.event.update(selectedEvent.id!, eventData);
      } else {
        await window.electronAPI.event.create(eventData);
      }
      setShowForm(false);
      setSelectedEvent(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('保存失败');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEvent(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="view-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="view-container timeline-view">
      <div className="view-header">
        <h1 className="view-title">时间线管理</h1>
        <p className="view-subtitle">可视化管理故事事件的时间线</p>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleCreateEvent}>
            ➕ 添加事件
          </button>
        </div>
      </div>

      {/* 时间线切换和筛选器 */}
      <div className="timeline-controls">
        <div className="timeline-tabs">
          <button
            className={`timeline-tab ${activeTimeline === 'world' ? 'active' : ''}`}
            onClick={() => setActiveTimeline('world')}
          >
            🌍 世界时间线
          </button>
          <button
            className={`timeline-tab ${activeTimeline === 'chapter' ? 'active' : ''}`}
            onClick={() => setActiveTimeline('chapter')}
          >
            📖 章节时间线
          </button>
        </div>

        <div className="timeline-filters">
          <input
            type="text"
            className="input search-input"
            placeholder="搜索事件..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          
          <select
            className="input"
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
          >
            <option value="all">所有实体类型</option>
            <option value="character">人物</option>
            <option value="item">物品</option>
            <option value="faction">势力</option>
          </select>

          <select
            className="input"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
          >
            <option value="all">所有标签</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.name}>{tag.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 时间线可视化区域 */}
      <div className="timeline-content">
        {filteredEvents.length > 0 ? (
          <TimelineCanvas
            events={filteredEvents}
            entities={entities}
            tags={tags}
            timelineType={activeTimeline}
            onEventClick={handleEditEvent}
            onEventDelete={handleDeleteEvent}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">⏰</div>
            <div className="empty-state-title">
              {activeTimeline === 'world' ? '世界时间线为空' : '章节时间线为空'}
            </div>
            <div className="empty-state-description">
              {filters.search || filters.entityType !== 'all' || filters.tag !== 'all'
                ? '没有找到符合条件的事件'
                : `开始添加${activeTimeline === 'world' ? '世界时间' : '章节'}事件来构建时间线`
              }
            </div>
            <button className="btn btn-primary" onClick={handleCreateEvent}>
              添加第一个事件
            </button>
          </div>
        )}
      </div>

      {/* 事件表单模态框 */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <EventForm
              event={selectedEvent}
              entities={entities}
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

export default Timeline;

