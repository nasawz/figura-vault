# Figura Vault

> AI 手办图片收藏管理桌面应用

Figura Vault 是一款专为 AI 生成手办图片设计的本地收藏管理工具。支持 Before / After 对比、相册分类、标签管理、智能搜索等功能，所有数据存储在本地，隐私安全。

## 功能特性

- **收藏墙** — 9:16 竖图瀑布流网格，沉浸式浏览
- **Before / After 滑杆对比** — 拖动滑杆实时对比原图与 AI 图
- **橡皮擦对比** — Canvas 橡皮擦擦除 AI 图，露出原图，可调笔刷大小
- **9:16 详情工作台** — 全页详情视图，图片工作区 + 右侧信息栏
- **相册管理** — 创建相册，分类整理收藏
- **标签系统** — 自由标签，支持自动补全和快速创建
- **搜索筛选排序** — 关键字搜索 + 相册/标签/星标组合筛选 + 多维排序
- **AI 识别** — 导入图片时调用 Ollama 自动提取标题、描述、标签
- **编辑功能** — 修改信息、替换/添加/移除图片
- **本地存储** — SQLite 数据库 + 图片复制到 AppData，不依赖原路径

## 安装

### macOS

从 [GitHub Releases](https://github.com/nasawz/figura-vault/releases) 下载最新版本的 `.dmg` 文件：

- **Apple Silicon (M1/M2/M3/M4)** — 下载 `aarch64.dmg`
- **Intel Mac** — 下载 `x64.dmg`

打开 `.dmg` 文件，将 Figura Vault 拖入 Applications 文件夹即可。

> **注意**：应用未经 Apple 签名，首次打开时 macOS 可能提示"无法打开"。请前往「系统设置 > 隐私与安全性」，找到 Figura Vault 并点击「仍要打开」。

## 本地开发

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/) (stable)
- Tauri 2 CLI（`cargo install tauri-cli`）

### 启动开发环境

```bash
# 安装依赖
pnpm install

# 启动开发模式（前端 + Tauri 桌面窗口）
pnpm tauri dev
```

### 构建

```bash
pnpm tauri build
```

产物位于 `src-tauri/target/release/bundle/`。

## 技术栈

| 层       | 技术                          |
| -------- | ----------------------------- |
| 框架     | Tauri 2                       |
| 前端     | React 19 + TypeScript         |
| 样式     | Tailwind CSS v4 + shadcn/ui   |
| 数据库   | SQLite（tauri-plugin-sql）    |
| 构建     | Vite 7                        |
| AI 识别  | Ollama（本地大模型）          |

## 项目结构

```
figura-vault/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   ├── pages/              # 页面（Gallery / Detail / Settings）
│   ├── lib/                # 数据访问层（figure / album / tag / file）
│   ├── hooks/              # 自定义 Hooks
│   └── types/              # TypeScript 类型定义
├── src-tauri/              # Tauri / Rust 后端
│   ├── src/lib.rs          # Tauri commands（文件操作、AI 识别）
│   └── tauri.conf.json     # Tauri 配置
└── docs/                   # 产品文档
```

## License

[MIT](LICENSE)
