# 个人记账应用 — 技术设计文档

**文档版本：** v1.0  
**状态：** 草案  
**日期：** 2026-07-21  
**依据：** [PRD.md](./PRD.md)

---

## 1. 设计目标与范围

### 1.1 目标

将 PRD 中的 MVP 落地为可维护的前端静态应用：无后端、无登录、数据仅存浏览器本地，支持响应式「今日流水 + 记一笔 + 月统计」。

### 1.2 范围（MVP）

| 包含 | 不包含 |
|------|--------|
| CRUD 收支记录 | 登录 / 云同步 |
| 预设分类 | 自定义分类 |
| 按日流水 + 日/月汇总 | 搜索 / 筛选（v1.1） |
| 支出分类占比（CSS 条形） | 导出导入（v1.2）、PWA（v1.3） |
| localStorage 持久化 | IndexedDB、多币种 |

### 1.3 设计原则

1. **UI 不直接碰存储**：页面只调 store / service，由 storage 层读写 localStorage。
2. **汇总用纯函数**：按日/按月过滤与合计可单测，不绑 React。
3. **金额用「分」存储**：避免浮点误差；展示层再转成元。
4. **YAGNI**：不为后续版本预埋复杂抽象，但预留清晰扩展点（导出、自定义分类）。

---

## 2. 技术选型

| 层级 | 选型 | 说明 |
|------|------|------|
| 构建 | Vite 6.x | 静态 SPA，部署简单 |
| 语言 | TypeScript（strict） | 类型约束记录与校验 |
| UI | React 19 + React Router 7 | 今日 / 统计 / 表单路由 |
| 样式 | Tailwind CSS 4 | 响应式与统一间距 |
| 状态 | Zustand | 轻量；持久化中间件可选，本设计用显式 storage 更清晰 |
| 持久化 | `localStorage` | 封装为 storage 模块 |
| 图表 | 纯 CSS 横向进度条 | MVP 不引入 Recharts |
| 测试 | Vitest | 纯函数与 storage 单测 |
| 质量 | ESLint + Prettier | 与 Vite 模板对齐 |

**不采用：** Next.js（无 SSR/账号需求）、Redux、IndexedDB（MVP 数据量小）。

---

## 3. 系统架构

### 3.1 总体架构

```text
┌─────────────────────────────────────────────┐
│                 Presentation                │
│  Pages: Today / Stats / RecordForm          │
│  Components: SummaryBar, RecordList, ...    │
└───────────────────┬─────────────────────────┘
                    │ hooks / selectors
┌───────────────────▼─────────────────────────┐
│              Application State              │
│  Zustand store: records CRUD + UI 临时态    │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Domain / Lib  │       │   Storage     │
│ validate      │       │ load / save   │
│ aggregate     │       │ 错误映射      │
│ format / date │       │ localStorage  │
└───────────────┘       └───────────────┘
```

- **无后端、无 API 层**：所有数据流在客户端闭环。
- **启动流程：** `loadRecords()` → hydrate store → 渲染路由。

### 3.2 关键数据流

**新增 / 编辑**

```text
表单提交 → validateRecordInput
        → store.add / update（生成 id、时间戳）
        → storage.save(records)
        → 失败则回滚内存并 toast 错误
        → 成功则导航回今日（或对应日期）
```

**删除**

```text
确认对话框 → store.remove → storage.save → 更新列表
```

**日/月汇总**

```text
selectedDate / selectedMonth + records
  → filterByDay / filterByMonth（纯函数）
  → sumByType / groupByCategory（纯函数）
  → 组件只负责展示
```

---

## 4. 目录结构

建议项目根目录：`BookKeeping/app/`（或 `BookKeeping/web/`），与文档目录分离。

```text
app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                 # Tailwind 入口 + CSS 变量
│   ├── routes/
│   │   └── index.tsx             # 路由表
│   ├── pages/
│   │   ├── TodayPage.tsx
│   │   ├── StatsPage.tsx
│   │   └── RecordFormPage.tsx    # 新建 + 编辑共用
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # 限宽容器 + 底栏导航
│   │   │   └── BottomNav.tsx
│   │   ├── records/
│   │   │   ├── RecordList.tsx
│   │   │   ├── RecordItem.tsx
│   │   │   └── DaySummary.tsx
│   │   ├── stats/
│   │   │   ├── MonthSummary.tsx
│   │   │   └── CategoryBars.tsx
│   │   ├── form/
│   │   │   └── RecordForm.tsx
│   │   └── ui/                   # Button, Toast, ConfirmDialog, EmptyState
│   ├── store/
│   │   └── recordsStore.ts
│   ├── domain/
│   │   ├── types.ts
│   │   ├── categories.ts         # 预设分类常量
│   │   ├── validate.ts
│   │   ├── aggregate.ts          # 过滤与汇总
│   │   ├── money.ts              # 分 ↔ 元、格式化
│   │   └── date.ts               # YYYY-MM-DD、月份加减
│   ├── storage/
│   │   ├── keys.ts
│   │   └── recordsStorage.ts
│   └── lib/
│       └── id.ts                 # crypto.randomUUID 或兜底
└── src/domain/__tests__/         # Vitest
```

---

## 5. 数据模型

### 5.1 领域类型

```ts
/** 收支类型 */
export type RecordType = 'income' | 'expense';

/** 持久化的一条记账（金额单位：分） */
export interface LedgerRecord {
  id: string;
  type: RecordType;
  amountCents: number;       // 整数，> 0
  categoryId: string;        // 对应 categories 中的 id
  date: string;              // YYYY-MM-DD
  note: string;              // 可为空串，最长 100
  createdAt: string;         // ISO-8601
  updatedAt: string;         // ISO-8601
}

/** 表单输入（金额用元字符串，便于受控输入） */
export interface RecordFormInput {
  type: RecordType;
  amountYuan: string;        // 用户输入，如 "12.50"
  categoryId: string;
  date: string;
  note: string;
}

export interface Category {
  id: string;
  name: string;
  type: RecordType;
}

export interface DaySummary {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;      // income - expense
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  amountCents: number;
  ratio: number;             // 0–1，相对当月该类总和（支出或收入侧）
}
```

### 5.2 预设分类

```ts
// domain/categories.ts（示例 id）
export const CATEGORIES: Category[] = [
  // expense
  { id: 'exp-food', name: '餐饮', type: 'expense' },
  { id: 'exp-transport', name: '交通', type: 'expense' },
  { id: 'exp-shopping', name: '购物', type: 'expense' },
  { id: 'exp-housing', name: '居住', type: 'expense' },
  { id: 'exp-entertainment', name: '娱乐', type: 'expense' },
  { id: 'exp-medical', name: '医疗', type: 'expense' },
  { id: 'exp-education', name: '教育', type: 'expense' },
  { id: 'exp-other', name: '其他', type: 'expense' },
  // income
  { id: 'inc-salary', name: '工资', type: 'income' },
  { id: 'inc-parttime', name: '兼职', type: 'income' },
  { id: 'inc-gift', name: '红包', type: 'income' },
  { id: 'inc-invest', name: '投资', type: 'income' },
  { id: 'inc-other', name: '其他', type: 'income' },
];

export function categoriesForType(type: RecordType): Category[] {
  return CATEGORIES.filter((c) => c.type === type);
}
```

### 5.3 与 PRD 字段映射

| PRD 字段 | 实现字段 | 备注 |
|----------|----------|------|
| amount（元） | `amountCents` | 存储分；展示 `formatYuan` |
| category | `categoryId` | 展示时查 `CATEGORIES` |
| type / date / note / id / timestamps | 同名或如上 | — |

### 5.4 持久化 Schema

```ts
interface StoredPayload {
  version: 1;
  records: LedgerRecord[];
}
```

- **Storage key：** `bookkeeping.records.v1`
- **版本字段：** 便于日后迁移；MVP 仅支持 `version: 1`
- **读写：** JSON.stringify / parse；parse 失败视为空数据并提示（见 §8）

---

## 6. 模块设计

### 6.1 `money.ts`

| 函数 | 行为 |
|------|------|
| `yuanToCents(yuan: string): number \| null` | 合法则返回整数分；非法返回 null |
| `centsToYuanNumber(cents: number): number` | 分转元数值 |
| `formatYuan(cents: number): string` | 如 `¥12.50`；支出/收入颜色由 UI 决定 |

金额规则（与校验一致）：

- 必须匹配 `/^\d+(\.\d{1,2})?$/`（不允许前导杂字符、不允许负号）
- 转分后 `amountCents > 0`
- 不允许空、仅小数点等

### 6.2 `validate.ts`

```ts
export type ValidationResult =
  | { ok: true; record: Omit<LedgerRecord, 'id' | 'createdAt' | 'updatedAt'> }
  | { ok: false; fieldErrors: Partial<Record<keyof RecordFormInput, string>> };

export function validateRecordInput(input: RecordFormInput): ValidationResult;
```

校验要点：

- `type` 合法
- `amountYuan` → cents > 0
- `categoryId` 存在且 `category.type === input.type`
- `date` 匹配 `YYYY-MM-DD` 且为有效日历日
- `note.length <= 100`

### 6.3 `aggregate.ts`

| 函数 | 说明 |
|------|------|
| `filterByDate(records, date)` | 当日记录 |
| `filterByMonth(records, yearMonth)` | `yearMonth` 形如 `YYYY-MM` |
| `summarize(records)` | → `DaySummary`（收入/支出/结余） |
| `breakdownByCategory(records, type)` | → `CategoryBreakdownItem[]`，按金额降序 |
| `sortRecordsDesc(records)` | 先 `date` 降序，同日再 `createdAt` 降序 |

统计页 MVP：**支出分类占比**必做；收入占比可选同函数 `type: 'income'`。

### 6.4 `date.ts`

| 函数 | 说明 |
|------|------|
| `today()` | 本地时区 `YYYY-MM-DD` |
| `addDays(date, n)` | 日切换 |
| `toYearMonth(date)` | `YYYY-MM` |
| `addMonths(yearMonth, n)` | 月切换 |
| `isCurrentMonth(yearMonth)` | 控制「回到本月」按钮 |

注意：一律用本地日期，避免 `toISOString()` 造成 UTC 偏移导致「今天」错一天。

### 6.5 `recordsStorage.ts`

```ts
export function loadRecords(): LedgerRecord[];
export function saveRecords(records: LedgerRecord[]): void;
```

- `load`：无 key / 空 → `[]`；JSON 损坏 → `[]` + 可打日志；结构不合法条目过滤或整包丢弃（推荐：**整包校验失败则 `[]` 并标记 `loadError`**，避免脏数据混入）
- `save`：捕获 `QuotaExceededError`，抛出领域错误 `StorageError` 供 UI 提示

### 6.6 `recordsStore.ts`（Zustand）

**状态**

```ts
interface RecordsState {
  records: LedgerRecord[];
  hydrated: boolean;
  loadError: string | null;
  hydrate: () => void;
  addRecord: (input: RecordFormInput) => { ok: true; id: string } | { ok: false; error: string; fieldErrors?: ... };
  updateRecord: (id: string, input: RecordFormInput) => ...;
  removeRecord: (id: string) => { ok: boolean; error?: string };
}
```

**约定**

- 每次成功变更后同步 `saveRecords`
- `save` 失败：不更新内存（或回滚到变更前快照），返回错误文案
- UI 临时态（选中日期、选中月份）可放页面 `useState`，不必进全局 store

---

## 7. 路由与页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | `TodayPage` | 默认今日；支持 `?date=YYYY-MM-DD` |
| `/stats` | `StatsPage` | 支持 `?month=YYYY-MM` |
| `/records/new` | `RecordFormPage` | 新建；可用 `?date=` 预填日期 |
| `/records/:id/edit` | `RecordFormPage` | 编辑；无此 id 则重定向 `/` |

**导航**

- `AppShell` 底栏：`今日` | `统计`
- 「记一笔」：今日页主按钮 / FAB → `/records/new`
- 列表项点击 → 编辑页
- 保存成功 → `navigate(`/?date=${savedDate}`)`

---

## 8. 错误处理与用户提示

| 场景 | 处理 |
|------|------|
| 表单校验失败 | 字段下展示中文错误（如「金额必须大于 0」） |
| 存储写入失败 / 配额满 | Toast：「保存失败，本地存储空间不足」 |
| 启动加载损坏 | Toast：「本地数据无法读取，已从空白开始」；`loadError` 可展示一次 |
| 编辑不存在的 id | 重定向今日 + 可选 Toast |
| 删除 | `ConfirmDialog`：「删除这条记录？」确认后执行 |

不向用户展示堆栈或原始 DOMException 名称。

---

## 9. UI 技术约束

与 PRD §4 对齐的实现约定：

| 项 | 约定 |
|----|------|
| 内容宽度 | `AppShell`：`max-w-lg`（约 512px）居中 |
| 收入色 | CSS 变量 `--color-income`（绿系） |
| 支出色 | CSS 变量 `--color-expense`（红/橙系） |
| 背景 | 轻微层次（如极淡底色 + 分区），避免纯平一块；不做紫渐变主题 |
| 列表 | 分隔线 + 排版，默认不加厚重卡片阴影 |
| 金额输入 | `<input inputMode="decimal" enterKeyHint="done">` |
| 分类选择 | 类型切换后重置为该类型默认分类（如支出→餐饮） |
| 空状态 | `EmptyState` + 按钮「记一笔」 |
| 分类占比 | `CategoryBars`：每行名称 + 金额 + 宽度为 `ratio` 的 bar |

---

## 10. 性能策略

| 策略 | 说明 |
|------|------|
| 按需过滤 | 今日页只 `filterByDate`；统计页只 `filterByMonth`，不在输入过程全量重算 |
| 列表规模 | MVP 全量载入内存；千级记录可接受 |
| 包体 | 不引入图表库；路由可按页 `lazy`（可选，非必须） |
| 写入 | 仅在 CRUD 成功路径 `save`，避免 debounce 写半成品 |

首屏目标：静态资源 + 一次 `loadRecords`，常规网络 < 2s 可交互。

---

## 11. 安全与隐私

- 无网络写账：不上传记录；不引入分析 SDK。
- React 默认文本转义；禁止对 `note` 使用 `dangerouslySetInnerHTML`。
- 数据明文存 localStorage：接受「本机可被同浏览器配置文件读取」的威胁模型；PRD 已声明无跨设备承诺。
- 后续导出文件名建议：`bookkeeping-backup-YYYYMMDD.json`，不含用户路径。

---

## 12. 测试计划

### 12.1 单测（Vitest，优先）

| 模块 | 用例要点 |
|------|----------|
| `money` | `"12.3"` → 1230；`"0"` / `""` / `"12.345"` / `"abc"` → 非法 |
| `validate` | 分类与类型不匹配失败；备注超长失败；合法通过 |
| `aggregate` | 跨日不过滤进当日；月汇总正确；占比之和 ≈ 1（空集单独处理） |
| `date` | 月末加减月不溢出错误；本地「今天」稳定 |
| `recordsStorage` | 用 mock `localStorage`：读写 round-trip；坏 JSON；配额抛错 |

### 12.2 手工验收（对照 PRD MVP）

1. 记一笔支出 → 今日列表可见 → 刷新仍在  
2. 编辑 / 删除（含确认）行为正确  
3. 切换日期看到对应流水与日汇总  
4. 月统计三大数字与支出分类条正确  
5. 窄屏（320）与桌面宽屏布局可用  

---

## 13. 构建与部署

```bash
cd app
npm install
npm run dev      # 本地开发
npm run build    # 产出 dist/
npm run preview
npm test
```

- **部署：** 将 `dist/` 发布到 Vercel / Cloudflare Pages / GitHub Pages（纯静态）。
- **GitHub Pages 注意：** 若非根路径，需配置 Vite `base`。
- **环境变量：** MVP 无需；勿把密钥写进前端。

---

## 14. 扩展点（非 MVP，仅预留思路）

| 版本 | 扩展方式 |
|------|----------|
| v1.1 筛选 | `aggregate` 增加 `filterByCategory` / 关键词；统计页 query |
| v1.2 导出 | `storage.exportJson()` / `importJson()`；校验 `version` |
| v1.2 自定义分类 | `categories` 从常量改为 store + 第二 storage key；记录仍存 `categoryId` |
| v1.3 PWA | Vite PWA 插件；注意更新策略勿误清数据 |
| Schema 升级 | `StoredPayload.version` + `migrate(v1 → v2)` |

---

## 15. 风险与对策

| 风险 | 对策 |
|------|------|
| 用户清除浏览器数据丢账 | UI「关于/说明」中提示；v1.2 提供导出 |
| localStorage 配额 | 捕获错误并提示；长期可迁 IndexedDB |
| 时区导致日期错位 | 禁止用 UTC ISO 日期当记账日；统一本地 `YYYY-MM-DD` |
| 浮点金额 | 全程 `amountCents` 整数运算 |

---

## 16. 实现顺序建议

1. 脚手架（Vite + React + TS + Tailwind + Router）  
2. `domain` 类型 / money / date / validate / aggregate + 单测  
3. `storage` + `recordsStore` + hydrate  
4. `TodayPage`（汇总 + 列表 + 空状态）  
5. `RecordFormPage`（新建/编辑/删除）  
6. `StatsPage`（月汇总 + 分类条）  
7. `AppShell` 导航与响应式收尾  
8. 手工验收 + 构建部署说明  

---

## 17. 文档关系

| 文档 | 职责 |
|------|------|
| [Research.md](./Research.md) | 原始诉求 |
| [PRD.md](./PRD.md) | 产品做什么、优先级、体验与非功能 |
| **TECH_DESIGN.md（本文）** | 怎么做：架构、模型、模块、存储、测试与落地顺序 |

PRD 变更时，优先同步本文 §5 数据模型、§7 路由与 §1 范围。
