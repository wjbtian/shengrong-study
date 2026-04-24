# 任务摘要：学习页面时间轴/鱼骨图重构

**时间**: 2026-04-25 07:00 CST
**目标**: 将学习页面从单调的单元列表改为时间轴/鱼骨图形式，点击展开显示重点内容

## 完成内容

### 1. 页面结构重构
- **语文/数学/英语**: 改为时间轴布局，单元左右交替排列
- **奥数**: 改为鱼骨图，七大专题分类展示

### 2. 交互设计
- 点击单元卡片展开详情，显示重点内容列表
- 再次点击收起
- 自动收起其他已展开项
- 展开后平滑滚动到可视区域

### 3. 数据内容
- 每个单元配置4个重点知识点
- 奥数每个专题包含：描述、解题方法、典型例题
- 7大专题：基础应用题、生活应用题、数量关系、行程问题、经典趣题、分数与比例、几何专题

### 4. 样式设计
- 时间轴中间渐变线条，圆点标记
- 完成状态绿色高亮
- 鱼骨图主干+分支结构
- 响应式适配（移动端单列）
- 展开动画 slideDown

### 5. 文件修改
- `client/pages/chinese.html` - 时间轴结构
- `client/pages/math.html` - 时间轴结构
- `client/pages/english.html` - 时间轴结构
- `client/pages/olympiad.html` - 鱼骨图结构
- `client/app.js` - 重写 loadSubjectData, 新增 loadOlympiadData
- `client/style.css` - 新增时间轴和鱼骨图样式
- `client/index.html` - 版本号 v=9

## 技术细节
- 科目配置提取为全局常量 SUBJECT_CONFIG
- 奥数配置提取为 OLYMPIAD_CONFIG
- 新增 toggleUnitDetail() 和 toggleOlympiadDetail() 函数
- 移动端时间轴改为左对齐单列

## Git
- Commit: 17b5d85
- Pushed to: wjbtian/shengrong-study main
