# 个人记账应用

基于 React + Vite + TypeScript + Tailwind 的本地记账 Web 应用。

## 环境要求

- Node.js 18+（推荐 22，见 `.nvmrc`）

```bash
nvm use   # 或手动切换到 Node 22
npm install
npm run dev
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | Oxlint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm test` | Vitest 单测 |

## 路由

- `/` — 今日流水
- `/stats` — 月统计
- `/records/new` — 新建记录
- `/records/:id/edit` — 编辑记录
