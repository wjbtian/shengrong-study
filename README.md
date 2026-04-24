# 🌱 吴尚融的星球

> 一个为 10 岁小学生打造的个人成长记录网站

## ✨ 项目介绍

这是吴尚融（四年级）的个人成长网站，用于记录学习、生活、兴趣爱好的点点滴滴。通过每日记录与正能量反馈，培养积极向上的成长心态。

**在线访问：** https://wjbtian.github.io/shengrong-study/

## 🚀 功能模块

| 模块 | 说明 | 状态 |
|------|------|------|
| 🏠 首页 | 每日成长轨迹、能量值、快速入口、今日任务 | ✅ |
| 📝 日记 | 记录每日心情与感悟，支持表情选择 | ✅ |
| 📖 语文 | 语文学习进度跟踪 | ✅ |
| 🔢 数学 | 数学学习进度跟踪 | ✅ |
| 🔤 英语 | 英语学习进度跟踪 | ✅ |
| 🧮 奥数 | 奥数挑战与进度跟踪 | ✅ |
| 🎸 吉他 | 吉他练习视频上传、时间轴、音频分析 | ✅ |
| ✨ 闪光时刻 | 精彩瞬间记录，支持图片上传 | ✅ |
| 🔬 科技探索 | 科技新闻收藏、每日推荐、分类浏览 | ✅ |

## 🛠 技术栈

- **前端：** HTML5 + CSS3 + Vanilla JavaScript
- **后端：** Node.js + Express
- **数据库：** SQLite (sql.js 内存模式)
- **部署：** GitHub Pages (前端) + 本地服务器 (后端)

## 📁 项目结构

```
shengrong-app/
├── client/              # 前端文件
│   ├── index.html       # 首页
│   ├── diary.html       # 日记
│   ├── chinese.html     # 语文
│   ├── math.html        # 数学
│   ├── english.html     # 英语
│   ├── olympiad.html    # 奥数
│   ├── guitar.html      # 吉他
│   ├── shine.html       # 闪光时刻
│   ├── tech.html        # 科技探索
│   ├── style.css        # 全局样式
│   └── app.js           # 全局脚本
├── server/              # 后端文件
│   ├── index.js         # Express 主入口
│   ├── db/              # 数据库
│   └── uploads/         # 上传文件
├── package.json         # 项目配置
├── start.sh             # 启动脚本
└── restart.sh           # 重启脚本
```

## 🚀 本地启动

```bash
# 安装依赖
npm install

# 启动服务器
./start.sh
# 或
node server/index.js

# 访问
open http://localhost:3200
```

## 📝 更新日志

### 2026-04-24
- ✅ 拆分为独立页面（9个 HTML 文件）
- ✅ 首页大改版：深色极简风格 + 每日成长轨迹
- ✅ 学习页面拆分：语文/数学/英语/奥数
- ✅ 吉他练习：视频上传 + 时间轴 + 音频分析
- ✅ 科技探索：20条新闻库 + 收藏 + 每日推荐

### 2026-04-23
- ✅ 项目初始化
- ✅ 基础功能：日记、闪光时刻、学习跟踪

## 👨‍💻 开发

```bash
# 克隆项目
git clone https://github.com/wjbtian/shengrong-study.git

# 进入目录
cd shengrong-study

# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 📄 许可证

MIT License - 为吴尚融专属定制

---

> 🌱 每一天都在成长，每一刻都值得记录
