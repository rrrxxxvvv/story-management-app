import React, { useState, useEffect } from 'react';
import { Project, Entity, Tag, Event } from '../../types';
import './ProjectSettings.css';

interface ProjectSettingsProps {
  currentProjectId: number | null;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ currentProjectId }) => {
  const [project, setProject] = useState<Project>({
    name: '',
    description: '',
    worldSetting: '',
    protagonistInfo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (currentProjectId) {
      loadProject();
    }
  }, [currentProjectId]);

  const loadProject = async () => {
    if (!currentProjectId) return;
    
    try {
      setLoading(true);
      const projectData = await window.electronAPI.project.get(currentProjectId);
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
    if (!currentProjectId) return;
    
    try {
      setSaving(true);
      await window.electronAPI.project.update(currentProjectId, project);
      alert('项目设置已保存');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPrompt = async () => {
    if (!currentProjectId) return;
    
    try {
      setExporting(true);
      
      // 获取所有项目数据
      const [entities, tags] = await Promise.all([
        window.electronAPI.entity.getAll(currentProjectId),
        window.electronAPI.tag.getAll(currentProjectId),
      ]);

      // 生成prompt内容
      const promptContent = generatePromptContent(project, entities, tags);
      
      // 创建下载链接
      const blob = new Blob([promptContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name || '故事管理'}_prompt.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Prompt文件已导出');
    } catch (error) {
      console.error('Failed to export prompt:', error);
      alert('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const generatePromptContent = (project: Project, entities: Entity[], tags: Tag[]): string => {
    const characters = entities.filter(e => e.type === 'character');
    const items = entities.filter(e => e.type === 'item');
    const factions = entities.filter(e => e.type === 'faction');
    const events = entities.filter(e => e.type === 'event');

    // 找到主角（假设第一个人物是主角，或者有特殊标记）
    const protagonist = characters.find(c => 
      c.tags?.includes('主角') || 
      c.customFields?.isProtagonist ||
      c.name.includes('主角')
    ) || characters[0];

    // 找到关键NPC（有特殊标记或重要标签的角色）
    const keyNPCs = characters.filter(c => 
      c !== protagonist && (
        c.tags?.includes('关键NPC') ||
        c.tags?.includes('重要角色') ||
        c.customFields?.isKeyNPC
      )
    ).slice(0, 3); // 最多3个关键NPC

    // 找到核心势力
    const coreFactions = factions.filter(f =>
      f.tags?.includes('核心势力') ||
      f.tags?.includes('主要势力') ||
      f.customFields?.isCoreFaction
    ).slice(0, 5);

    return `# ----------------------------------------------------------------------
# 第一部分：项目级设定
# (在项目首次启动时填写，后续章节中保持不变)
# ----------------------------------------------------------------------

- **小说名称:** ${project.name || '{小说名称}'}
- **世界观核心设定:**
    - **力量体系:** ${extractPowerSystem(project, entities)}
    - **核心势力:** ${generateFactionsInfo(coreFactions)}
    - **通用设定:** ${project.worldSetting || '{请在此填充货币、地理、历史、通讯方式等普适性世界规则}'}
- **主角长线信息:**
    - **姓名:** ${protagonist?.name || '{主角姓名}'}
    - **长期目标:** ${protagonist?.customFields?.longTermGoal || protagonist?.description || '{主角贯穿全文的终极目标，如复仇、寻找真相、拯救世界等}'}
- **关键NPC长线信息:**
${generateKeyNPCsInfo(keyNPCs)}

# ----------------------------------------------------------------------
# 第二部分：故事弧大纲
# (在开启一个新的故事段落时规划，作为未来数章的指导蓝图)
# ----------------------------------------------------------------------

- **当前故事弧名称:** {故事弧名称，例如："黑石城的阴谋"}
- **故事弧简介:** {用一两句话概括这个故事弧的核心内容}
- **故事弧关键情节节点:**
    - **[状态]** 节点1: {情节描述}
    - **[状态]** 节点2: {情节描述}
    - **[状态]** 节点3: {情节描述}
    - ...
    - *(状态可选：[已完成], [进行中], [未开始])*

# ----------------------------------------------------------------------
# 第三部分：单章生成指令
# (每一章都使用此部分进行创作)
# ----------------------------------------------------------------------

# 创作任务：《${project.name || '{小说名称}'}》 - 第 {章节号} 章

## 1. 核心指令 (Core Instruction)
你是一位才华横溢的小说家和严谨的世界状态追踪器。

**任务一：小说创作**
- **逻辑自检：** 动笔前，检查本章任务与所有上下文是否存在逻辑矛盾。
- **创作执行：** 根据下方所有信息，创作小说正文。
- **字数控制：** {目标字数，例如：3000字左右}
- **风格与语调:**
    - **整体风格:** {风格描述，例如：悬疑、热血、轻松}
    - **本章核心情感基调:** {本章主导的情感，例如：紧张、猜忌、悲伤、喜悦}
    - **叙事视角:** {第一人称 | 第三人称有限(跟随主角) | 第三人称全知 | 多视角POV}
    - **描写侧重:** {动作与战斗 | 心理与情感 | 对话与交锋 | 环境与氛围}
    - **文风要求:** 文字风格要求简单明了，避免复杂的长句和华丽辞藻。多用短段落，确保行文清晰易读。
		- **鼓励的风格 (Do):** "他推开门。寒风灌了进来。屋里只有一张桌子，桌上放着一盏快要熄灭的油灯。"
		- **避免的风格 (Don't):** "他费力地将那扇饱经风霜的厚重木门缓缓推开，一股夹杂着雪花与草木气息的寒风瞬间穿堂而过，涌入了这个仅有一张孤零零的木桌作为陈设的简陋房间，桌上那盏油灯的火苗在风中摇曳，仿佛随时都会熄灭。"

- **本章剧情节奏:** {请选择一项：舒缓 | 正常 | 紧凑 | 压迫}
    - *(舒缓：侧重日常、细节、铺垫；正常：情节稳步推进；紧凑：事件接连发生，节奏较快；压迫：危机感强，主角被推着走)*

**任务二：状态更新元数据**
- 创作完毕后，另起一行，生成用\`§...§\`包裹的【状态更新摘要】，精确反映本章所有状态变化。
- **摘要必须按以下标准格式组织：**

$$$状态更新摘要
[角色状态]
- 主角: {具体变化，如：位置、能力、装备、伤势、关系等}
- NPC: {具体变化}

[剧情进展] 
- 已完成: {本章完成的关键情节点}
- 新增线索: {本章获得的重要信息}
- 推进状态: {当前故事弧节点状态更新}

[物品道具]
- 新获得: {物品名称 - 简要说明}
- 消耗/丢失: {物品名称 - 原因}
- 状态变化: {现有物品的状态改变}

[环境变化]
- 位置转移: {从何地到何地}
- 时间推进: {具体时间变化}
- 环境状态: {周围环境的重要变化}

[伏笔埋设]
- 新埋伏笔: {伏笔内容 - 预期在何时揭露}
- 伏笔推进: {已有伏笔的发展状态}

[关系网络]
- 关系变化: {角色间关系的具体变动}
- 新增联系: {新建立的人物关系}

[待解决问题]
- 新增: {本章产生的新问题/矛盾}
- 解决: {本章解决的问题}
$$$

- **格式要求：** 
  - 每个分类下如无变化，填写"无变化"
  - 变化描述要具体明确，避免模糊表述
  - 优先记录对后续剧情有影响的变化

## 2. 上下文与状态

### 2.1. 故事弧当前进展
- **正在执行节点:** {从故事弧大纲中复制当前"进行中"的关键情节节点}
- **前情提要 (上一章结尾):** {上一章结尾的具体情景}

### 2.2. 角色状态面板
- **本章主视角:** {主角 (70%), NPC B (30%) | 或仅填写"主角"}
- **主角: ${protagonist?.name || '{主角姓名}'}**
    - **称号/身份:** ${protagonist?.customFields?.title || protagonist?.customFields?.occupation || '{当前身份}'}
    - **位置:** {当前所在的具体地点}
    - **身体状态:** {健康、轻伤、重伤等}
    - **能量/精神状态:** {魔法值: 80/100, 体力: 充足, 精神压力: 中等}
    - **技能与能力:** ${generateSkillsInfo(protagonist)}
    - **装备与物品:** ${generateEquipmentInfo(protagonist, items)}
    - **核心奇物/金手指:** ${protagonist?.customFields?.specialAbility || '{名称、状态、功能、充能进度等}'}
    - **当前短期目标:** {本章或接下来几章内需要完成的明确小目标}
${generateOtherCharactersInfo(keyNPCs)}

## 3. 本章创作蓝图

### 3.1. 本章核心目标
- **主线推进:** {本章需要在主线剧情上达成的最重要进展}
- **角色塑造:** {本章希望突出主角或哪个NPC的什么性格特点或成长}
- **伏笔与铺垫:** {本章需要埋下的伏笔或为后续情节做的铺垫}

### 3.2. 本章禁忌/避免项
- **(可选) 信息控制:** {例如：不要揭示NPC A的真实意图；不要让主角发现"秘宝"的第二种用途}
- **(可选) 行为限制:** {例如：主角在本章不能杀人；避免与守卫发生正面冲突}

### 3.3. 本章剧情规划
- **结尾悬念设置（必填）:** {请选择一项：**设置悬念** | **不设置悬念**}
    - *(选择"设置悬念"，AI将在结尾创造一个钩子；选择"不设置悬念"，AI将以一个相对完整的段落收尾，给予阶段性的闭合感。)*
- **(可选) 剧情大纲（在情节复杂或需精确控场时使用）:**
    1.  **开端:** {剧情如何开始}
    2.  **发展:** {剧情如何发展}
    3.  **高潮:** {本章的高潮事件}
    4.  **结局:** {本章如何结尾}

### 3.4. 叙事自由度设置
- **叙事自由度:** {请选择：低 | 中 | 高}
  - *低：严格按计划，尽量不偏离既定大纲。*
  - *中：允许小幅偏移，可加入不影响主线的小插曲。*
  - *高：鼓励适度拓展，在合理范围内增加意料之外但精彩的情节。*
- **自由度限制:** {例如：不能改变主要NPC的核心动机；不能违背世界观设定；不能让主角直接获得关键信息}

---

# ----------------------------------------------------------------------
# 附录：项目实体信息
# (从故事管理应用自动生成，供参考)
# ----------------------------------------------------------------------

## 人物角色 (${characters.length}个)
${generateCharactersList(characters)}

## 物品道具 (${items.length}个)
${generateItemsList(items)}

## 势力组织 (${factions.length}个)
${generateFactionsList(factions)}

## 重要事件 (${events.length}个)
${generateEventsList(events)}

## 标签分类
${generateTagsList(tags)}

---
请开始创作。`;
  };

  // 辅助函数
  const extractPowerSystem = (project: Project, entities: Entity[]): string => {
    const powerSystemItems = entities.filter(e => 
      e.tags?.includes('力量体系') || 
      e.tags?.includes('魔法') ||
      e.tags?.includes('技能') ||
      e.type === 'item' && e.customFields?.isPowerRelated
    );
    
    if (powerSystemItems.length > 0) {
      return powerSystemItems.map(item => `${item.name}: ${item.description || '无描述'}`).join('; ');
    }
    
    return '{请在此填充力量体系的具体设定，如魔法、斗气、异能的等级、原理、表现形式等}';
  };

  const generateFactionsInfo = (factions: Entity[]): string => {
    if (factions.length === 0) {
      return '{请在此填充主要势力的简介、目标、相互关系等。例如：A势力与B势力为世仇；C势力表面中立，暗中倾向A。}';
    }
    
    return factions.map(faction => {
      const relationship = faction.customFields?.relationships || '';
      return `${faction.name}(${faction.description || '无描述'}${relationship ? '; ' + relationship : ''})`;
    }).join('; ');
  };

  const generateKeyNPCsInfo = (npcs: Entity[]): string => {
    if (npcs.length === 0) {
      return `    - **NPC 1:**
        - **姓名:** {NPC姓名}
        - **核心动机与背景:** {该NPC的深层秘密、背景故事和长期目标}
        - **与主角的核心关系:** {例如：导师、宿敌、挚友、利用与被利用}`;
    }
    
    return npcs.map((npc, index) => `    - **NPC ${index + 1}:**
        - **姓名:** ${npc.name}
        - **核心动机与背景:** ${npc.customFields?.motivation || npc.description || '{该NPC的深层秘密、背景故事和长期目标}'}
        - **与主角的核心关系:** ${npc.customFields?.relationshipWithProtagonist || '{例如：导师、宿敌、挚友、利用与被利用}'}`).join('\n');
  };

  const generateSkillsInfo = (character?: Entity): string => {
    if (!character?.customFields?.skills) {
      return '{例如：洞察之眼(熟练: 5/10), 火球术(入门: 2/10)}';
    }
    
    const skills = character.customFields.skills;
    if (typeof skills === 'string') {
      return skills;
    } else if (Array.isArray(skills)) {
      return skills.join(', ');
    } else if (typeof skills === 'object') {
      return Object.entries(skills).map(([skill, level]) => `${skill}(${level})`).join(', ');
    }
    
    return '{例如：洞察之眼(熟练: 5/10), 火球术(入门: 2/10)}';
  };

  const generateEquipmentInfo = (character?: Entity, items?: Entity[]): string => {
    const equipment = character?.customFields?.equipment || character?.customFields?.items;
    if (!equipment) {
      return '{例如：新手铁剑, 治疗药水(x2), 城主的信物(任务物品)}';
    }
    
    if (typeof equipment === 'string') {
      return equipment;
    } else if (Array.isArray(equipment)) {
      return equipment.join(', ');
    }
    
    return '{例如：新手铁剑, 治疗药水(x2), 城主的信物(任务物品)}';
  };

  const generateOtherCharactersInfo = (npcs: Entity[]): string => {
    if (npcs.length === 0) return '';
    
    return npcs.map(npc => `- **关键NPC: ${npc.name}**
    - **位置:** {当前位置}
    - **当前状态:** ${npc.description || '{NPC的当前状况、与主角关系变化、已知信息等}'}`).join('\n');
  };

  const generateCharactersList = (characters: Entity[]): string => {
    if (characters.length === 0) return '暂无人物角色';
    
    return characters.map(char => `### ${char.name}
- **类型:** 人物
- **描述:** ${char.description || '无描述'}
- **标签:** ${char.tags?.join(', ') || '无标签'}
- **详细信息:** ${JSON.stringify(char.customFields || {}, null, 2)}`).join('\n\n');
  };

  const generateItemsList = (items: Entity[]): string => {
    if (items.length === 0) return '暂无物品道具';
    
    return items.map(item => `### ${item.name}
- **类型:** 物品
- **描述:** ${item.description || '无描述'}
- **标签:** ${item.tags?.join(', ') || '无标签'}
- **详细信息:** ${JSON.stringify(item.customFields || {}, null, 2)}`).join('\n\n');
  };

  const generateFactionsList = (factions: Entity[]): string => {
    if (factions.length === 0) return '暂无势力组织';
    
    return factions.map(faction => `### ${faction.name}
- **类型:** 势力
- **描述:** ${faction.description || '无描述'}
- **标签:** ${faction.tags?.join(', ') || '无标签'}
- **详细信息:** ${JSON.stringify(faction.customFields || {}, null, 2)}`).join('\n\n');
  };

  const generateEventsList = (events: Entity[]): string => {
    if (events.length === 0) return '暂无重要事件';
    
    return events.map(event => `### ${event.name}
- **类型:** 事件
- **描述:** ${event.description || '无描述'}
- **标签:** ${event.tags?.join(', ') || '无标签'}
- **详细信息:** ${JSON.stringify(event.customFields || {}, null, 2)}`).join('\n\n');
  };

  const generateTagsList = (tags: Tag[]): string => {
    if (tags.length === 0) return '暂无标签';
    
    const tagsByCategory = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, Tag[]>);
    
    return Object.entries(tagsByCategory).map(([category, categoryTags]) => 
      `**${category}:** ${categoryTags.map(tag => tag.name).join(', ')}`
    ).join('\n');
  };

  if (!currentProjectId) {
    return (
      <div className="view-container">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">请选择项目</div>
          <div className="empty-state-description">
            选择一个项目来管理设置
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
    <div className="view-container project-settings">
      <div className="view-header">
        <h1 className="view-title">项目设置</h1>
        <p className="view-subtitle">配置项目基本信息和导出创作辅助文件</p>
        <div className="view-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleExportPrompt}
            disabled={exporting}
          >
            {exporting ? '导出中...' : '📄 导出Prompt'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '💾 保存设置'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
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
              className="input"
              value={project.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="简要描述这个项目"
              rows={3}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">世界观设定</h2>
          
          <div className="form-group">
            <label>世界观核心设定</label>
            <textarea
              className="input textarea large"
              value={project.worldSetting}
              onChange={(e) => handleInputChange('worldSetting', e.target.value)}
              placeholder="描述世界的基本规则、力量体系、地理环境、历史背景等"
              rows={8}
            />
            <div className="form-help">
              包括力量体系、核心势力、通用设定（货币、地理、历史、通讯方式等）
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">主角信息</h2>
          
          <div className="form-group">
            <label>主角长线信息</label>
            <textarea
              className="input textarea large"
              value={project.protagonistInfo}
              onChange={(e) => handleInputChange('protagonistInfo', e.target.value)}
              placeholder="描述主角的基本信息、性格特点、长期目标等"
              rows={6}
            />
            <div className="form-help">
              包括主角的姓名、性格、背景、长期目标等关键信息
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Prompt导出</h2>
          
          <div className="form-group">
            <label>创作辅助文件导出</label>
            <p className="form-help">
              将项目中的所有实体信息（人物、物品、势力、事件）整理成标准化的创作prompt文件，
              可用于AI辅助创作或作为创作参考资料。
            </p>
            <button 
              className="btn btn-primary"
              onClick={handleExportPrompt}
              disabled={exporting}
              style={{ marginTop: '12px' }}
            >
              {exporting ? '正在导出...' : '📄 导出完整Prompt文件'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;

