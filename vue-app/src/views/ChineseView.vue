<template>
  <div class="page-content chinese-page">
    <h1 class="page-title">📖 语文学习</h1>
    <p class="page-subtitle">部编版四年级下册 · 永远的神</p>
    
    <!-- 进度概览 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">📚</div>
          <div class="stat-value">{{ progressStore.subjects.chinese.completed }}/{{ progressStore.subjects.chinese.total }}</div>
          <div class="stat-label">单元进度</div>
          <el-progress :percentage="chinesePercent" :color="'#4ade80'" :stroke-width="8" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">✍️</div>
          <div class="stat-value">{{ completedLessons }}</div>
          <div class="stat-label">已完成课文</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">📝</div>
          <div class="stat-value">{{ completedPoems }}</div>
          <div class="stat-label">已背古诗词</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">{{ chinesePercent }}%</div>
          <div class="stat-label">总进度</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 单元列表 -->
    <el-card class="units-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>📋 单元学习</span>
          <el-tag type="success" effect="dark">部编版四下</el-tag>
        </div>
      </template>
      
      <el-collapse v-model="activeUnits" accordion>
        <el-collapse-item
          v-for="unit in units"
          :key="unit.id"
          :name="unit.id"
          class="unit-item"
        >
          <template #title>
            <div class="unit-title">
              <span class="unit-number">第{{ unit.id }}单元</span>
              <span class="unit-name">{{ unit.name }}</span>
              <el-tag :type="unit.completed ? 'success' : 'info'" size="small">
                {{ unit.completed ? '已完成' : '学习中' }}
              </el-tag>
            </div>
          </template>
          
          <div class="unit-content">
            <!-- 课文列表 -->
            <div class="section">
              <h4 class="section-title">
                <el-icon><Document /></el-icon>
                课文
              </h4>
              <el-checkbox-group v-model="unit.completedLessons">
                <el-checkbox
                  v-for="lesson in unit.lessons"
                  :key="lesson.id"
                  :label="lesson.id"
                  class="lesson-checkbox"
                >
                  {{ lesson.title }}
                  <el-tag v-if="lesson.type" size="small" :type="lesson.type === '精读' ? 'danger' : 'info'">
                    {{ lesson.type }}
                  </el-tag>
                </el-checkbox>
              </el-checkbox-group>
            </div>
            
            <!-- 古诗词 -->
            <div class="section" v-if="unit.poems?.length">
              <h4 class="section-title">
                <el-icon><Collection /></el-icon>
                古诗词
              </h4>
              <el-checkbox-group v-model="unit.completedPoems">
                <el-checkbox
                  v-for="poem in unit.poems"
                  :key="poem.id"
                  :label="poem.id"
                  class="poem-checkbox"
                >
                  《{{ poem.title }}》{{ poem.author }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            
            <!-- 习作 -->
            <div class="section" v-if="unit.writing">
              <h4 class="section-title">
                <el-icon><EditPen /></el-icon>
                习作
              </h4>
              <div class="writing-item">
                <span>{{ unit.writing.title }}</span>
                <el-button type="primary" size="small" text>
                  <el-icon><View /></el-icon>
                  查看范文
                </el-button>
              </div>
            </div>
            
            <!-- 生字表 -->
            <div class="section" v-if="unit.characters?.length">
              <h4 class="section-title">
                <el-icon><BrushFilled /></el-icon>
                生字表
              </h4>
              <div class="characters-grid">
                <el-tag
                  v-for="char in unit.characters"
                  :key="char"
                  class="character-tag"
                  effect="plain"
                >
                  {{ char }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProgressStore } from '../stores/progress'
import { Document, Collection, EditPen, View, BrushFilled } from '@element-plus/icons-vue'

const progressStore = useProgressStore()
const activeUnits = ref(['1'])

const chinesePercent = computed(() => {
  const { completed, total } = progressStore.subjects.chinese
  return Math.round((completed / total) * 100)
})

const completedLessons = computed(() => {
  return units.value.reduce((sum, u) => sum + (u.completedLessons?.length || 0), 0)
})

const completedPoems = computed(() => {
  return units.value.reduce((sum, u) => sum + (u.completedPoems?.length || 0), 0)
})

// 语文单元数据（部编版四年级下册）
const units = ref([
  {
    id: 1,
    name: '乡村生活',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '1-1', title: '古诗词三首', type: '精读' },
      { id: '1-2', title: '乡下人家', type: '精读' },
      { id: '1-3', title: '天窗', type: '精读' },
      { id: '1-4', title: '三月桃花水', type: '略读' }
    ],
    poems: [
      { id: 'p1-1', title: '四时田园杂兴（其二十五）', author: '[宋] 范成大' },
      { id: 'p1-2', title: '宿新市徐公店', author: '[宋] 杨万里' },
      { id: 'p1-3', title: '清平乐·村居', author: '[宋] 辛弃疾' }
    ],
    writing: { title: '我的乐园' },
    characters: ['构', '饰', '蹲', '凤', '序', '例', '率', '觅', '耸', '踏', '倘', '绘', '谐', '寄', '眠']
  },
  {
    id: 2,
    name: '科普知识',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '2-1', title: '琥珀', type: '精读' },
      { id: '2-2', title: '飞向蓝天的恐龙', type: '精读' },
      { id: '2-3', title: '纳米技术就在我们身边', type: '精读' },
      { id: '2-4', title: '千年梦圆在今朝', type: '略读' }
    ],
    poems: [],
    writing: { title: '我的奇思妙想' },
    characters: ['怒', '脂', '拭', '餐', '划', '晌', '辣', '渗', '挣', '番', '埋', '刷', '测', '详']
  },
  {
    id: 3,
    name: '现代诗歌',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '3-1', title: '短诗三首', type: '精读' },
      { id: '3-2', title: '绿', type: '精读' },
      { id: '3-3', title: '白桦', type: '精读' },
      { id: '3-4', title: '在天晴了的时候', type: '略读' }
    ],
    poems: [
      { id: 'p3-1', title: '繁星（七一）', author: '冰心' },
      { id: 'p3-2', title: '繁星（一三一）', author: '冰心' },
      { id: 'p3-3', title: '繁星（一五九）', author: '冰心' }
    ],
    writing: { title: '轻叩诗歌大门' },
    characters: ['繁', '漫', '灭', '藤', '萝', '膝', '涛', '躲', '瓶', '挤', '叉', '挥']
  },
  {
    id: 4,
    name: '动物朋友',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '4-1', title: '猫', type: '精读' },
      { id: '4-2', title: '母鸡', type: '精读' },
      { id: '4-3', title: '白鹅', type: '精读' }
    ],
    poems: [],
    writing: { title: '我的动物朋友' },
    characters: ['忧', '虑', '贪', '职', '屏', '蹭', '稿', '腔', '解', '闷', '蛇', '遭']
  },
  {
    id: 5,
    name: '按游览顺序写景物',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '5-1', title: '海上日出', type: '精读' },
      { id: '5-2', title: '记金华的双龙洞', type: '精读' },
      { id: '5-3', title: '颐和园', type: '略读' },
      { id: '5-4', title: '七月的天山', type: '略读' }
    ],
    poems: [
      { id: 'p5-1', title: '卜算子·咏梅', author: '毛泽东' }
    ],
    writing: { title: '游______' },
    characters: ['扩', '范', '努', '刹', '烂', '替', '镶', '紫', '仅', '浙', '罗', '杜']
  },
  {
    id: 6,
    name: '儿童成长',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '6-1', title: '小英雄雨来（节选）', type: '精读' },
      { id: '6-2', title: '我们家的男子汉', type: '略读' },
      { id: '6-3', title: '芦花鞋', type: '略读' }
    ],
    poems: [],
    writing: { title: '我学会了______' },
    characters: ['晋', '炕', '铅', '迈', '呜', '栓', '胳', '膊', '劫', '绸', '扒', '敌']
  },
  {
    id: 7,
    name: '人物品质',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '7-1', title: '古诗三首', type: '精读' },
      { id: '7-2', title: '黄继光', type: '精读' },
      { id: '7-3', title: '"诺曼底号"遇难记', type: '精读' },
      { id: '7-4', title: '挑山工', type: '略读' }
    ],
    poems: [
      { id: 'p7-1', title: '芙蓉楼送辛渐', author: '[唐] 王昌龄' },
      { id: 'p7-2', title: '塞下曲', author: '[唐] 卢纶' },
      { id: 'p7-3', title: '墨梅', author: '[元] 王冕' }
    ],
    writing: { title: '我的"自画像"' },
    characters: ['芙', '蓉', '洛', '壶', '雁', '砚', '乾', '坤', '伦', '腹', '剖', '窟']
  },
  {
    id: 8,
    name: '童话之美',
    completed: false,
    completedLessons: [],
    completedPoems: [],
    lessons: [
      { id: '8-1', title: '宝葫芦的秘密（节选）', type: '精读' },
      { id: '8-2', title: '巨人的花园', type: '精读' },
      { id: '8-3', title: '海的女儿', type: '略读' }
    ],
    poems: [],
    writing: { title: '故事新编' },
    characters: ['妖', '矩', '乖', '撵', '丫', '拽', '冲', '瘦', '罢', '葵', '瘦', '棒']
  }
])
</script>

<style scoped>
.chinese-page {
  max-width: 1200px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: var(--text2);
  margin-bottom: 24px;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--border2);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 12px;
}

.units-card {
  background: var(--surface);
  border: 1px solid var(--border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.unit-item {
  margin-bottom: 8px;
}

.unit-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.unit-number {
  font-weight: 700;
  color: var(--accent);
  min-width: 60px;
}

.unit-name {
  flex: 1;
  color: var(--text);
}

.unit-content {
  padding: 16px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}

.section {
  margin-bottom: 20px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 12px;
}

.lesson-checkbox,
.poem-checkbox {
  display: block;
  margin-bottom: 8px;
  color: var(--text);
}

.writing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--surface3);
  border-radius: var(--radius-xs);
  color: var(--text);
}

.characters-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.character-tag {
  font-size: 16px;
  padding: 8px 12px;
  background: var(--surface3);
  border-color: var(--border);
  color: var(--text);
}

:deep(.el-collapse-item__header) {
  background: var(--surface2);
  border-radius: var(--radius-sm);
  padding: 16px;
  font-size: 15px;
  color: var(--text);
  border: none;
}

:deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

:deep(.el-checkbox__label) {
  color: var(--text);
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--accent);
}
</style>
