const { getDB } = require('../db/database');
const path = require('path');
const fs = require('fs');

// 教学法：每个阶段的错题量和组织方式
const PEDAGOGY = {
  '天天清': {
    maxErrors: 8, groupBy: 'none', orderBy: 'error_date', orderDir: 'DESC',
    title: '🔴 天天清 · 错题订正',
    subtitle: '当天错题当天订正，搞清楚错在哪',
    instructions: ['📌 不看答案，自己先做一遍','📌 做完后对照正确答案批改','📌 还错的题，用"错题三步骤"分析','📌 能用自己的话讲清楚为什么错，才算过关'],
    timeLimit: '10-15分钟',
    description: '不分学科混合练习，训练大脑快速切换思维模式'
  },
  '周周清': {
    maxErrors: 20, groupBy: 'subject', orderBy: 'category', orderDir: 'ASC',
    title: '🟠 周周清 · 错题重练',
    subtitle: '本周错题重做一遍，检验是否真正掌握',
    instructions: ['📌 按学科依次完成，先语文、再数学、最后英语','📌 同一学科内题型混合——这才是真实的考试场景','📌 每题做完标记：✅ 会了 / ❌ 还不会','📌 还不会的题目，用费曼学习法讲一遍'],
    timeLimit: '30分钟',
    description: '同一学科内交错练习，避免"刚学完会做，过两天忘"'
  },
  '单元清': {
    maxErrors: 30, groupBy: 'unit', orderBy: 'category', orderDir: 'ASC',
    title: '🟡 单元清 · 知识巩固',
    subtitle: '按单元汇总错题，画出知识图谱',
    instructions: ['📌 做完后，对照"知识树"找到对应的知识点位置','📌 同一单元的错题放在一起看——找出规律','📌 用费曼学习法把整个单元的知识讲一遍','📌 能画出本单元的知识框架图，才算真正掌握'],
    timeLimit: '45-60分钟',
    description: '跨题找规律，发现知识漏洞的根源'
  },
  '期中清': {
    maxErrors: 40, groupBy: 'subject', orderBy: 'mastery', orderDir: 'ASC',
    title: '🔵 期中清 · 期中复习',
    subtitle: '前半学期错题全面过一遍',
    instructions: ['📌 先做标记为"未掌握"的题——这才是你的薄弱点','📌 已掌握的快速过一遍即可','📌 每道题都盖住答案先主动回忆','📌 分类归纳：把你最容易错的类型找出来'],
    timeLimit: '分2-3天完成',
    description: '重点关注"未掌握"部分，已掌握快速过'
  },
  '期末清': {
    maxErrors: 50, groupBy: 'subject', orderBy: 'mastery', orderDir: 'ASC',
    title: '🟢 期末清 · 期末冲刺',
    subtitle: '全学期错题终极扫荡',
    instructions: ['📌 未掌握的题目放在最前面，重点攻克','📌 已掌握的快速验证，正确即可跳过','📌 顽固错题（反复错的）用画图法重新理解','📌 全部做完后，回顾你的成长——错题越来越少'],
    timeLimit: '分1周完成',
    description: '终极冲刺，全部清零'
  }
};

// ===== 不同练习类型的显示模式 =====
const DISPLAY_MODES = {
  '字词默写': {
    icon: '✍️', label: '看句子，填字词',
    instruction: '请根据上下文，在（ ）中填入正确的字词：',
  },
  '词语搭配': {
    icon: '🔗', label: '词语搭配填空',
    instruction: '请选择或填写正确的词语搭配：',
  },
  '修改病句': {
    icon: '🔧', label: '修改病句',
    instruction: '下面的句子有问题，请找出问题并修改：',
  },
  '标点符号': {
    icon: '🔖', label: '标点符号练习',
    instruction: '请在 ___ 处填入正确的标点符号：',
  },
  '几何画图': {
    icon: '📐', label: '几何画图练习',
    instruction: '请画出图形并在图上标注已知条件，然后求解：',
  },
  '概念理解': {
    icon: '💡', label: '概念理解',
    instruction: '请回答下列问题：',
  },
  '通用': {
    icon: '📝', label: '练习题',
    instruction: '请完成下面这道题：',
  }
};

// 根据 practice_type 生成练习题展示内容
function buildExerciseDisplay(err) {
  const mode = DISPLAY_MODES[err.practice_type] || DISPLAY_MODES['通用'];
  const source = err.source_text || err.error_text || '';

  let exerciseText = '';
  let exerciseHint = '';

  if ((err.practice_type === '字词默写' || err.practice_type === '词语搭配') && source && err.correct_text) {
    // 把正确的词替换成（    ）
    exerciseText = source.replace(err.correct_text, '（    ）');
    exerciseHint = `提示：你上次写成了「${err.student_answer || '？'}」`;
  }
  else if (err.practice_type === '修改病句') {
    exerciseText = err.error_text || source;
    exerciseHint = '找到句子中的问题并修改';
  }
  else if (err.practice_type === '标点符号') {
    // 展示去掉标点的版本
    exerciseText = (source || '').replace(/[，。！？、""''：；（）\u3000-\u303f\uff00-\uffef]/g, '___');
  }
  else {
    exerciseText = err.error_text || source;
  }

  return { mode, exerciseText, exerciseHint };
}

// 获取教学法组织的错题
// 遮住标题中的正确答案（练习时不暴露答案）
function displayTitle(err) {
  if (!err || !err.title) return "";
  if ((err.practice_type === "字词默写" || err.practice_type === "词语搭配") && err.correct_text) {
    return err.title.replace(err.correct_text, "（    ）");
  }
  return err.title;
}
function getPaperData(phase) {
  const db = getDB();
  const ped = PEDAGOGY[phase] || PEDAGOGY['天天清'];

  let errors = db.prepare(`SELECT * FROM errors WHERE phase = ? ORDER BY ${ped.orderBy} ${ped.orderDir}`).all(phase);

  if (errors.length > ped.maxErrors) {
    errors = errors.slice(0, ped.maxErrors);
  }

  // 为每条错题生成练习展示
  const enhancedErrors = errors.map(e => ({
    ...e, display: buildExerciseDisplay(e)
  }));

  let groups = [];
  if (ped.groupBy === 'none') {
    groups = [{ name: '混合练习', errors: enhancedErrors }];
  } else if (ped.groupBy === 'subject') {
    const subjectOrder = ['语文', '数学', '英语'];
    const grouped = {};
    enhancedErrors.forEach(e => {
      if (!grouped[e.subject]) grouped[e.subject] = [];
      grouped[e.subject].push(e);
    });
    subjectOrder.forEach(s => { if (grouped[s]) groups.push({ name: s, errors: grouped[s] }); });
  } else if (ped.groupBy === 'unit') {
    const grouped = {};
    enhancedErrors.forEach(e => {
      const u = e.unit || '其他';
      if (!grouped[u]) grouped[u] = [];
      grouped[u].push(e);
    });
    Object.keys(grouped).sort().forEach(u => groups.push({ name: u, errors: grouped[u] }));
  }

  return {
    phase,
    pedagogy: ped,
    totalErrors: errors.length,
    groups,
    generatedAt: new Date().toISOString()
  };
}

const ctrl = {
  // API: 获取结构化错题数据
  getPaper: (req, res) => {
    try {
      const { phase = '天天清' } = req.query;
      res.json(getPaperData(phase));
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  },

  // 生成 Word 文档
  downloadDocx: async (req, res) => {
    try {
      const { phase = '天天清' } = req.query;
      const data = getPaperData(phase);

      const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');

      const children = [];

      // 封面
      children.push(new Paragraph({ spacing: { before: 3000 } }));
      children.push(new Paragraph({
        children: [new TextRun({ text: data.pedagogy.title, bold: true, size: 36, color: '111827' })],
        alignment: AlignmentType.CENTER, spacing: { after: 100 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: data.pedagogy.subtitle, size: 24, color: '6b7280' })],
        alignment: AlignmentType.CENTER, spacing: { after: 200 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `共 ${data.totalErrors} 题 · ${data.pedagogy.timeLimit}`, size: 20, color: '999999' })],
        alignment: AlignmentType.CENTER, spacing: { after: 200 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `生成时间：${new Date().toLocaleString('zh-CN')}`, size: 18, color: 'bbbbbb' })],
        alignment: AlignmentType.CENTER, spacing: { after: 400 }
      }));

      // 使用说明
      children.push(new Paragraph({
        children: [new TextRun({ text: '📋 使用说明', bold: true, size: 22, color: '4f46e5' })],
        spacing: { after: 100 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: data.pedagogy.description, size: 18, color: '6b7280' })],
        spacing: { after: 80 }
      }));
      data.pedagogy.instructions.forEach(inst => {
        children.push(new Paragraph({
          children: [new TextRun({ text: inst, size: 18, color: '4b5563' })],
          spacing: { after: 40 }
        }));
      });

      // 分隔
      children.push(new Paragraph({
        children: [new TextRun({ text: '─'.repeat(60), size: 16, color: 'cccccc' })],
        alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 }
      }));

      // === 练习题 ===
      let num = 0;
      data.groups.forEach(group => {
        // 组标题
        if (group.name !== '混合练习') {
          children.push(new Paragraph({
            children: [new TextRun({ text: `📚 ${group.name}`, bold: true, size: 24, color: '374151' })],
            spacing: { before: 300, after: 100 }
          }));
        }

        group.errors.forEach(err => {
          const display = buildExerciseDisplay(err);
          const mode = display.mode;
          num++;

          // 题号
          children.push(new Paragraph({
            children: [new TextRun({ text: `第${num}题`, bold: true, size: 22, color: '333333' })],
            spacing: { before: 300, after: 40 }
          }));

          // 题型标签
          children.push(new Paragraph({
            children: [new TextRun({ text: `${mode.icon} ${mode.label}`, size: 18, color: '6b7280' })],
            spacing: { after: 40 }
          }));

          // 标签
          const tags = [];
          if (err.subject) tags.push(err.subject);
          if (err.category) tags.push(err.category);
          if (err.error_reason) tags.push(err.error_reason);
          children.push(new Paragraph({
            children: [new TextRun({ text: tags.join(' | '), size: 18, color: '999999' })],
            spacing: { after: 80 }
          }));

          // 练习指令
          children.push(new Paragraph({
            children: [new TextRun({ text: mode.instruction, bold: true, size: 20, color: '4f46e5' })],
            spacing: { after: 100 }
          }));

          // === 不同类型的练习题内容 ===
          if (err.practice_type === '字词默写' || err.practice_type === '词语搭配') {
            // 填空模式：展示带（ ）的句子
            if (display.exerciseText) {
              children.push(new Paragraph({
                children: [new TextRun({ text: `📄 ${display.exerciseText}`, size: 20, color: '111827' })],
                spacing: { after: 60 }
              }));
            }
            if (display.exerciseHint) {
              children.push(new Paragraph({
                children: [new TextRun({ text: display.exerciseHint, size: 18, color: '9ca3af' })],
                spacing: { after: 60 }
              }));
            }
          } else if (err.practice_type === '标点符号') {
            if (display.exerciseText) {
              children.push(new Paragraph({
                children: [new TextRun({ text: `📄 ${display.exerciseText}`, size: 20, color: '111827' })],
                spacing: { after: 60 }
              }));
            }
          } else {
            if (err.error_text) {
              children.push(new Paragraph({
                children: [new TextRun({ text: `📝 原文：${err.error_text}`, size: 20, color: '444444' })],
                spacing: { after: 60 }
              }));
            }
            if (err.student_answer) {
              children.push(new Paragraph({
                children: [new TextRun({ text: `❌ 你写成了：${err.student_answer}`, size: 20, color: 'ef4444' })],
                spacing: { after: 60 }
              }));
            }
          }

          // 留白区（打印出来手写用）
          children.push(new Paragraph({
            spacing: { before: 0, after: 400 }
          }));
        });
      });

      // === 参考答案（单独附在最后） ===
      children.push(new Paragraph({
        children: [new TextRun({ text: '─'.repeat(60), size: 16, color: 'cccccc' })],
        alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: '📖 参考答案', bold: true, size: 28, color: '4ade80' })],
        alignment: AlignmentType.CENTER, spacing: { after: 200 }
      }));

      num = 0;
      data.groups.forEach(group => {
        group.errors.forEach(err => {
          num++;
          children.push(new Paragraph({
            children: [new TextRun({ text: `第${num}题`, bold: true, size: 20, color: '333333' })],
            spacing: { before: 200, after: 60 }
          }));

          // 题目名称
          children.push(new Paragraph({
            children: [new TextRun({ text: displayTitle(err), size: 18, color: '6b7280' })],
            spacing: { after: 40 }
          }));

          // 学生错误答案
          if (err.student_answer) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: '❌ 你写成了：', bold: true, size: 20, color: 'ef4444' }),
                new TextRun({ text: err.student_answer, size: 20, color: 'dc2626' })
              ], spacing: { after: 40 }
            }));
          }
          // 正确答案
          if (err.correct_text) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: '✅ 正确答案：', bold: true, size: 20, color: '16a34a' }),
                new TextRun({ text: err.correct_text, size: 20, color: '333333' })
              ], spacing: { after: 40 }
            }));
          }
          // 解析
          if (err.analysis) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: '💡 解析：', bold: true, size: 20, color: '818cf8' }),
                new TextRun({ text: err.analysis, size: 20, color: '555555' })
              ], spacing: { after: 40 }
            }));
          }
          if (err.error_reason) {
            children.push(new Paragraph({
              children: [new TextRun({ text: `❌ 错误原因：${err.error_reason}`, size: 18, color: '999999' })],
              spacing: { after: 80 }
            }));
          }
        });
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
          },
          children
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = encodeURIComponent(`错题重练_${phase}_${new Date().toISOString().slice(0, 10)}.docx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch(e) {
      console.error('生成文档失败:', e);
      res.status(500).json({ error: e.message });
    }
  }
};

module.exports = ctrl;
