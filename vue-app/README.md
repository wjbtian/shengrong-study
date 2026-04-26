# 尚融成长 - Vue 3 重构版

## 技术栈
- Vue 3 (Composition API)
- Vue Router 4
- Pinia
- Vite

## 项目结构
```
vue-app/
├── index.html          # 入口 HTML
├── vite.config.js      # Vite 配置
├── package.json
└── src/
    ├── main.js         # 应用入口
    ├── App.vue         # 根组件
    ├── router/         # 路由配置
    │   └── index.js
    ├── stores/         # Pinia 状态管理
    ├── components/     # 公共组件
    │   ├── SideNav.vue
    │   └── PlaceholderView.vue
    ├── views/          # 页面视图
    │   ├── HomeView.vue
    │   ├── DiaryView.vue
    │   └── ...
    ├── composables/    # 组合式函数
    │   └── useData.js
    └── utils/          # 工具函数
        └── api.js
```

## 开发
```bash
cd vue-app
npm install
npm run dev
```

## 构建
```bash
npm run build
# 输出到 client/dist/
```

## 部署
本地部署：
```bash
npm run build
cd ../server
npm start
# 访问 http://localhost:3200
```
