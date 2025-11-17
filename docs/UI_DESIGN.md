# Hint UI Design Guide

## 设计理念

本项目的用户界面严格遵循 **Apple Human Interface Guidelines**，追求简洁、优雅、直观的设计风格。

## 设计原则

### 1. 视觉层次

- **清晰的信息架构**：使用明确的视觉层次引导用户注意力
- **留白设计**：充足的间距提升可读性和视觉舒适度
- **字体层级**：使用不同的字重和大小建立清晰的内容结构

### 2. 简洁性

- **最小化设计**：移除不必要的视觉元素
- **功能优先**：每个界面元素都有明确的目的
- **清晰的操作流程**：减少用户认知负担

### 3. 一致性

- **统一的视觉语言**：所有组件使用相同的设计模式
- **可预测的交互**：符合用户习惯的交互方式
- **品牌统一性**：保持整体风格协调

---

## 核心设计元素

### 颜色系统

#### 主色调
```
蓝色（Blue）
- Light: #3B82F6 (blue-500)
- Dark:  #2563EB (blue-600)
用途：主要操作按钮、焦点状态

绿色（Green）
- Light: #10B981 (green-500)
- Dark:  #059669 (green-600)
用途：成功状态、确认操作
```

#### 中性色
```
灰色系统
- Gray 50:  #F9FAFB (浅色背景)
- Gray 100: #F3F4F6 (次级背景)
- Gray 200: #E5E7EB (边框)
- Gray 500: #6B7280 (次要文本)
- Gray 700: #374151 (主要文本)
- Gray 800: #1F2937 (深色背景)
- Gray 900: #111827 (深色主背景)
```

#### 语义色
```
错误（Error）
- Light: #EF4444 (red-500)
- Background: #FEF2F2/90 (red-50/90)

成功（Success）
- Light: #10B981 (green-500)
- Background: #F0FDF4/90 (green-50/90)
```

### 圆角（Border Radius）

遵循苹果设计，使用更大的圆角值：

```
- sm:  4px   (0.25rem)
- md:  6px   (0.375rem)
- lg:  8px   (0.5rem)
- xl:  12px  (0.75rem)  ✨ 主要使用
- 2xl: 16px  (1rem)     ✨ 卡片和容器
```

### 阴影（Shadows）

分层阴影系统，营造深度感：

```css
/* 标准阴影 */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

/* 加强阴影 */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* 超大阴影 */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

/* 自定义毛玻璃阴影 */
0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)
```

### 间距系统

```
0.5 = 2px
1   = 4px
2   = 8px
2.5 = 10px  ✨ 常用
3   = 12px
4   = 16px
5   = 20px
6   = 24px
```

---

## 组件设计详解

### 1. FloatingToolbar（浮动工具栏）

#### 设计特点
- **毛玻璃效果**：`backdrop-blur-xl` + 半透明背景
- **柔和边框**：50% 不透明度的边框
- **优雅阴影**：双层阴影营造浮动感
- **大圆角**：`rounded-2xl` (16px)

#### 实现代码
```tsx
<div className="
  backdrop-blur-xl
  bg-white/90 dark:bg-gray-900/90
  rounded-2xl
  shadow-2xl
  border border-gray-200/50 dark:border-gray-700/50
  p-2.5
">
```

#### 视觉效果
- ✅ 与背景融合，不突兀
- ✅ 保持内容可读性
- ✅ 现代感和科技感

---

### 2. ActionButton（操作按钮）

#### 设计特点
- **SF Symbols 风格图标**：使用 SVG 代替 emoji
- **颜色语义化**：
  - 蓝色：优化操作
  - 绿色：确认/替换操作
- **交互反馈**：
  - Hover：颜色加深 + 阴影增强
  - Active：`scale-95` 按压效果
  - Disabled：60% 不透明度

#### 实现代码
```tsx
<button className="
  bg-blue-500 dark:bg-blue-600
  hover:bg-blue-600 dark:hover:bg-blue-700
  active:scale-95
  p-2.5 rounded-xl
  transition-all duration-200 ease-out
  shadow-md hover:shadow-lg
">
  <svg className="w-4 h-4">...</svg>
</button>
```

#### 图标设计
```
优化：闪电图标（Lightning）
替换：对勾图标（Checkmark）
加载：旋转动画（Spinner）
```

---

### 3. OptimizedTextPreview（文本预览卡片）

#### 设计特点
- **半透明背景**：80% 不透明度 + backdrop-blur
- **舒适阅读**：`leading-relaxed` 行高
- **平滑滚动**：`overflow-y-auto`
- **入场动画**：`animate-slideIn`

#### 实现代码
```tsx
<div className="
  bg-gray-50/80 dark:bg-gray-800/80
  backdrop-blur-sm
  rounded-xl
  border border-gray-200/50
  px-4 py-3
  text-sm leading-relaxed
  animate-slideIn
">
```

---

### 4. ErrorMessage（错误消息）

#### 设计特点
- **柔和的错误色**：避免过于刺眼的红色
- **图标 + 文本**：alert 图标提供视觉提示
- **flex 布局**：图标和文本对齐

#### 实现代码
```tsx
<div className="
  bg-red-50/90 dark:bg-red-900/20
  text-red-700 dark:text-red-400
  border border-red-200/50
  rounded-xl
  flex items-start gap-2
  px-4 py-3
">
  <svg className="w-4 h-4">...</svg>
  <span>{message}</span>
</div>
```

---

### 5. PopupApp（设置弹窗）

#### 设计特点

##### 整体布局
- **渐变背景**：`bg-gradient-to-br` 营造层次
- **固定宽度**：420px，符合苹果标准弹窗尺寸
- **最小高度**：500px，保持舒适的视觉比例

##### 头部设计
```tsx
<div className="
  backdrop-blur-xl
  bg-white/70 dark:bg-gray-900/70
  border-b border-gray-200/50
  px-6 py-5
">
  <h1 className="text-2xl font-semibold tracking-tight">
    Hint 设置
  </h1>
  <p className="text-sm text-gray-500 mt-1">
    配置 AI 文本优化助手
  </p>
</div>
```

**特点**：
- 毛玻璃效果的头部
- 标题 + 副标题的层次结构
- 底部分割线

##### 表单控件
```tsx
<input className="
  px-4 py-3
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-xl
  focus:ring-2 focus:ring-blue-500
  focus:border-transparent
  transition-all duration-200
">
```

**特点**：
- 充足的内边距（py-3）
- 大圆角（rounded-xl）
- 清晰的焦点状态
- 平滑的过渡动画

##### 密码可见性切换
```tsx
<button className="
  absolute right-3 top-1/2 -translate-y-1/2
  p-2 rounded-lg
  hover:bg-gray-100 dark:hover:bg-gray-700
  transition-all duration-200
">
  <svg className="w-5 h-5">...</svg>
</button>
```

**特点**：
- 眼睛图标（显示/隐藏）
- 圆形背景 hover 效果
- 绝对定位在输入框右侧

##### 保存按钮
```tsx
<button className="
  w-full py-3.5 px-4
  bg-blue-500 dark:bg-blue-600
  hover:bg-blue-600
  active:scale-[0.98]
  rounded-xl
  shadow-lg shadow-blue-500/25
  hover:shadow-xl
  transition-all duration-200
">
  保存设置
</button>
```

**特点**：
- 全宽按钮
- 阴影带颜色（`shadow-blue-500/25`）
- 按压缩放效果
- hover 时阴影增强

---

## 动画系统

### 自定义动画

#### fadeIn（淡入）
```css
@keyframes fadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
```
**用途**：FloatingToolbar 出现

#### slideIn（滑入）
```css
@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```
**用途**：文本预览、错误消息、通知

#### scaleIn（缩放）
```css
@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```
**用途**：模态框、弹窗

### 过渡时间

```
快速：100-150ms  （微交互）
标准：200ms      （大多数交互）✨
缓慢：300ms      （复杂动画）
```

### 缓动函数

```
ease-out：适合入场动画  ✨
ease-in：适合退场动画
ease-in-out：适合持续动画
```

---

## 深色模式

### 实现方式
使用 Tailwind CSS 的 `dark:` 前缀，基于系统偏好自动切换。

### 颜色映射

| 元素 | 浅色模式 | 深色模式 |
|------|---------|---------|
| 主背景 | white / gray-50 | gray-900 / gray-800 |
| 卡片背景 | white/90 | gray-900/90 |
| 文本 | gray-900 | white |
| 次要文本 | gray-500 | gray-400 |
| 边框 | gray-200 | gray-700 |
| 输入框 | white | gray-800 |

### 特殊处理

#### 毛玻璃效果
```tsx
// 浅色模式：白色半透明
bg-white/90

// 深色模式：深灰半透明
dark:bg-gray-900/90
```

#### 阴影
深色模式下阴影更微妙，避免过于突兀。

---

## 可访问性

### 对比度
- 确保文本与背景的对比度符合 WCAG AA 标准（至少 4.5:1）
- 深色模式使用 gray-400 而非 gray-500 提升可读性

### 焦点状态
所有交互元素都有清晰的焦点指示：
```tsx
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
```

### 禁用状态
```tsx
disabled:opacity-60 disabled:cursor-not-allowed
```

### 图标辅助
所有图标按钮都有 `title` 属性提供文字说明。

---

## 响应式设计

### 固定尺寸
- **Popup**: 420px × 500px
- **FloatingToolbar**: 根据内容自适应

### 最大宽度
```tsx
max-w-md  // 文本预览和错误消息
```

---

## 性能优化

### CSS 优化
- 使用 Tailwind JIT 模式，只生成使用的类
- 避免使用 `@apply`，直接使用工具类

### 动画性能
- 优先使用 `transform` 和 `opacity`（GPU 加速）
- 避免动画 `width`、`height` 等会触发重排的属性

### 图标优化
- 使用内联 SVG 而非图标字体
- SVG 路径优化，减少节点数

---

## 设计资源

### 参考文档
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SF Symbols](https://developer.apple.com/sf-symbols/)

### 设计工具
- Figma
- Sketch
- Adobe XD

---

## 更新日志

### v2.0 - 2024 年更新
- ✅ 重新设计所有组件，遵循苹果设计规范
- ✅ 添加毛玻璃效果（backdrop-blur）
- ✅ 更新图标系统（SVG 代替 emoji）
- ✅ 增强动画效果
- ✅ 优化深色模式
- ✅ 提升可访问性

---

## 维护指南

### 添加新组件
1. 遵循现有设计模式
2. 使用统一的圆角（xl/2xl）
3. 添加 hover 和 active 状态
4. 支持深色模式
5. 添加过渡动画

### 颜色使用
```tsx
// ✅ 推荐
bg-white dark:bg-gray-800

// ❌ 不推荐
bg-[#ffffff]  // 避免使用自定义颜色
```

### 间距使用
```tsx
// ✅ 推荐
p-4 gap-2.5

// ❌ 不推荐
p-[15px]  // 避免使用任意值
```

---

## 总结

本设计系统致力于提供：
- 🎨 **优雅的视觉体验**：干净、现代、精致
- 🚀 **流畅的交互**：平滑动画、即时反馈
- 🌓 **完美的深色模式**：舒适的夜间阅读
- ♿ **良好的可访问性**：所有人都能轻松使用
- 📱 **苹果式的品质感**：媲美原生应用的体验
