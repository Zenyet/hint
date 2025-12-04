/**
 * NanoBanana 预设提示词
 * 来源：
 * - https://github.com/JimmyLv/awesome-nano-banana
 * - https://github.com/ZHO-ZHO-ZHO/ZHO-nano-banana-Creation
 * - https://github.com/xianyu110/awesome-nanobananapro-prompts
 */

export interface NanoBananaPrompt {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  category: string;
}

export const nanoBananaPrompts: NanoBananaPrompt[] = [
  {
    id: 'creative_ad',
    name: '创意广告',
    icon: '🎨',
    description: '将真实物体与手绘涂鸦结合的极简广告',
    category: 'creative',
    prompt: 'A minimalist advertisement on clean white background. A real object integrates into hand-drawn black ink doodle using loose, playful lines. The doodle concept interacts with the object cleverly. Include bold black ad copy text at top or center. Place brand logo clearly at bottom. Visual should be clean, fun, high-contrast, and conceptually smart.'
  },
  {
    id: 'portrait_art',
    name: '黑白肖像艺术',
    icon: '📸',
    description: '高分辨率黑白肖像艺术摄影',
    category: 'photography',
    prompt: 'High-resolution black and white portrait artwork in editorial fine art photography style. Soft gradient background transitions from mid-gray to nearly white, creating depth and tranquility. Fine film grain adds analog softness. Blurred face emerges from shadows—only partial visibility (eye, cheekbone, lips). Gentle diffused light caresses features. Ample negative space. Abstract yet deeply human atmosphere, intimate and timeless.'
  },
  {
    id: 'frosted_glass',
    name: '磨砂玻璃剪影',
    icon: '🪟',
    description: '通过磨砂玻璃的模糊剪影效果',
    category: 'photography',
    prompt: 'Black and white photograph showing blurred silhouette of [SUBJECT] behind frosted translucent surface. [PART] is sharply defined and pressed against surface, creating stark contrast with hazy, indistinct figure. Soft gradient gray background enhances mysterious, artistic atmosphere.'
  },
  {
    id: 'knitted_doll',
    name: '针织玩偶',
    icon: '🧸',
    description: '手工编织的可爱玩偶特写',
    category: 'craft',
    prompt: 'Close-up professional photograph showcasing hand-crocheted yarn doll cradled by two hands. Doll has rounded shape featuring cute chibi character image with vivid colors and rich details. Hands are natural and gentle with visible finger postures, realistic skin texture, light/shadow transitions. Slightly blurred background shows warm wooden tabletop and natural window light, conveying intimate warmth and exquisite craftsmanship.'
  },
  {
    id: 'anime_figure',
    name: '动漫手办',
    icon: '🎭',
    description: '将照片转换为桌面动漫手办',
    category: 'character',
    prompt: 'Generate anime-style figure photo on desktop, casual snapshot perspective as if taken with mobile phone. Figure based on attached character photo, accurately reproducing full body posture, facial expression, and clothing style. Entire figure fully rendered. Exquisite and detailed design with natural soft gradient colors and fine textures. Japanese anime style, rich detail, realistic textures, beautiful appearance.'
  },
  {
    id: 'bobblehead',
    name: '摇头娃娃',
    icon: '🎪',
    description: '将自拍转换为摇头娃娃',
    category: 'character',
    prompt: 'Turn this photo into a bobblehead: enlarge head slightly, keep face accurate and cartoonify body. Place it on a bookshelf.'
  },
  {
    id: 'animal_selfie',
    name: '动物自拍',
    icon: '🦁',
    description: '三只动物在地标前的自拍',
    category: 'fun',
    prompt: 'Close-up selfie of three [animal type] with different expressions in front of iconic [landmark], taken at golden hour with cinematic lighting. Animals positioned close to camera with heads touching, mimicking selfie pose, showing joyful, surprised, and calm expressions. Background features full architectural detail of [landmark], softly illuminated, warm ambient atmosphere. Photographic realistic cartoon style, high detail, 1:1 aspect ratio.'
  },
  {
    id: 'action_figure_packaging',
    name: '手办包装展示',
    icon: '📦',
    description: '将照片转换为手办，带包装和建模过程',
    category: 'character',
    prompt: 'turn this photo into a character figure. Behind it, place a box with the character\'s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible'
  },
  {
    id: 'architecture_model',
    name: '建筑模型',
    icon: '🏛️',
    description: '将建筑照片转换为3D模型展示',
    category: 'architecture',
    prompt: 'convert this photo into a architecture model. Behind the model, there should be a cardboard box with an image of the architecture from the photo on it. There should also be a computer, with the content on the computer screen showing the Blender modeling process of the figurine. In front of the cardboard box, place a cardstock and put the architecture model from the photo I provided on it. I hope the PVC material can be clearly presented. It would be even better if the background is indoors.'
  },
  {
    id: 'product_poster',
    name: '产品海报',
    icon: '✨',
    description: '高端产品摄影海报设计',
    category: 'commercial',
    prompt: '为这款产品设计产品海报。产品侧立放置的超近景特写，清晰展现质感与细节。米色背景，周围缭绕棕色透明轻纱，搭配蕨类植��、沉香枯木与铃兰。4K超清，静物摄影，昏暗氛围，光线追踪。海报标题使用极细衬线字体。'
  },
  {
    id: 'y2k_poster',
    name: 'Y2K风格海报',
    icon: '💿',
    description: '酸性设计/Y2K美学海报',
    category: 'design',
    prompt: '请分析我上传的这张照片，并将其转换成一张现代风格的平面设计海报。主体处理：首先，将主体从原始背景中精确地抠出来，作为海报的核心主体。背景改造：将原始背景替换为一个抽象的、具有毛玻璃质感的背景。核心构图：在主体的后面，添加一个醒目的纯色矩形色块。风格统一：确保整个海报的风格是Y2K美学或酸性设计。'
  },
  {
    id: 'character_design',
    name: '角色设计表',
    icon: '📋',
    description: '生成完整的角色设计文档',
    category: 'character',
    prompt: '生成完整的角色设计表，包括：角色比例图、三视图（正面、侧面、背面）、表情设计（至少6种表情）、动作设计（至少4个动态姿势）、服装细节设计。保持角色风格统一，细节丰富。'
  },
  {
    id: 'illustration_integration',
    name: '插画融合',
    icon: '🎨',
    description: '将插画角色融入真实场景',
    category: 'creative',
    prompt: '在图中加上一对情侣坐在座位上开心的喝咖啡和交谈，人物都是粗线稿可爱插画风格，与真实环境自然融合。'
  },
  {
    id: 'manga_coloring',
    name: '漫画上色翻译',
    icon: '🎨',
    description: '将漫画翻译并上色',
    category: 'manga',
    prompt: '将图片上的文字翻译为中文，并为黑白漫画上色，保持原画风格，其他不变。'
  },
  {
    id: 'ip_fusion',
    name: 'IP角色融合',
    icon: '🤝',
    description: '将不同IP的角色融合在一起',
    category: 'character',
    prompt: '将两个不同IP的角色放在同一个场景中互动。保持各自的特征，画风协调统一，场景设计符合两个角色的世界观。精致细节，高质量渲染。'
  },
  {
    id: 'chinese_typography',
    name: '中文字体设计',
    icon: '🖋️',
    description: '多种中文字体效果展示',
    category: 'typography',
    prompt: '为「[文字内容]」设计创意字体效果。要求：使用多种字体风格（如毛笔书法、霓虹灯、立体字、渐变字等），每种风格都要有独特的视觉表现。整体排版美观，富有设计感。'
  },
  {
    id: 'travel_journal',
    name: '旅行手帐',
    icon: '✈️',
    description: '拼贴风格的旅行笔记',
    category: 'lifestyle',
    prompt: '帮我生成一张拼贴手帐风格的旅游笔记，上面记录着自己的行程以及路上的照片等，文字有中文、英语等多语言混合。手绘元素、贴纸、标签、日期戳、涂鸦装饰，整体氛围温馨有趣。'
  },
  {
    id: 'weather_ui',
    name: '天气UI设计',
    icon: '☀️',
    description: '现代化天气应用界面',
    category: 'ui',
    prompt: '设计一个现代化的天气应用UI界面。包括：当前温度、天气状况图标、未来7天预报、温度曲线图、紫外线指数、空气质量等信息。采用渐变背景，玻璃拟态设计风格，界面清爽美观。'
  },
  {
    id: 'portrait_beauty',
    name: '人像美化',
    icon: '💄',
    description: '人像编辑和美颜增强',
    category: 'photography',
    prompt: '对人像进行专业级美化：轻度美颜、瘦脸、肤色均匀、眼睛提亮、牙齿美白。保持自然真实，避免过度修饰。可选：发型调整、妆容增强、配饰添加。'
  },
  {
    id: 'scene_integration',
    name: '场景融合',
    icon: '🏠',
    description: '将多个物体融合到室内场景',
    category: 'interior',
    prompt: '将这些家具/产品融洽地放到一个协调的室内场景中。注意：光线统一、透视准确、风格协调、空间布局合理。采用专业室内摄影风格，自然光照，高质量渲染。'
  }
];

// 按类别分组
export const nanoBananaCategories = {
  creative: '创意设计',
  photography: '摄影艺术',
  character: '角色创作',
  commercial: '商业设计',
  design: '平面设计',
  craft: '手工艺品',
  fun: '趣味创作',
  architecture: '建筑设计',
  manga: '漫画处理',
  typography: '字体设计',
  lifestyle: '生活记录',
  ui: 'UI设计',
  interior: '室内设计'
};

// 获取特定类别的提示词
export function getPromptsByCategory(category: string): NanoBananaPrompt[] {
  return nanoBananaPrompts.filter(p => p.category === category);
}

// 根据ID获取提示词
export function getPromptById(id: string): NanoBananaPrompt | undefined {
  return nanoBananaPrompts.find(p => p.id === id);
}
