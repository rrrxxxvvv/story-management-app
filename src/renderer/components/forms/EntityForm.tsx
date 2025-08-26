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

  const handleCustomFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
  };

  const handleAddCustomField = () => {
    if (newCustomField.key && newCustomField.value) {
      handleCustomFieldChange(newCustomField.key, newCustomField.value);
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

  const getTypeSpecificFields = () => {
    switch (formData.type) {
      case 'character':
        return (
          <>
            <div className="form-group">
              <label>出生日期</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第三纪元 2941年"
                value={formData.customFields.birthDate || ''}
                onChange={(e) => handleCustomFieldChange('birthDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>死亡日期</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第三纪元 3019年"
                value={formData.customFields.deathDate || ''}
                onChange={(e) => handleCustomFieldChange('deathDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>职业/身份</label>
              <input
                type="text"
                className="input"
                placeholder="例如：国王、法师、盗贼"
                value={formData.customFields.occupation || ''}
                onChange={(e) => handleCustomFieldChange('occupation', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>所属势力</label>
              <input
                type="text"
                className="input"
                placeholder="例如：刚铎王国"
                value={formData.customFields.affiliation || ''}
                onChange={(e) => handleCustomFieldChange('affiliation', e.target.value)}
              />
            </div>
          </>
        );
      case 'item':
        return (
          <>
            <div className="form-group">
              <label>创造日期</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第一纪元 500年"
                value={formData.customFields.creationDate || ''}
                onChange={(e) => handleCustomFieldChange('creationDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>发现日期</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第三纪元 2941年"
                value={formData.customFields.discoveryDate || ''}
                onChange={(e) => handleCustomFieldChange('discoveryDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>创造者</label>
              <input
                type="text"
                className="input"
                placeholder="例如：精灵工匠"
                value={formData.customFields.creator || ''}
                onChange={(e) => handleCustomFieldChange('creator', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>材质</label>
              <input
                type="text"
                className="input"
                placeholder="例如：秘银、龙鳞"
                value={formData.customFields.material || ''}
                onChange={(e) => handleCustomFieldChange('material', e.target.value)}
              />
            </div>
          </>
        );
      case 'faction':
        return (
          <>
            <div className="form-group">
              <label>成立日期</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第二纪元 3320年"
                value={formData.customFields.foundingDate || ''}
                onChange={(e) => handleCustomFieldChange('foundingDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>解散日期</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第三纪元 3019年"
                value={formData.customFields.dissolutionDate || ''}
                onChange={(e) => handleCustomFieldChange('dissolutionDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>创始人</label>
              <input
                type="text"
                className="input"
                placeholder="例如：伊西尔杜"
                value={formData.customFields.founder || ''}
                onChange={(e) => handleCustomFieldChange('founder', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>总部位置</label>
              <input
                type="text"
                className="input"
                placeholder="例如：米那斯提力斯"
                value={formData.customFields.headquarters || ''}
                onChange={(e) => handleCustomFieldChange('headquarters', e.target.value)}
              />
            </div>
          </>
        );
      case 'event':
        return (
          <>
            <div className="form-group">
              <label>开始时间</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第三纪元 3018年春"
                value={formData.customFields.startTime || ''}
                onChange={(e) => handleCustomFieldChange('startTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>结束时间</label>
              <input
                type="text"
                className="input"
                placeholder="例如：第三纪元 3019年春"
                value={formData.customFields.endTime || ''}
                onChange={(e) => handleCustomFieldChange('endTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>发生地点</label>
              <input
                type="text"
                className="input"
                placeholder="例如：末日火山"
                value={formData.customFields.location || ''}
                onChange={(e) => handleCustomFieldChange('location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>参与者</label>
              <input
                type="text"
                className="input"
                placeholder="例如：弗罗多、山姆、咕噜"
                value={formData.customFields.participants || ''}
                onChange={(e) => handleCustomFieldChange('participants', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>事件结果</label>
              <textarea
                className="input"
                placeholder="描述事件的结果和影响"
                value={formData.customFields.outcome || ''}
                onChange={(e) => handleCustomFieldChange('outcome', e.target.value)}
                rows={3}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="entity-form">
      <div className="form-header">
        <h2>{entity ? '编辑实体' : '添加实体'}</h2>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-body">
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
            <label>类型 *</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as Entity['type'])}
            >
              <option value="character">👤 人物</option>
              <option value="item">📦 物品</option>
              <option value="faction">🏛️ 势力</option>
              <option value="event">⚡ 事件</option>
            </select>
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              className="input"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="输入详细描述"
              rows={4}
            />
          </div>

          {/* 类型特定字段 */}
          {getTypeSpecificFields()}

          {/* 通用字段 */}
          <div className="form-group">
            <label>首次出现</label>
            <input
              type="text"
              className="input"
              placeholder="章节号或时间，例如：第1章 或 第三纪元 3018年"
              value={formData.customFields.firstAppearance || ''}
              onChange={(e) => handleCustomFieldChange('firstAppearance', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>最后出现</label>
            <input
              type="text"
              className="input"
              placeholder="章节号或时间，例如：第20章 或 第三纪元 3019年"
              value={formData.customFields.lastAppearance || ''}
              onChange={(e) => handleCustomFieldChange('lastAppearance', e.target.value)}
            />
          </div>

          {/* 标签选择 */}
          <div className="form-group">
            <label>标签</label>
            <div className="tag-selection">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-option ${formData.tags.includes(tag.name) ? 'selected' : ''}`}
                  style={{
                    backgroundColor: formData.tags.includes(tag.name) ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: formData.tags.includes(tag.name) ? 'white' : tag.color,
                  }}
                  onClick={() => handleTagToggle(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 自定义字段 */}
          <div className="form-group">
            <label>其他自定义字段</label>
            <div className="custom-fields">
              {Object.entries(formData.customFields).map(([key, value]) => {
                // 跳过已经在类型特定字段中显示的字段
                const typeSpecificKeys = {
                  character: ['birthDate', 'deathDate', 'occupation', 'affiliation'],
                  item: ['creationDate', 'discoveryDate', 'creator', 'material'],
                  faction: ['foundingDate', 'dissolutionDate', 'founder', 'headquarters'],
                  event: ['startTime', 'endTime', 'location', 'participants', 'outcome']
                };
                const commonKeys = ['firstAppearance', 'lastAppearance'];
                const skipKeys = [...(typeSpecificKeys[formData.type] || []), ...commonKeys];
                
                if (skipKeys.includes(key)) return null;

                return (
                  <div key={key} className="custom-field">
                    <input
                      type="text"
                      className="input field-key"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newCustomFields = { ...formData.customFields };
                        delete newCustomFields[key];
                        newCustomFields[newKey] = value;
                        handleInputChange('customFields', newCustomFields);
                      }}
                      placeholder="字段名"
                    />
                    <input
                      type="text"
                      className="input field-value"
                      value={value}
                      onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                      placeholder="字段值"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleRemoveCustomField(key)}
                    >
                      删除
                    </button>
                  </div>
                );
              })}
              
              <div className="custom-field">
                <input
                  type="text"
                  className="input field-key"
                  value={newCustomField.key}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="新字段名"
                />
                <input
                  type="text"
                  className="input field-value"
                  value={newCustomField.value}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="字段值"
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={handleAddCustomField}
                  disabled={!newCustomField.key || !newCustomField.value}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-footer">
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

