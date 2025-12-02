/**
 * 各网站提示词配置
 * 根据不同的AI平台提供对应的提示词
 */

export interface SitePrompt {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  icon: string;
  prompts: SitePrompt[];
}

// 通用提示词（适用于所有网站）
const commonPrompts: SitePrompt[] = [
  {
    id: 'creative_ad',
    name: '创意广告',
    icon: '🎨',
    description: '将真实物体与手绘涂鸦结合的极简广告',
    prompt: 'A minimalist advertisement on clean white background. A real object integrates into hand-drawn black ink doodle using loose, playful lines. The doodle concept interacts with the object cleverly. Include bold black ad copy text at top or center. Place brand logo clearly at bottom. Visual should be clean, fun, high-contrast, and conceptually smart.'
  },
  {
    id: 'portrait_art',
    name: '黑白肖像艺术',
    icon: '📸',
    description: '高分辨率黑白肖像艺术摄影',
    prompt: 'High-resolution black and white portrait artwork in editorial fine art photography style. Soft gradient background transitions from mid-gray to nearly white, creating depth and tranquility. Fine film grain adds analog softness. Blurred face emerges from shadows—only partial visibility (eye, cheekbone, lips). Gentle diffused light caresses features. Ample negative space. Abstract yet deeply human atmosphere, intimate and timeless.'
  }
];

// NanoBanana 提示词
const nanoBananaPrompts: SitePrompt[] = [
  {
    id: 'creative_ad',
    name: '创意广告',
    icon: '🎨',
    description: '将真实物体与手绘涂鸦结合的极简广告',
    prompt: 'A minimalist advertisement on clean white background. A real object integrates into hand-drawn black ink doodle using loose, playful lines. The doodle concept interacts with the object cleverly. Include bold black ad copy text at top or center. Place brand logo clearly at bottom. Visual should be clean, fun, high-contrast, and conceptually smart.'
  },
  {
    id: 'portrait_art',
    name: '黑白肖像艺术',
    icon: '📸',
    description: '高分辨率黑白肖像艺术摄影',
    prompt: 'High-resolution black and white portrait artwork in editorial fine art photography style. Soft gradient background transitions from mid-gray to nearly white, creating depth and tranquility. Fine film grain adds analog softness. Blurred face emerges from shadows—only partial visibility (eye, cheekbone, lips). Gentle diffused light caresses features. Ample negative space. Abstract yet deeply human atmosphere, intimate and timeless.'
  },
  {
    id: 'frosted_glass',
    name: '磨砂玻璃剪影',
    icon: '🪟',
    description: '通过磨砂玻璃的模糊剪影效果',
    prompt: 'Black and white photograph showing blurred silhouette of [SUBJECT] behind frosted translucent surface. [PART] is sharply defined and pressed against surface, creating stark contrast with hazy, indistinct figure. Soft gradient gray background enhances mysterious, artistic atmosphere.'
  },
  {
    id: 'knitted_doll',
    name: '针织玩偶',
    icon: '🧸',
    description: '手工编织的可爱玩偶特写',
    prompt: 'Close-up professional photograph showcasing hand-crocheted yarn doll cradled by two hands. Doll has rounded shape featuring cute chibi character image with vivid colors and rich details. Hands are natural and gentle with visible finger postures, realistic skin texture, light/shadow transitions. Slightly blurred background shows warm wooden tabletop and natural window light, conveying intimate warmth and exquisite craftsmanship.'
  },
  {
    id: 'anime_figure',
    name: '动漫手办',
    icon: '🎭',
    description: '将照片转换为桌面动漫手办',
    prompt: 'Generate anime-style figure photo on desktop, casual snapshot perspective as if taken with mobile phone. Figure based on attached character photo, accurately reproducing full body posture, facial expression, and clothing style. Entire figure fully rendered. Exquisite and detailed design with natural soft gradient colors and fine textures. Japanese anime style, rich detail, realistic textures, beautiful appearance.'
  },
  {
    id: 'bobblehead',
    name: '摇头娃娃',
    icon: '🎪',
    description: '将自拍转换为摇头娃娃',
    prompt: 'Turn this photo into a bobblehead: enlarge head slightly, keep face accurate and cartoonify body. Place it on a bookshelf.'
  },
  {
    id: 'animal_selfie',
    name: '动物自拍',
    icon: '🦁',
    description: '三只动物在地标前的自拍',
    prompt: 'Close-up selfie of three [animal type] with different expressions in front of iconic [landmark], taken at golden hour with cinematic lighting. Animals positioned close to camera with heads touching, mimicking selfie pose, showing joyful, surprised, and calm expressions. Background features full architectural detail of [landmark], softly illuminated, warm ambient atmosphere. Photographic realistic cartoon style, high detail, 1:1 aspect ratio.'
  },
  {
    id: 'action_figure_packaging',
    name: '手办包装展示',
    icon: '📦',
    description: '将照片转换为手办，带包装和建模过程',
    prompt: 'turn this photo into a character figure. Behind it, place a box with the character\'s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible'
  },
  {
    id: 'architecture_model',
    name: '建筑模型',
    icon: '🏛️',
    description: '将建筑照片转换为3D模型展示',
    prompt: 'convert this photo into a architecture model. Behind the model, there should be a cardboard box with an image of the architecture from the photo on it. There should also be a computer, with the content on the computer screen showing the Blender modeling process of the figurine. In front of the cardboard box, place a cardstock and put the architecture model from the photo I provided on it. I hope the PVC material can be clearly presented. It would be even better if the background is indoors.'
  },
  {
    id: 'product_poster',
    name: '产品海报',
    icon: '✨',
    description: '高端产品摄影海报设计',
    prompt: '为这款产品设计产品海报。产品侧立放置的超近景特写，清晰展现质感与细节。米色背景，周围缭绕棕色透明轻纱，搭配蕨类植物、沉香枯木与铃兰。4K超清，静物摄影，昏暗氛围，光线追踪。海报标题使用极细衬线字体。'
  }
];

// ChatGPT 专用提示词
const chatgptPrompts: SitePrompt[] = [
  ...commonPrompts,
  {
    id: 'code_review',
    name: '代码审查',
    icon: '🔍',
    description: '专业的代码审查和优化建议',
    prompt: '请帮我审查以下代码，指出潜在的问题、安全隐患和优化建议。请按照以下格式回复：\n1. 代码问题\n2. 安全隐患\n3. 性能优化\n4. 代码风格\n5. 改进建议'
  },
  {
    id: 'explain_like_five',
    name: '简单解释',
    icon: '👶',
    description: '用简单的语言解释复杂概念',
    prompt: '请用通俗易懂的语言解释这个概念，就像在给一个5岁的孩子讲解一样。使用类比和日常生活中的例子来帮助理解。'
  },
  {
    id: 'writing_assistant',
    name: '写作助手',
    icon: '✍️',
    description: '帮助改进文章的结构和表达',
    prompt: '请帮我改进这段文字的表达。请注意：\n1. 保持原意不变\n2. 改善语法和表达\n3. 提高可读性\n4. 让文字更加流畅自然'
  }
];

// Claude 专用提示词
const claudePrompts: SitePrompt[] = [
  ...commonPrompts,
  {
    id: 'deep_analysis',
    name: '深度分析',
    icon: '🔬',
    description: '对复杂问题进行深入分析',
    prompt: '请对这个问题进行深入分析，考虑多个角度和可能的影响因素。请提供：\n1. 问题背景\n2. 核心分析\n3. 不同视角\n4. 潜在影响\n5. 建议方案'
  },
  {
    id: 'research_summary',
    name: '研究总结',
    icon: '📚',
    description: '帮助总结研究文献或资料',
    prompt: '请帮我总结这份资料的要点。请包括：\n1. 主要论点\n2. 关键发现\n3. 方法论\n4. 结论\n5. 局限性和未来方向'
  },
  {
    id: 'socratic_dialogue',
    name: '苏格拉底式对话',
    icon: '🤔',
    description: '通过提问引导深入思考',
    prompt: '让我们进行苏格拉底式的对话。请通过提问的方式帮助我深入思考这个问题，而不是直接给出答案。每次只问一个问题，等我回答后再继续下一个问题。'
  }
];

// Gemini 专用提示词
const geminiPrompts: SitePrompt[] = [
  ...nanoBananaPrompts, // Gemini 擅长图像，使用 NanoBanana 提示词
  {
    id: 'multimodal_analysis',
    name: '多模态分析',
    icon: '🖼️',
    description: '同时分析文本和图像内容',
    prompt: '请分析这张图片的内容，并结合我的问题给出详细的回答。请描述：\n1. 图片主要内容\n2. 细节特征\n3. 与问题的关联\n4. 你的分析和建议'
  }
];

// DeepSeek 专用提示词
const deepseekPrompts: SitePrompt[] = [
  ...commonPrompts,
  {
    id: 'math_problem',
    name: '数学问题',
    icon: '🧮',
    description: '解决数学和逻辑问题',
    prompt: '请帮我解决这道数学题。请提供：\n1. 题目分析\n2. 解题思路\n3. 详细步骤\n4. 最终答案\n5. 举一反三的类似例题'
  },
  {
    id: 'programming_help',
    name: '编程帮助',
    icon: '💻',
    description: '编程问题解答和代码实现',
    prompt: '请帮我解决这个编程问题。请提供：\n1. 问题分析\n2. 算法思路\n3. 代码实现\n4. 复杂度分析\n5. 边界情况处理'
  }
];

// 腾讯元宝专用提示词
const yuanbaoPrompts: SitePrompt[] = [
  ...commonPrompts,
  {
    id: 'chinese_writing',
    name: '中文写作',
    icon: '📝',
    description: '中文内容创作和润色',
    prompt: '请帮我创作/润色这段中文内容。要求：\n1. 语言优美流畅\n2. 符合中文表达习惯\n3. 内容准确生动\n4. 适合目标读者群体'
  },
  {
    id: 'business_doc',
    name: '商务文档',
    icon: '📊',
    description: '商务文档起草和优化',
    prompt: '请帮我撰写/优化这份商务文档。要求：\n1. 格式规范专业\n2. 语言得体\n3. 逻辑清晰\n4. 重点突出'
  }
];

// Grok 专用提示词
const grokPrompts: SitePrompt[] = [
  ...commonPrompts,
  {
    id: 'trend_analysis',
    name: '趋势分析',
    icon: '📈',
    description: '分析当前热点和趋势',
    prompt: '请分析这个话题的当前趋势和发展动向。包括：\n1. 背景介绍\n2. 当前状态\n3. 主要观点\n4. 未来预测\n5. 相关建议'
  },
  {
    id: 'witty_response',
    name: '幽默回复',
    icon: '😄',
    description: '用幽默的方式回应问题',
    prompt: '请用幽默风趣的方式回答这个问题，但同时确保信息的准确性。可以加入一些俏皮的比喻或轻松的例子。'
  }
];

// 网站配置
export const siteConfigs: SiteConfig[] = [
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    icon: '🍌',
    prompts: nanoBananaPrompts
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    prompts: chatgptPrompts
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    prompts: claudePrompts
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    prompts: geminiPrompts
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔍',
    prompts: deepseekPrompts
  },
  {
    id: 'yuanbao',
    name: '腾讯元宝',
    icon: '💎',
    prompts: yuanbaoPrompts
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '🚀',
    prompts: grokPrompts
  }
];

// 根据网站ID获取配置
export function getSiteConfig(siteId: string): SiteConfig | undefined {
  return siteConfigs.find(site => site.id === siteId);
}

// 根据网站ID获取提示词列表
export function getSitePrompts(siteId: string): SitePrompt[] {
  const config = getSiteConfig(siteId);
  return config?.prompts || [];
}

// 根据当前URL自动检测网站
export function detectSiteFromUrl(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
    return 'chatgpt';
  }
  if (hostname.includes('claude.ai')) {
    return 'claude';
  }
  if (hostname.includes('gemini.google.com')) {
    return 'gemini';
  }
  if (hostname.includes('deepseek.com')) {
    return 'deepseek';
  }
  if (hostname.includes('yuanbao.tencent.com')) {
    return 'yuanbao';
  }
  if (hostname.includes('grok.com')) {
    return 'grok';
  }

  // 默认返回 NanoBanana
  return 'nanobanana';
}
