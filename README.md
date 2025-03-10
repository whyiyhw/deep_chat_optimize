# 项目 为 deep chat optimize

- 最终目的主要有两个方向，
- 对于浏览器上的 ai chat 的 界面优化，加入额外功能，
- 对于浏览器上的 chat 数据可以进行 导出 方便用户 进行 本地化的存储 或者进行分享到社交平台。

## 开发环境
- node 版本为 22.14.0
- pnpm 版本为 9.12.3

## 图标生成

项目使用SVG格式的图标源文件，并通过脚本转换为所需的PNG格式图标。

### 转换图标

1. 确保已安装Node.js环境
2. 运行以下命令安装必要的依赖：
   ```bash
   pnpm install
   ```
3. 运行转换脚本：
   ```bash
   node convert_icons.js
   ```

这将把`public/images/icon.svg`文件转换为三种尺寸的PNG图标：
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

如果需要修改图标，请编辑`public/images/icon.svg`文件，然后重新运行转换脚本。

## 项目结构

```
deep_chat_optimize/
├── public/                     # 静态资源文件
│   ├── images/                 # 图片资源
│   │   └── icon.svg            # 图标源文件(SVG)
│   │   └── icon16.png          # 16x16图标
│   │   └── icon48.png          # 48x48图标
│   │   └── icon128.png         # 128x128图标
│   ├── manifest.json           # 扩展清单文件
│   └── content.css             # 内容脚本样式
├── src/                        # 源代码目录
│   ├── background/             # 背景脚本
│   │   └── index.js            # 背景脚本入口
│   ├── content/                # 内容脚本
│   │   ├── components/         # 内容脚本组件
│   │   ├── core/               # 核心功能实现
│   │   ├── features/           # 特性功能实现
│   │   │   ├── data-extractors.js  # 数据提取器
│   │   │   ├── export.js           # 导出功能
│   │   │   ├── export-core.js      # 导出核心功能
│   │   │   ├── export-ui.js        # 导出UI组件
│   │   │   ├── image-renderer.js   # 图像渲染
│   │   │   ├── prompt/             # 提示词相关功能
│   │   │   ├── promptFeature.js    # 提示词功能
│   │   │   ├── themeManager.js     # 主题管理
│   │   │   ├── themes.js           # 主题定义
│   │   │   └── ui.js               # UI功能
│   │   ├── utils/              # 内容脚本工具函数
│   │   └── index.jsx           # 内容脚本入口
│   ├── popup/                  # 弹出窗口
│   │   ├── components/         # 弹出窗口React组件
│   │   ├── contexts/           # React上下文
│   │   │   ├── LanguageContext.jsx # 语言上下文
│   │   │   ├── NotificationContext.jsx # 通知上下文
│   │   │   └── SettingsContext.jsx # 设置上下文
│   │   ├── styles/             # 样式文件
│   │   ├── index.html          # 弹出窗口HTML
│   │   └── index.jsx           # React入口
│   ├── options/                # 选项页
│   ├── utils/                  # 通用工具函数
│   ├── contexts/               # 全局上下文
│   └── hooks/                  # 自定义React Hooks
├── .gitignore                  # Git忽略文件
├── vite.config.js              # Vite配置文件
├── package.json                # 项目依赖配置
├── pnpm-lock.yaml              # pnpm锁文件
├── convert_icons.js            # 图标转换脚本
├── background.js               # 背景脚本
├── content.js                  # 内容脚本
├── popup.html                  # 弹出窗口HTML
├── options.html                # 选项页HTML
├── README.md                   # 项目说明文档
└── LICENSE                     # 许可证文件
```

## 技术栈

- 前端：React.js、styled-components
- 状态管理：React Context API
- 数据存储：Chrome Storage API
- 打包工具：Vite + @crxjs/vite-plugin
- 包管理：pnpm
- 样式：CSS-in-JS (styled-components)
- 图像处理：html2canvas、sharp
- 文件处理：jszip

## 支持的网站

目前支持以下AI聊天网站：
- DeepSeek Chat (https://chat.deepseek.com/)
- 腾讯混元助手 (https://yuanbao.tencent.com/)

## React架构

项目采用现代React架构，具有以下特点：

### 组件结构
- **弹出窗口组件**: 实现扩展的主要交互界面
- **内容脚本组件**: 注入到目标网站的功能组件

### 状态管理
- **SettingsContext**: 管理用户设置（深色模式、功能开关等）
- **LanguageContext**: 实现国际化多语言支持
- **NotificationContext**: 统一管理通知提示

### 样式系统
- 使用styled-components实现组件样式
- 支持主题切换（浅色/深色模式）
- 响应式设计

### 数据流
- 自上而下的单向数据流
- 通过Context跨组件共享状态
- 使用Hooks管理组件生命周期和状态

## 功能特性

### 界面优化
- 自定义主题和布局
- 代码高亮显示
- 响应式设计，适配不同设备

### 额外功能
- 历史会话管理
- 提示词（Prompt）模板管理
- 多模型支持和切换
- 图像渲染和处理

### 数据导出
- 支持多种格式导出（JSON、Markdown）
- 一键导出当前会话
- 批量导出历史会话
- 图像导出功能

## 开发指南

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run dev
```

### 构建生产版本
```bash
pnpm run build
```

### 预览构建结果
```bash
pnpm run preview
```

### 加载扩展到浏览器
1. pnpm run build 去生成 dist 目录
2. 打开Chrome浏览器
3. 访问 chrome://extensions/
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择项目的 `dist` 目录

### 多语言支持

项目支持多语言，目前实现了中文和英文两种语言。

#### 添加新翻译
在 `src/popup/contexts/LanguageContext.jsx` 中的translations对象中添加新的键值对。

```javascript
const translations = {
  'zh-CN': {
    // 已有翻译
    newKey: '新的翻译文本'
  },
  'en-US': {
    // 已有翻译
    newKey: 'New translation text'
  }
};
```

然后在组件中使用 `t.newKey` 来访问翻译文本。

## 贡献指南

欢迎贡献代码或提出建议！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件
