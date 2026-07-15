const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'data');

router.get('/tree/:subject', (req, res) => {
  const { subject } = req.params;
  const files = {
    chinese: 'knowledge-tree-chinese.json',
    math: 'knowledge-tree-math.json',
    english: 'knowledge-tree-english.json'
  };
  const file = files[subject];
  if (!file) return res.status(404).json({ error: '未知学科' });
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: '知识树数据未找到' });
  try {
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tree', (req, res) => {
  try {
    const result = {};
    const files = {
      chinese: 'knowledge-tree-chinese.json',
      math: 'knowledge-tree-math.json',
      english: 'knowledge-tree-english.json'
    };
    for (const [key, file] of Object.entries(files)) {
      const filePath = path.join(DATA_DIR, file);
      if (fs.existsSync(filePath)) {
        result[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // 只返回概览，不返回详细内容
        result[key] = {
          subject: result[key].subject,
          title: result[key].title,
          publisher: result[key].publisher,
          units: result[key].units.map(u => ({
            id: u.id,
            title: u.title,
            subtitle: u.subtitle,
            objectives: u.objectives,
            core_concepts: u.core_concepts,
            lessons: u.lessons ? u.lessons.map(l => ({ num: l.num, title: l.title, type: l.type })) : (u.topics ? u.topics.map(t => ({ id: t.id, name: t.name, type: t.type, level: t.level })) : [])
          }))
        };
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 学习方法建议
router.get('/methods', (req, res) => {
  res.json({
    system: {
    name: '一生一案 · 五阶复习闭环',
    desc: '从天天清到期末清，每一阶段的复习重点和方法都不一样',
    phases: [
      { name: '🔴 天天清', time: '每天做完作业后', duration: '10-15分钟', desc: '当天错题当天订正', focus: '快速订正，搞清楚错在哪', method: '错题三步骤：找出错在哪→写下正确解法→总结一句话教训', verify: '能用自己的话讲清楚为什么错', view_filter: '当前阶段=天天清待订正' },
      { name: '🟠 周周清', time: '每周六/日', duration: '30分钟', desc: '本周错题重做一遍', focus: '检验是否真正掌握', method: '交错练习：语文数学英语混着做，让大脑切换', verify: '重做正确率≥80%', view_filter: '当前阶段=周周清待重练' },
      { name: '🟡 单元清', time: '每单元学完后', duration: '45-60分钟', desc: '按单元汇总错题，画知识图谱', focus: '找出知识漏洞的规律', method: '费曼学习法：把整个单元的知识讲一遍', verify: '能完整说出本单元知识框架', view_filter: '当前阶段=单元清待巩固' },
      { name: '🔵 期中清', time: '期中考试前1周', duration: '集中2-3天', desc: '前半学期错题全面过一遍', focus: '分类归纳薄弱点', method: '主动回忆：盖住答案回忆，想不起来的重点标记', verify: '前半学期知识点全部复习到位', view_filter: '当前阶段=期中清待复习' },
      { name: '🟢 期末清', time: '期末考试前2周', duration: '集中1周', desc: '全学期错题终极扫荡', focus: '顽固错题重点攻克', method: '画图法+交错练习：综合运用', verify: '所有错题掌握程度=已掌握', view_filter: '当前阶段=期末清待冲刺' }
    ]
  },
  general: [
      { name: '费曼学习法', desc: '用自己的话把学到的知识讲出来，讲不通就是没真懂', steps: ['选择一个概念', '教给一个不懂的人（或假装教）', '发现卡壳——这是你薄弱的地方', '回去重新学，简化语言'], emoji: '🎙️' },
      { name: '间隔重复（Spaced Repetition）', desc: '根据遗忘曲线，在最容易忘记的时候复习', steps: ['学完后1天第一次复习', '3天后第二次', '7天后第三次', '15天后第四次', '30天后第五次'], emoji: '🔄' },
      { name: '主动回忆（Active Recall）', desc: '不要光看，要合上书回忆——这才是真正的学习', steps: ['看完一页/一段后合上书', '在心里默念刚才讲了什么', '对照检查遗漏', '重点复习遗漏部分'], emoji: '🧠' },
      { name: '交错练习（Interleaving）', desc: '不要只练一种题型，混合训练效果更好', steps: ['把不同类型的题目混在一起做', '让大脑学会"分辨"题型', '考试时更容易调用正确的知识'], emoji: '🎯' },
      { name: '画图法', desc: '把抽象问题变成图形，让思路清晰可见', steps: ['读题后先画出示意图', '标出已知条件和未知条件', '在图中找出数量关系', '看着图列式解答'], emoji: '📐' }
    ],
    chinese: [
      { name: '每天15分钟朗读', desc: '大声朗读课文，培养语感，发现不通顺的地方', frequency: '每天', emoji: '📖' },
      { name: '听写训练', desc: '每天听写5个生词+2个句子，重点听写之前错过的词', frequency: '每天', emoji: '✍️' },
      { name: '作文"三遍法"', desc: '写完第一遍→读一遍改通顺→放一放再读一遍改精彩', frequency: '每次习作', emoji: '📝' },
      { name: '古诗"三读法"', desc: '一读通顺→二读理解→三读背诵，每次5分钟', frequency: '每周3次', emoji: '📜' }
    ],
    math: [
      { name: '画图解题法', desc: '几何题画图、应用题画线段图、分数问题画示意图', frequency: '每次做题', emoji: '📐' },
      { name: '计算本', desc: '准备一本专门的计算练习本，每天5道计算题', frequency: '每天', emoji: '🧮' },
      { name: '错题诊断三步', desc: '找出错在哪里→写下正确解法→总结一句话教训', frequency: '每次错题', emoji: '🔍' },
      { name: '公式卡片', desc: '把面积公式写在卡片上，随身携带随时看', frequency: '每周复习', emoji: '💳' }
    ],
    english: [
      { name: '磨耳朵', desc: '每天听课文录音15分钟，不看书听→看书写找→合上跟读', frequency: '每天', emoji: '🎧' },
      { name: '单词卡片法', desc: '一面写英文一面写中文，会的放一边不会的留另一边', frequency: '每天10个', emoji: '🔤' },
      { name: '句型替换练习', desc: '用学过的单词替换句型中的成分，造出10个新句子', frequency: '每课', emoji: '🔄' },
      { name: '英语日记', desc: '每天写2-3句话的英文日记，用学过的句型', frequency: '每天', emoji: '📔' }
    ]
  });
});

module.exports = router;
