import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Event, Entity, Tag } from '../../types';
import './TimelineCanvas.css';

interface TimelineCanvasProps {
  events: Event[];
  entities: Entity[];
  tags: Tag[];
  timelineType: 'world' | 'chapter';
  onEventClick: (event: Event) => void;
  onEventDelete: (eventId: number) => void;
}

interface TimelineEvent extends Event {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
  events,
  entities,
  tags,
  timelineType,
  onEventClick,
  onEventDelete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 计算时间线布局
  const calculateLayout = useCallback(() => {
    if (events.length === 0) return;

    const sortedEvents = [...events].sort((a, b) => {
      if (timelineType === 'world') {
        // 按世界时间排序（简单字符串比较）
        return (a.worldTime || '').localeCompare(b.worldTime || '');
      } else {
        // 按章节数排序
        return (a.chapterNumber || 0) - (b.chapterNumber || 0);
      }
    });

    const containerWidth = containerRef.current?.clientWidth || 1000;
    const eventWidth = 250;
    const eventHeight = 120;
    const horizontalSpacing = 300;
    const verticalSpacing = 150;
    const startX = 50;
    const startY = 100;

    const layoutEvents: TimelineEvent[] = [];
    const lanes: number[] = []; // 记录每个泳道的最后一个事件的右边界

    sortedEvents.forEach((event, index) => {
      // 找到可以放置事件的泳道
      let laneIndex = 0;
      const eventX = startX + index * horizontalSpacing;
      
      // 寻找合适的泳道
      while (laneIndex < lanes.length && lanes[laneIndex] > eventX - horizontalSpacing * 0.5) {
        laneIndex++;
      }

      const eventY = startY + laneIndex * verticalSpacing;
      
      // 更新泳道信息
      if (laneIndex >= lanes.length) {
        lanes.push(eventX + eventWidth);
      } else {
        lanes[laneIndex] = eventX + eventWidth;
      }

      layoutEvents.push({
        ...event,
        x: eventX,
        y: eventY,
        width: eventWidth,
        height: eventHeight,
      });
    });

    setTimelineEvents(layoutEvents);
  }, [events, timelineType]);

  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  // 处理缩放
  const handleZoom = (delta: number, centerX: number, centerY: number) => {
    const newScale = Math.max(0.5, Math.min(3, scale + delta * 0.1));
    const scaleRatio = newScale / scale;
    
    setScale(newScale);
    setOffset(prev => ({
      x: centerX - (centerX - prev.x) * scaleRatio,
      y: centerY - (centerY - prev.y) * scaleRatio,
    }));
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        handleZoom(-e.deltaY / 100, centerX, centerY);
      }
    }
  };

  // 处理拖拽平移
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 获取实体名称
  const getEntityName = (entityId: number) => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.name : `实体${entityId}`;
  };

  // 获取标签颜色
  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag ? tag.color : '#6b7280';
  };

  // 格式化时间显示
  const formatTime = (event: Event) => {
    if (timelineType === 'world') {
      return event.worldTime || '未知时间';
    } else {
      return event.chapterNumber ? `第${event.chapterNumber}章` : '未知章节';
    }
  };

  return (
    <div className="timeline-canvas-container">
      {/* 控制面板 */}
      <div className="timeline-controls-panel">
        <button
          className="timeline-control-btn"
          onClick={() => handleZoom(0.5, 0, 0)}
          title="放大"
        >
          🔍+
        </button>
        <button
          className="timeline-control-btn"
          onClick={() => handleZoom(-0.5, 0, 0)}
          title="缩小"
        >
          🔍-
        </button>
        <button
          className="timeline-control-btn"
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          title="重置视图"
        >
          🎯
        </button>
        <span className="scale-indicator">{Math.round(scale * 100)}%</span>
      </div>

      {/* 时间线画布 */}
      <div
        ref={containerRef}
        className="timeline-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="timeline-content"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* 时间轴线 */}
          <svg
            className="timeline-axis-svg"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: Math.max(1000, timelineEvents.length * 300 + 100),
              height: Math.max(600, Math.max(...timelineEvents.map(e => e.y)) + 200),
              pointerEvents: 'none',
            }}
          >
            {/* 主时间轴 */}
            <line
              x1={0}
              y1={50}
              x2={Math.max(1000, timelineEvents.length * 300 + 100)}
              y2={50}
              stroke="#4b5563"
              strokeWidth={2}
            />
            
            {/* 连接线 */}
            {timelineEvents.map((event, index) => {
              if (index === 0) return null;
              const prevEvent = timelineEvents[index - 1];
              return (
                <g key={`connection-${event.id}`}>
                  <line
                    x1={prevEvent.x + prevEvent.width / 2}
                    y1={prevEvent.y}
                    x2={event.x + event.width / 2}
                    y2={event.y}
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="5,5"
                    opacity={0.6}
                  />
                </g>
              );
            })}
          </svg>

          {/* 事件卡片 */}
          {timelineEvents.map((event) => (
            <div
              key={event.id}
              className={`timeline-event ${selectedEventId === event.id ? 'selected' : ''}`}
              style={{
                left: event.x,
                top: event.y,
                width: event.width,
                height: event.height,
              }}
              onClick={() => {
                setSelectedEventId(event.id!);
                onEventClick(event);
              }}
            >
              <div className="event-header">
                <h3 className="event-name">{event.name}</h3>
                <div className="event-actions">
                  <button
                    className="event-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    className="event-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventDelete(event.id!);
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="event-time">{formatTime(event)}</div>

              {event.description && (
                <div className="event-description">{event.description}</div>
              )}

              {event.relatedEntities && event.relatedEntities.length > 0 && (
                <div className="event-entities">
                  {event.relatedEntities.slice(0, 3).map((entityId) => (
                    <span key={entityId} className="event-entity">
                      {getEntityName(entityId)}
                    </span>
                  ))}
                  {event.relatedEntities.length > 3 && (
                    <span className="event-entity">+{event.relatedEntities.length - 3}</span>
                  )}
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  {event.tags.slice(0, 2).map((tagName) => (
                    <span
                      key={tagName}
                      className="event-tag"
                      style={{ backgroundColor: getTagColor(tagName) }}
                    >
                      {tagName}
                    </span>
                  ))}
                  {event.tags.length > 2 && (
                    <span className="event-tag" style={{ backgroundColor: '#6b7280' }}>
                      +{event.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineCanvas;

