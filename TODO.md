# AI 手办图片收藏馆 — 开发任务清单

> 基于 [PRD](docs/prd/手办图片收藏馆.md) 拆解，每个 Phase 细化为可独立完成的小任务。
> 标记说明：`[ ]` 待办 · `[x]` 已完成 · `[-]` 跳过/延后

---

## Phase 0：需求确认与项目准备

> 目标：明确项目范围，避免第一版做得过大。

- [x] P0-1 完成 PRD 文档撰写
- [x] P0-2 确认技术选型（Tauri 2 + React + TS + shadcn/ui + SQLite）
- [x] P0-3 确认 MVP 功能列表与非目标列表
- [x] P0-4 确认数据模型草案（5 张表：figures / figure_images / albums / tags / figure_tags）
- [x] P0-5 确认 UI 风格方向（收藏墙 + 左侧导航 + 详情弹窗）
- [x] P0-6 确认图片存储策略（导入时复制到 AppData，不依赖原路径）

---

## Phase 1：项目骨架搭建

> 目标：搭建可运行的 Tauri 2 + React + TypeScript + shadcn/ui 项目骨架。

### 1.1 项目初始化

- [x] P1-1 使用 `create-tauri-app` 创建 Tauri 2 + React + TypeScript 项目
- [x] P1-2 配置 Vite 构建（确认 dev / build 命令正常）
- [x] P1-3 验证 `tauri dev` 能启动桌面窗口并加载 React 页面

### 1.2 样式与 UI 框架

- [x] P1-4 安装并配置 Tailwind CSS v4（@tailwindcss/vite 插件 + index.css）
- [x] P1-5 初始化 shadcn/ui（base-nova 风格 + 紫色主题 + 路径别名 @/）
- [x] P1-6 安装第一批 shadcn/ui 组件：Button、Card、Input、Textarea、Badge
- [x] P1-7 安装第二批 shadcn/ui 组件：Dialog、AlertDialog、Select、Tabs
- [x] P1-8 安装第三批 shadcn/ui 组件：ScrollArea、Separator、Slider、Sonner、Sidebar、Tooltip、Sheet、Skeleton

### 1.3 目录结构

- [x] P1-9 创建基础目录结构：
  - `src/pages/`
  - `src/components/layout/`
  - `src/components/figures/`
  - `src/components/figures/compare/`
  - `src/components/ui/`（shadcn 自动生成）
  - `src/lib/`
  - `src/types/`
  - `src/data/`

### 1.4 基础布局

- [x] P1-10 实现 `AppLayout.tsx`（SidebarProvider + SidebarInset 布局）
- [x] P1-11 实现 `AppSidebar.tsx`（collapsible="icon" 收起模式 + 分组导航 + 相册占位 + 标签占位）
- [x] P1-12 实现 `TopBar.tsx`（标题 + 网格视图按钮 + 导入按钮）
- [x] P1-13 实现 `GalleryPage.tsx`（空状态引导页）
- [x] P1-14 在 `App.tsx` 中组装 Layout + GalleryPage，验证页面渲染
- [x] P1-15 清理模板代码，更新 index.html 标题、tauri.conf.json 窗口配置（1200×800，最小 900×600）

### 验收

- [x] P1-AC 确认：dev 环境可运行、桌面窗口可打开、基础布局正常、shadcn 组件可用、Tailwind 生效、侧边栏支持收起/展开

---

## Phase 2：静态 UI 与 Mock 数据

> 目标：用 Mock 数据把核心界面和交互跑通，不接数据库和文件系统。

### 2.1 类型定义

- [x] P2-1 创建 `src/types/figure.ts`，定义 `FigureImageRole`、`FigureImage`、`Album`、`Tag`、`FigureItem`
- [x] P2-2 在 `src/types/figure.ts` 中添加辅助方法 `getAfterImage`、`getBeforeImage`、`hasBeforeAfter`

### 2.2 Mock 数据

- [x] P2-3 创建 `src/data/mockFigures.ts`，编写 8 条 Mock 数据（picsum 占位图）
  - 包含：纯 After 图、Before+After 双图、不同相册、不同标签、有/无星标
- [x] P2-4 创建 Mock 相册列表（4 个相册）
- [x] P2-5 创建 Mock 标签列表（6 个标签，带颜色）

### 2.3 收藏墙核心组件

- [x] P2-6 实现 `FigureCard.tsx`：展示主图缩略图、标题、标签 Badge、星标按钮、B/A 标识
- [x] P2-7 实现 `FigureGrid.tsx`：响应式网格布局（2/3/4/5 列），空结果提示
- [x] P2-8 完善 `GalleryPage.tsx`：引入 Mock 数据，渲染 FigureGrid，搜索框

### 2.4 侧边栏

- [x] P2-9 改造 `AppSidebar.tsx`：接收 props，渲染"全部收藏"和"星标收藏"导航项，实时计数
- [x] P2-10 在 AppSidebar 中渲染相册列表（来自 Mock 数据），点击可切换当前相册
- [x] P2-11 在 AppSidebar 中渲染标签列表（来自 Mock 数据），点击可切换当前标签筛选

### 2.5 筛选与搜索

- [x] P2-12 实现搜索框组件（带清空按钮），按标题关键字过滤
- [x] P2-13 实现"星标收藏"筛选功能（切换 isFavorite 过滤）
- [x] P2-14 实现相册筛选（选中侧边栏相册后只展示该相册收藏项）
- [x] P2-15 实现标签筛选（选中侧边栏标签后只展示含该标签的收藏项）

### 2.6 详情弹窗

- [x] P2-16 实现 `FigureDetailDialog.tsx` 基础结构：Dialog 容器 + 图片区域 + 信息区域
- [x] P2-17 单图收藏详情：展示 After 大图、标题、描述、相册、标签、星标按钮、删除按钮（disabled 占位）
- [x] P2-18 双图收藏详情：展示 Tabs 容器（滑杆对比 / 橡皮擦对比 / 原图 / AI 图），滑杆/橡皮擦为占位说明
- [x] P2-19 点击 FigureCard 时打开 FigureDetailDialog，星标状态实时同步

### 2.7 导入弹窗

- [x] P2-20 实现 `ImportFigureDialog.tsx` 静态表单：
  - After / Before 图片选择区（虚线占位）
  - 标题输入框（必填校验）
  - 描述输入框
  - 相册 Select 下拉
  - 标签点选 Badge
  - 星标切换
  - 保存 / 取消按钮（保存仅关闭弹窗，Phase 4 接真实保存）
- [x] P2-21 TopBar 导入按钮点击后打开 ImportFigureDialog

### 验收

- [x] P2-AC 确认：收藏墙展示 8 条 Mock 图片、卡片信息完整、B/A 标识正确、详情弹窗可打开（单图/双图）、搜索/筛选正常、导入弹窗可打开关闭、侧边栏收起展开不破布局

---

## Phase 3：数据库设计与接入

> 目标：接入 SQLite，实现数据持久化。

### 3.1 插件安装与配置

- [x] P3-1 安装 Tauri SQL 插件（`@tauri-apps/plugin-sql`）
- [x] P3-2 在 `tauri.conf.json` 中注册 SQL 插件权限
- [x] P3-3 配置 SQLite 数据库文件路径（AppData 目录下 `app.db`）

### 3.2 数据库初始化

- [x] P3-4 编写数据库初始化 SQL：创建 `figures` 表
- [x] P3-5 编写数据库初始化 SQL：创建 `figure_images` 表（含外键级联删除）
- [x] P3-6 编写数据库初始化 SQL：创建 `albums` 表
- [x] P3-7 编写数据库初始化 SQL：创建 `tags` 表
- [x] P3-8 编写数据库初始化 SQL：创建 `figure_tags` 关系表（含外键级联删除）
- [x] P3-9 实现数据库初始化/迁移逻辑（应用启动时自动执行建表）

### 3.3 数据访问层封装

- [x] P3-10 封装 `src/lib/db.ts`：获取数据库连接、执行查询的基础工具函数
- [x] P3-11 封装 `src/lib/figure.ts`：收藏项 CRUD
  - `getAllFigures()` — 查询全部收藏项（含图片和标签）
  - `getFigureById(id)` — 查询单个收藏项详情
  - `getFiguresByAlbum(albumId)` — 按相册查询
  - `getFiguresByTag(tagId)` — 按标签查询
  - `getFavorites()` — 查询星标收藏
- [x] P3-12 实现 `createFigure(data)` — 创建收藏项（写入 figures + figure_images + figure_tags）
- [x] P3-13 实现 `deleteFigure(id)` — 删除收藏项（级联删除图片记录和标签关联）
- [x] P3-14 实现 `toggleFavorite(id)` — 切换星标状态
- [x] P3-15 封装 `src/lib/album.ts`：相册 CRUD
  - `getAllAlbums()` — 查询所有相册
  - `createAlbum(name, description?)` — 创建相册
- [x] P3-16 封装 `src/lib/tag.ts`：标签 CRUD
  - `getAllTags()` — 查询所有标签
  - `createTag(name)` — 创建标签
  - `getOrCreateTag(name)` — 查找或创建标签

### 3.4 前端数据层切换

- [x] P3-17 将 GalleryPage 的数据源从 Mock 切换为数据库查询
- [x] P3-18 将侧边栏相册/标签列表从 Mock 切换为数据库查询
- [x] P3-19 星标操作改为调用 `toggleFavorite` 并刷新列表

### 验收

- [x] P3-AC 确认：启动时数据库自动初始化、CRUD 正常工作、星标可持久化、重启后数据仍在
  - 注：开发种子数据（seed）通过 `src/lib/seed.ts` 在数据库为空时自动写入，Phase 4/发布前决定是否保留 seed

---

## Phase 4：本地文件导入与图片存储

> 目标：实现图片选择、复制到 AppData、完整导入流程。

### 4.1 Tauri 文件系统配置

- [x] P4-1 配置 Tauri 文件系统权限（`dialog` 插件 + asset protocol scope）
  - 注：文件复制由 Rust command（`std::fs`）实现，不使用 Tauri fs plugin
- [x] P4-2 封装 `src/lib/file.ts`：获取应用数据目录路径的工具函数
- [x] P4-3 实现获取/创建 `images/` 根目录的逻辑

### 4.2 图片选择

- [x] P4-4 实现 After 图片选择：调用 Tauri 文件选择 Dialog，限制文件类型为图片（png/jpg/jpeg/webp）
- [x] P4-5 实现 Before 图片选择：同上，可选
- [x] P4-6 选择图片后在 ImportFigureDialog 中预览缩略图
- [x] P4-7 处理用户取消选择的情况（不报错，保持当前状态）

### 4.3 图片复制与存储

- [x] P4-8 实现 ID 生成逻辑（UUID 或 nanoid）
- [x] P4-9 实现创建 `images/{figureId}/` 目录
- [x] P4-10 实现复制 After 图片到 `images/{figureId}/after.{ext}`
- [x] P4-11 实现复制 Before 图片到 `images/{figureId}/before.{ext}`（如果有）
- [x] P4-12 返回复制后的相对路径，用于写入 `figure_images` 表

### 4.4 导入完整流程串联

- [x] P4-13 ImportFigureDialog 保存按钮点击后：
  1. 生成 figureId
  2. 复制图片到 AppData
  3. 写入 figures 表
  4. 写入 figure_images 表
  5. 处理标签（getOrCreate + 写入 figure_tags）
- [x] P4-14 导入完成后关闭弹窗并刷新收藏墙
- [x] P4-15 导入失败时的错误处理（回滚已复制的文件、显示错误提示）
- [x] P4-16 表单验证：After 图片和标题为必填，未填时禁用保存按钮

### 4.5 图片加载

- [x] P4-17 实现从 AppData 路径加载图片到前端展示（Tauri `convertFileSrc` + asset protocol）
- [x] P4-18 FigureCard 和 FigureDetailDialog 使用真实图片路径渲染

### 验收

- [x] P4-AC 确认：可选择本地图片、图片被复制到 AppData、数据库记录正确、收藏墙显示真实图片、重启后图片仍可显示、原图删除不影响应用

---

## Phase 5：图片详情与基础管理功能

> 目标：完成查看、收藏、删除等基础管理功能。

### 5.1 详情弹窗接入真实数据

- [ ] P5-1 FigureDetailDialog 接收真实 FigureItem 数据，展示标题、描述、相册名、标签
- [ ] P5-2 单图收藏：展示 After 大图预览（可点击放大或适应容器）
- [ ] P5-3 双图收藏：展示 Tabs（滑杆对比 / 橡皮擦对比 / 原图 / AI 图），具体对比组件在 Phase 6-7 实现，先用占位或单独查看

### 5.2 星标收藏

- [ ] P5-4 详情弹窗中实现星标按钮，点击调用 `toggleFavorite` 并更新 UI
- [ ] P5-5 FigureCard 上的星标按钮同步调用 `toggleFavorite`
- [ ] P5-6 切换星标后收藏墙实时刷新（如果当前在"收藏"筛选下）

### 5.3 删除收藏项

- [ ] P5-7 详情弹窗中添加删除按钮
- [ ] P5-8 实现删除确认 AlertDialog（"确定要删除这个收藏项吗？此操作会删除应用内保存的图片副本，无法恢复。"）
- [ ] P5-9 确认后执行删除：删除数据库记录（figures + figure_images + figure_tags 级联）
- [ ] P5-10 确认后执行删除：删除 `images/{figureId}/` 目录及其中的图片文件
- [ ] P5-11 删除完成后关闭详情弹窗并刷新收藏墙
- [ ] P5-12 处理删除失败情况（文件删除失败时仍应删除数据库记录，避免幽灵数据）

### 验收

- [ ] P5-AC 确认：详情展示真实数据、星标可切换并持久化、删除前有二次确认、删除后收藏墙更新、图片文件被清理、重启后不再出现

---

## Phase 6：Before / After 滑杆对比

> 目标：实现双图收藏项的滑杆对比特效。

### 6.1 滑杆组件开发

- [ ] P6-1 创建 `BeforeAfterSlider.tsx`，接收 props：`beforeSrc`、`afterSrc`
- [ ] P6-2 实现基础布局：底层 Before 图 + 上层 After 图（通过 `clip-path` 或宽度裁切叠加）
- [ ] P6-3 实现滑杆 UI：中间竖线 + 拖动手柄
- [ ] P6-4 实现鼠标拖动：mousedown → mousemove → mouseup 控制滑杆位置
- [ ] P6-5 实现触控拖动：touchstart → touchmove → touchend
- [ ] P6-6 默认滑杆位置 50%
- [ ] P6-7 显示 Before / After 文字标签（左右两侧）
- [ ] P6-8 处理图片加载状态（loading 占位）

### 6.2 集成到详情弹窗

- [ ] P6-9 创建 `FigureComparePanel.tsx`：包装 Tabs（滑杆对比 / 橡皮擦对比 / 原图 / AI 图）
- [ ] P6-10 在"滑杆对比" Tab 中渲染 BeforeAfterSlider
- [ ] P6-11 在"原图" Tab 中渲染 Before 图单独查看
- [ ] P6-12 在"AI 图" Tab 中渲染 After 图单独查看
- [ ] P6-13 FigureDetailDialog 中：双图收藏项显示 FigureComparePanel，单图只显示 After 图

### 6.3 响应式与边界处理

- [ ] P6-14 滑杆组件适配不同容器宽度
- [ ] P6-15 处理 Before/After 图片比例不一致时的 `object-contain` 显示

### 验收

- [ ] P6-AC 确认：双图项可滑杆对比、拖动流畅、标签正确、单图项不显示滑杆、不同窗口宽度布局正常

---

## Phase 7：橡皮擦对比

> 目标：实现双图收藏项的 Canvas 橡皮擦对比特效。

### 7.1 橡皮擦组件开发

- [ ] P7-1 创建 `EraserReveal.tsx`，接收 props：`beforeSrc`、`afterSrc`
- [ ] P7-2 实现底层：`<img>` 展示 Before 图
- [ ] P7-3 实现上层：`<canvas>` 绘制 After 图
- [ ] P7-4 实现 Canvas 自适应容器尺寸（监听 resize）
- [ ] P7-5 处理设备像素比 DPR（canvas 实际像素 = 显示像素 × DPR，防止高清屏模糊/偏移）
- [ ] P7-6 实现鼠标擦除：mousedown 开始 → mousemove 擦除 → mouseup 结束
- [ ] P7-7 实现触控擦除：touchstart → touchmove → touchend
- [ ] P7-8 擦除使用 `globalCompositeOperation = 'destination-out'` 清除 canvas 像素

### 7.2 交互控制

- [ ] P7-9 实现画笔大小调整（Slider 控件，默认 30px，范围 10-100px）
- [ ] P7-10 实现重置按钮（重新绘制完整 After 图到 canvas）
- [ ] P7-11 画笔大小 UI 放在组件底部或侧面工具栏

### 7.3 集成到详情弹窗

- [ ] P7-12 在 FigureComparePanel 的"橡皮擦对比" Tab 中渲染 EraserReveal
- [ ] P7-13 切换 Tab 时重置 canvas 状态（避免切走再切回时状态混乱）

### 7.4 边界处理

- [ ] P7-14 处理图片加载完成后再初始化 canvas（防止空白绘制）
- [ ] P7-15 处理窗口 resize 时重新绘制 canvas

### 验收

- [ ] P7-AC 确认：可擦除露出 Before 图、画笔大小可调、重置正常、鼠标和触控都可用、单图项不显示

---

## Phase 8：相册与标签完善

> 目标：完善相册/系列与标签的创建和筛选体验。

### 8.1 相册管理

- [ ] P8-1 实现"新建相册" Dialog（输入名称 + 可选描述）
- [ ] P8-2 在 ImportFigureDialog 中添加相册选择下拉（Select 组件，加载已有相册列表）
- [ ] P8-3 在 ImportFigureDialog 的相册下拉中添加"新建相册"选项，点击后打开新建 Dialog
- [ ] P8-4 新建相册后自动选中该相册

### 8.2 标签输入优化

- [ ] P8-5 实现标签输入组件：支持输入后按 Enter/逗号创建标签 Badge
- [ ] P8-6 已输入标签显示为 Badge，可点击 × 删除
- [ ] P8-7 标签自动创建逻辑：导入保存时调用 `getOrCreateTag` 确保标签存在
- [ ] P8-8 （可选）标签输入时提供已有标签的自动补全建议

### 8.3 侧边栏完善

- [ ] P8-9 侧边栏相册列表从数据库实时加载
- [ ] P8-10 侧边栏标签列表从数据库实时加载
- [ ] P8-11 当前选中的相册/标签高亮显示
- [ ] P8-12 （可选）每个相册/标签后显示收藏项数量

### 验收

- [ ] P8-AC 确认：可创建相册、导入时可选择/新建相册、标签输入体验流畅、侧边栏筛选正常

---

## Phase 9：搜索、筛选与排序优化

> 目标：提升收藏墙的实际使用体验。

### 9.1 搜索增强

- [ ] P9-1 实现标题搜索（输入时实时过滤，加 debounce 300ms）
- [ ] P9-2 搜索与相册筛选可同时生效
- [ ] P9-3 搜索与标签筛选可同时生效
- [ ] P9-4 搜索与收藏筛选可同时生效

### 9.2 排序

- [ ] P9-5 添加排序下拉：最近导入（默认）/ 最早导入 / 标题 A-Z / 标题 Z-A
- [ ] P9-6 排序与筛选可同时生效

### 9.3 空状态

- [ ] P9-7 无收藏项时显示空状态 UI（引导文案 + "导入第一张图片"按钮）
- [ ] P9-8 搜索无结果时显示"未找到匹配的收藏项"+ 清空搜索按钮
- [ ] P9-9 当前相册/标签下无收藏项时显示对应空状态

### 9.4 筛选状态管理

- [ ] P9-10 添加"清空所有筛选"按钮（搜索框右侧或筛选区域）
- [ ] P9-11 当有活跃筛选时在顶部显示筛选指示器（如："当前筛选：相册「猫咪系列」+ 标签「可爱」"）

### 验收

- [ ] P9-AC 确认：多筛选可组合、空状态有提示、排序正常、清空筛选可回到全部

---

## Phase 10：打包、配置与体验收尾

> 目标：完成个人可用版本，作为桌面客户端长期使用。

### 10.1 应用配置

- [ ] P10-1 配置应用名称（中文：AI 手办收藏馆 / 英文：Figura Vault）
- [ ] P10-2 配置应用默认窗口大小（建议 1200×800，最小 900×600）
- [ ] P10-3 设计并配置应用图标（icns / ico / png 三套）
- [ ] P10-4 配置 Tauri 权限：fs / dialog / path / sql 等插件 scope

### 10.2 设置页

- [ ] P10-5 创建 `SettingsPage.tsx`
- [ ] P10-6 展示数据库文件位置（只读）
- [ ] P10-7 展示图片存储目录位置（只读）
- [ ] P10-8 展示应用版本号
- [ ] P10-9 在侧边栏底部添加"设置"入口，点击切换到设置页

### 10.3 操作反馈

- [ ] P10-10 导入成功后显示 Toast（"收藏项已导入"）
- [ ] P10-11 删除成功后显示 Toast（"收藏项已删除"）
- [ ] P10-12 操作失败时显示错误 Toast（"操作失败，请重试"+ 错误信息）
- [ ] P10-13 图片加载失败时显示 fallback 占位图

### 10.4 打包与测试

- [ ] P10-14 配置 `tauri build` 打包命令
- [ ] P10-15 macOS 打包测试（.dmg）
- [ ] P10-16 安装后全流程冒烟测试：导入 → 浏览 → 详情 → 滑杆对比 → 橡皮擦对比 → 星标 → 筛选 → 删除
- [ ] P10-17 验证数据持久化（关闭重开后数据仍在）
- [ ] P10-18 （可选）Windows 打包测试（.msi）
- [ ] P10-19 （可选）Linux 打包测试（.AppImage / .deb）

### 验收

- [ ] P10-AC 确认：应用可打包安装、全功能可用、数据持久化、操作有反馈提示 → **v1.0 发布**

---

## 后续版本（MVP 后）

以下任务在 v1.0 完成后按优先级推进，暂不展开细拆：

- [ ] **v1.1 批量导入** — 一次选择多张图片批量创建收藏项
- [ ] **v1.2 多版本图片** — 一个收藏项支持多个 AI 版本（variant 角色）
- [ ] **v1.3 备份与导出** — 导出数据库+图片为 zip / 从备份恢复
- [ ] **v1.4 收藏体验增强** — 相册封面、标签颜色、评分系统、高级排序
- [ ] **v1.5 展示模式** — 展柜模式、幻灯片、全屏预览、随机展示
