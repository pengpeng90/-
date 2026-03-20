import { StylingOption, Gender } from './types';

// Primary School Images (小学生)
export const PRI_MALE_START_IMAGE_URL = "/pri-male.png";
export const PRI_FEMALE_START_IMAGE_URL = "/pri-female.png";

// Middle School Images (中学生)
export const MID_MALE_START_IMAGE_URL = "/mid-male.png";
export const MID_FEMALE_START_IMAGE_URL = "/mid-female.png";

// Fallbacks for image loading failures
export const MALE_FALLBACK = PRI_MALE_START_IMAGE_URL;
export const FEMALE_FALLBACK = PRI_FEMALE_START_IMAGE_URL;

// Hair Options (Expanded to ~32 options)
export const MALE_HAIR_OPTIONS: StylingOption[] = [
  // --- Existing ---
  { id: 'clean-cut', label: '清爽短发', description: '干净利落的学生短发', icon: '👦', promptModifier: 'Change hairstyle to a neat and tidy short cut.' },
  { id: 'messy-spikes', label: '凌乱碎发', description: '带点俏皮的运动碎发', icon: '🧒', promptModifier: 'Change hairstyle to playful messy spikes.' },
  { id: 'korean-part', label: '韩式中分', description: '流行的逗号刘海/中分', icon: '💇‍♂️', promptModifier: 'Change hairstyle to a trendy K-pop style middle part (comma hair).' },
  { id: 'curly-top', label: '纹理卷发', description: '头顶微卷的时尚发型', icon: '🦱', promptModifier: 'Change hairstyle to short with curly top perm.' },
  { id: 'undercut', label: '铲青侧背', description: '侧面推短的现代发型', icon: '💈', promptModifier: 'Change hairstyle to a modern undercut with short sides.' },
  { id: 'samurai-bun', label: '小丸子头', description: '扎在脑后的小辫子', icon: '🍡', promptModifier: 'Change hairstyle to a small man bun or samurai knot.' },
  { id: 'wolf-cut-m', label: '狼尾鲻鱼头', description: '层次感丰富的潮流发型', icon: '🐺', promptModifier: 'Change hairstyle to a trendy wolf cut with layers.' },
  { id: 'side-swept', label: '侧分刘海', description: '帅气的侧分造型', icon: '💨', promptModifier: 'Change hairstyle to stylish side swept hair.' },
  { id: 'buzz-cut', label: '寸头', description: '极短的寸头造型', icon: '✂️', promptModifier: 'Change hairstyle to a very short buzz cut.' },
  { id: 'bowl-cut', label: '锅盖头', description: '可爱的蘑菇头', icon: '🍄', promptModifier: 'Change hairstyle to a cute bowl cut.' },
  { id: 'long-layered', label: '艺术长发', description: '及肩的层次感长发', icon: '🎸', promptModifier: 'Change hairstyle to shoulder-length artistic layered hair.' },
  { id: 'dreadlocks', label: '短脏辫', description: '酷酷的嘻哈脏辫', icon: '🦁', promptModifier: 'Change hairstyle to cool short dreadlocks.' },
  
  // --- New Additions (20 Styles) ---
  { id: 'tin-foil-perm', label: '锡纸烫', description: '蓬松立体的渣男烫', icon: '🔥', promptModifier: 'Change hairstyle to a trendy "tin foil perm" with frizzy texture and volume.' },
  { id: 'texture-perm', label: '摩根碎盖', description: '蓬松自然的纹理烫', icon: '☁️', promptModifier: 'Change hairstyle to a textured crop with loose perm volume on top (Morgan Perm).' },
  { id: 'chestnut-cut', label: '栗子头', description: '韩剧男主同款短发', icon: '🌰', promptModifier: 'Change hairstyle to a cropped chestnut cut (Park Saeroyi style).' },
  { id: 'french-crop', label: '法式寸头', description: '浪漫又硬朗的短发', icon: '🇫🇷', promptModifier: 'Change hairstyle to a stylish French Crop with a short fringe.' },
  { id: 'two-block-dandy', label: '丹迪头', description: '乖巧厚刘海暖男风', icon: '🧸', promptModifier: 'Change hairstyle to a thick, heavy fringed Dandy cut (Two-block).' },
  { id: 'spiky-fringe', label: '美式前刺', description: '清爽精神的前刺发型', icon: '⚡', promptModifier: 'Change hairstyle to a short cut with the front fringe spiked forward and up.' },
  { id: 'soft-mohawk', label: '软莫西干', description: '两侧短中间长的酷盖', icon: '🤘', promptModifier: 'Change hairstyle to a soft, modern faux-hawk.' },
  { id: 'slick-back', label: '大背头', description: '成熟稳重的后梳发型', icon: '🕴️', promptModifier: 'Change hairstyle to a classic slicked-back style.' },
  { id: 'side-part-classic', label: '三七分', description: '经典的复古分头', icon: '🧐', promptModifier: 'Change hairstyle to a classic 70/30 side part.' },
  { id: 'japanese-medium', label: '日系中长', description: '慵懒的日系少年感', icon: '🗾', promptModifier: 'Change hairstyle to a medium-length Japanese style with wispy ends.' },
  { id: 'half-bun', label: '半扎丸子', description: '艺术气息的半扎发', icon: '🖌️', promptModifier: 'Change hairstyle to a half-up man bun with loose hair at the back.' },
  { id: 'curtain-bangs-m', label: '八字刘海', description: '修饰脸型的分刘海', icon: '🍃', promptModifier: 'Change hairstyle to a middle part with curtain bangs framing the face.' },
  { id: 'shaggy-mullet', label: '复古鲻鱼', description: '摇滚风的Shag Mullet', icon: '🎸', promptModifier: 'Change hairstyle to a retro shaggy mullet.' },
  { id: 'afro-short', label: '黑人烫', description: '个性十足的小卷爆炸头', icon: '🥦', promptModifier: 'Change hairstyle to a short, tight afro-textured perm.' },
  { id: 'ivy-league', label: '常春藤头', description: '学院风绅士短发', icon: '🎓', promptModifier: 'Change hairstyle to a neat Ivy League cut.' },
  { id: 'wet-look', label: '湿发造型', description: '性感的湿发背头', icon: '💧', promptModifier: 'Change hairstyle to a trendy wet-look style pushed back.' },
  { id: 'comma-textured', label: '纹理逗号', description: '带卷度的逗号刘海', icon: '🥓', promptModifier: 'Change hairstyle to a textured comma hair style with wavy bangs.' },
  { id: 'pompadour', label: '飞机头', description: '前额头发上梳的造型', icon: '✈️', promptModifier: 'Change hairstyle to a modern pompadour.' },
  { id: 'messy-bedhead', label: '刚睡醒', description: '自然的凌乱感', icon: '🛌', promptModifier: 'Change hairstyle to a "just woke up" messy bedhead look.' },
  { id: 'bandana-style', label: '嘻哈发带', description: '戴着运动发带的造型', icon: '🏀', promptModifier: 'Change hairstyle to messy hair held back by a sports headband.' }
];

export const FEMALE_HAIR_OPTIONS: StylingOption[] = [
  // --- Existing ---
  { id: 'long-straight', label: '黑长直', description: '柔顺的黑色长直发', icon: '👩', promptModifier: 'Change hairstyle to long smooth straight hair.' },
  { id: 'bob-cut', label: '波波头', description: '经典的齐下巴短发', icon: '💇‍♀️', promptModifier: 'Change hairstyle to a classic chin-length bob cut.' },
  { id: 'hime-cut', label: '公主切', description: '优雅的姬发式/公主切', icon: '🎎', promptModifier: 'Change hairstyle to a Hime cut with blunt bangs and sidelocks.' },
  { id: 'twin-tails', label: '双马尾', description: '可爱的双马尾造型', icon: '👧', promptModifier: 'Change hairstyle to cute twin ponytails.' },
  { id: 'space-buns', label: '哪吒头/丸子', description: '头顶两个可爱的丸子', icon: '🐼', promptModifier: 'Change hairstyle to double space buns on top of head.' },
  { id: 'ponytail', label: '高马尾', description: '元气满满的运动马尾', icon: '👱‍♀️', promptModifier: 'Change hairstyle to a sporty high ponytail.' },
  { id: 'braids', label: '双麻花辫', description: '田园风格的编发', icon: '🧶', promptModifier: 'Change hairstyle to twin braids.' },
  { id: 'wavy-shoulder', label: '齐肩卷发', description: '温柔的微卷中发', icon: '〰️', promptModifier: 'Change hairstyle to shoulder-length wavy hair.' },
  { id: 'pixie-cut', label: '精灵短发', description: '干练帅气的超短发', icon: '✨', promptModifier: 'Change hairstyle to a short chic pixie cut.' },
  { id: 'loose-bun', label: '慵懒丸子头', description: '随意的头顶盘发', icon: '🎀', promptModifier: 'Change hairstyle to a casual loose messy bun.' },
  { id: 'half-up', label: '半扎发', description: '温婉的半扎半披发型', icon: '🎠', promptModifier: 'Change hairstyle to a half-up half-down style.' },
  { id: 'princess-curls', label: '螺旋卷发', description: '华丽的公主卷', icon: '🌀', promptModifier: 'Change hairstyle to elegant princess ringlet curls.' },
  
  // --- New Additions (20 Styles) ---
  { id: 'air-bangs-long', label: '空气刘海', description: '韩系空气刘海长发', icon: '🌬️', promptModifier: 'Change hairstyle to long hair with wispy see-through air bangs.' },
  { id: 'clavicle-cut', label: '初恋锁骨发', description: '清新减龄的锁骨长度', icon: '🦴', promptModifier: 'Change hairstyle to a fresh clavicle-length cut with soft ends.' },
  { id: 'boxer-braids', label: '拳击辫', description: '酷飒的紧实双编发', icon: '🥊', promptModifier: 'Change hairstyle to tight double dutch braids (boxer braids).' },
  { id: 'wool-curls', label: '羊毛卷', description: '复古可爱的蓬松卷', icon: '🐑', promptModifier: 'Change hairstyle to voluminous vintage wool curls (hippie perm).' },
  { id: 'egg-roll', label: '蛋卷头', description: '整齐的波浪纹理', icon: '🧇', promptModifier: 'Change hairstyle to uniform "egg roll" waves (mermaid waves).' },
  { id: 'fishtail-braid', label: '侧边鱼骨', description: '温柔的侧边编发', icon: '🧜‍♀️', promptModifier: 'Change hairstyle to a single loose fishtail braid over one shoulder.' },
  { id: 'micro-bangs', label: '眉上刘海', description: '古灵精怪的超短刘海', icon: '✂️', promptModifier: 'Change hairstyle to a bob with super short micro-bangs above eyebrows.' },
  { id: 'c-curl-bob', label: '内扣短发', description: '乖巧的学生头', icon: '🍄', promptModifier: 'Change hairstyle to a smooth bob with ends curled inward (C-curl).' },
  { id: 'wolf-cut-f', label: '高层次狼尾', description: '又酷又飒的层次剪', icon: '🐺', promptModifier: 'Change hairstyle to a trendy female wolf cut with high layers.' },
  { id: 'butterfly-cut', label: '蝴蝶层次', description: '修饰脸型的外翻层次', icon: '🦋', promptModifier: 'Change hairstyle to a voluminous butterfly cut with face-framing layers.' },
  { id: 'bubble-braid', label: '灯笼辫', description: '可爱的泡泡马尾', icon: '🎈', promptModifier: 'Change hairstyle to a bubble braid ponytail.' },
  { id: 'low-ponytail', label: '韩系低马尾', description: '气质温柔的低扎发', icon: '🍂', promptModifier: 'Change hairstyle to a loose, elegant low ponytail.' },
  { id: 'half-high-pony', label: '半扎高马尾', description: '元气女团风', icon: '🎤', promptModifier: 'Change hairstyle to a high half-ponytail (Ariana style).' },
  { id: 'curtain-bangs-w', label: '八字刘海', description: '法式慵懒大刘海', icon: '🥖', promptModifier: 'Change hairstyle to loose waves with sweeping curtain bangs.' },
  { id: 'side-ponytail', label: '侧马尾', description: '活泼的单侧扎发', icon: '🤸‍♀️', promptModifier: 'Change hairstyle to a high side ponytail.' },
  { id: 'headband-style', label: '发带造型', description: '戴着宽发带的披发', icon: '🎀', promptModifier: 'Change hairstyle to loose hair styled with a fabric headband.' },
  { id: 'tucked-ear', label: '别耳短发', description: '清新的露耳短发', icon: '👂', promptModifier: 'Change hairstyle to a short cut tucked behind one ear.' },
  { id: 'low-bun', label: '低丸子头', description: '知性优雅的低盘发', icon: '🩰', promptModifier: 'Change hairstyle to a neat low bun at the nape of the neck.' },
  { id: 'straight-layered', label: '层次直发', description: '轻盈的日系直发', icon: '📏', promptModifier: 'Change hairstyle to straight hair with textured, choppy layers.' },
  { id: 'messy-waves', label: '慵懒微卷', description: '自然刚睡醒的卷度', icon: '☕', promptModifier: 'Change hairstyle to messy, effortless beach waves.' }
];

// Expression Options (Translated)
export const EXPRESSION_OPTIONS: StylingOption[] = [
  { id: 'smile', label: '开心微笑', description: '温暖友好的笑容', icon: '😊', promptModifier: 'Change expression to a warm, friendly smile.' },
  { id: 'laugh', label: '开怀大笑', description: '张嘴大笑的样子', icon: '😄', promptModifier: 'Change expression to a big joyful laugh.' },
  { id: 'confident', label: '自信满满', description: '酷酷的自信神情', icon: '😎', promptModifier: 'Change expression to a confident, cool smirk.' },
  { id: 'shy', label: '害羞脸红', description: '羞涩、脸颊微红', icon: '😳', promptModifier: 'Change expression to shy, blushing and looking slightly down.' },
  { id: 'surprised', label: '惊讶', description: '瞪大眼睛很吃惊', icon: '😲', promptModifier: 'Change expression to a wide-eyed surprised look.' },
  { id: 'wink', label: '眨眼', description: '俏皮的眨眼', icon: '😉', promptModifier: 'Change expression to a playful wink.' },
  { id: 'determined', label: '坚定认真', description: '专注严肃的眼神', icon: '😠', promptModifier: 'Change expression to a focused and determined look.' },
  { id: 'bored', label: '无聊/面瘫', description: '没什么表情/发呆', icon: '😑', promptModifier: 'Change expression to a bored, deadpan look.' },
  { id: 'smug', label: '得意/坏笑', description: '调皮的歪嘴笑', icon: '😏', promptModifier: 'Change expression to a smug, playful grin.' },
  { id: 'love', label: '花痴/喜爱', description: '充满爱意的表情', icon: '😍', promptModifier: 'Change expression to an adoring, love-struck look.' },
  { id: 'silly', label: '调皮吐舌', description: '做鬼脸吐舌头', icon: '😜', promptModifier: 'Change expression to a silly face with tongue sticking out.' },
  { id: 'sleepy', label: '困倦', description: '打哈欠/睡眼惺忪', icon: '😪', promptModifier: 'Change expression to a sleepy, drowsy look.' }
];

// Facial Feature Options (Translated)
export const FEATURE_OPTIONS: StylingOption[] = [
  { id: 'none', label: '无特征', description: '保持面部干净', icon: '✨', promptModifier: 'No extra face features.' },
  { id: 'glasses', label: '圆框眼镜', description: '哈利波特同款眼镜', icon: '👓', promptModifier: 'Add stylish round glasses.' },
  { id: 'glasses-sq', label: '黑框眼镜', description: '粗框方形眼镜', icon: '🕶️', promptModifier: 'Add thick black square-rimmed glasses.' },
  { id: 'freckles', label: '小雀斑', description: '可爱的晒伤妆雀斑', icon: '☀️', promptModifier: 'Add cute freckles on cheeks.' },
  { id: 'blush', label: '宿醉腮红', description: '明显的面部红晕', icon: '☺️', promptModifier: 'Add prominent rosy blush to cheeks.' },
  { id: 'bandaid', label: '鼻梁创可贴', description: '鼻子上的小创可贴', icon: '🩹', promptModifier: 'Add a small cute band-aid on the nose bridge.' },
  { id: 'mole', label: '泪痣', description: '眼角下方的美人痣', icon: '⚫', promptModifier: 'Add a small beauty mark mole under one eye.' },
  { id: 'sticker', label: '脸颊贴纸', description: '脸上的星星贴纸', icon: '⭐', promptModifier: 'Add a small colorful star sticker on the cheek.' },
  { id: 'cat-whiskers', label: '猫须彩绘', description: '画在脸上的猫胡须', icon: '🐱', promptModifier: 'Add cute cat whisker face paint on cheeks.' },
  { id: 'scar', label: '断眉/伤痕', description: '眉毛上的酷酷伤痕', icon: '🗡️', promptModifier: 'Add a small cool scar on the eyebrow.' }
];

// Clothing Options (Translated)
export const CLOTHING_OPTIONS: StylingOption[] = [
  { id: 'casual-tee', label: '纯棉T恤', description: '简约舒适的T恤', icon: '👕', promptModifier: 'Change clothing to a simple cotton t-shirt.' },
  { id: 'hoodie', label: '连帽卫衣', description: '宽松舒适的卫衣', icon: '🧥', promptModifier: 'Change clothing to a cozy hoodie.' },
  { id: 'jacket', label: '牛仔外套', description: '酷酷的牛仔夹克', icon: '👖', promptModifier: 'Change clothing to a denim jacket over a t-shirt.' },
  { id: 'school-uniform', label: '西装校服', description: '整洁的西装和领带', icon: '👔', promptModifier: 'Change clothing to a smart school uniform blazer and tie.' },
  { id: 'sailor', label: '水手服', description: '日系水手校服', icon: '⚓', promptModifier: 'Change clothing to a japanese sailor-style school uniform.' },
  { id: 'sportswear', label: '运动球衣', description: '透气的运动背心', icon: '🎽', promptModifier: 'Change clothing to an athletic sports jersey.' },
  { id: 'dress', label: '连衣裙', description: '可爱的休闲裙装', icon: '👗', promptModifier: 'Change clothing to a cute casual dress.' },
  { id: 'overalls', label: '背带裤', description: '牛仔背带裤+条纹衫', icon: '👨‍🌾', promptModifier: 'Change clothing to denim overalls with a striped shirt underneath.' },
  { id: 'pajamas', label: '软萌睡衣', description: '舒适的家居服', icon: '🌙', promptModifier: 'Change clothing to cute pastel button-up pajamas.' },
  { id: 'kimono', label: '日式浴衣', description: '休闲和风浴衣', icon: '👘', promptModifier: 'Change clothing to a casual japanese yukata or kimono.' },
  { id: 'suit', label: '小西装', description: '正式的商务西装', icon: '💼', promptModifier: 'Change clothing to a sharp formal suit.' },
  { id: 'techwear', label: '机能风', description: '未来感赛博朋克装', icon: '🦾', promptModifier: 'Change clothing to futuristic cyberpunk techwear vest and straps.' },
  { id: 'hawaiian', label: '花衬衫', description: '热带风情夏威夷衫', icon: '🏝️', promptModifier: 'Change clothing to a colorful hawaiian aloha shirt.' },
  { id: 'detective', label: '侦探风衣', description: '米色长款风衣', icon: '🕵️', promptModifier: 'Change clothing to a beige detective trench coat.' }
];

// Accessory Options (Translated)
export const ACCESSORY_OPTIONS: StylingOption[] = [
  { id: 'cap', label: '棒球帽', description: '运动遮阳帽', icon: '🧢', promptModifier: 'Add a baseball cap.' },
  { id: 'beanie', label: '针织冷帽', description: '保暖的毛线帽', icon: '🧶', promptModifier: 'Add a knitted beanie hat.' },
  { id: 'headphones', label: '头戴耳机', description: '挂在脖子上的耳机', icon: '🎧', promptModifier: 'Add wireless headphones hanging around the neck.' },
  { id: 'scarf', label: '围巾', description: '温暖的围脖', icon: '🧣', promptModifier: 'Add a cozy scarf around the neck.' },
  { id: 'backpack', label: '双肩包', description: '露出背包带', icon: '🎒', promptModifier: 'Add backpack straps visible on shoulders.' },
  { id: 'choker', label: '项圈/Choker', description: '时尚的颈部饰品', icon: '🐈', promptModifier: 'Add a stylish black choker necklace.' },
  { id: 'bowtie', label: '领结', description: '可爱的蝴蝶结', icon: '🎀', promptModifier: 'Add a cute bow tie at the collar.' },
  { id: 'cat-ears', label: '猫耳发箍', description: '毛茸茸的猫耳朵', icon: '😼', promptModifier: 'Add a headband with cute cat ears.' },
  { id: 'crown', label: '小皇冠', description: '金色的迷你皇冠', icon: '👑', promptModifier: 'Add a small golden crown on the head.' },
  { id: 'mask', label: '潮牌口罩', description: '黑色面罩', icon: '😷', promptModifier: 'Add a black streetwear face mask on chin.' },
  { id: 'hair-clip', label: '花朵发卡', description: '可爱的花朵发饰', icon: '🌸', promptModifier: 'Add a cute flower hair clip.' },
  { id: 'goggles', label: '飞行护目镜', description: '戴在额头上的风镜', icon: '🥽', promptModifier: 'Add aviator goggles resting on the forehead.' }
];

// Action Options (Translated)
export const ACTION_OPTIONS: StylingOption[] = [
  { id: 'peace', label: '比耶', description: '比出剪刀手 V', icon: '✌️', promptModifier: 'Change pose to making a peace sign with one hand.' },
  { id: 'wave', label: '挥手', description: '打招呼的手势', icon: '👋', promptModifier: 'Change pose to waving hello with one hand.' },
  { id: 'thumbs-up', label: '点赞', description: '竖起大拇指', icon: '👍', promptModifier: 'Change pose to giving a thumbs up.' },
  { id: 'heart', label: '比心', description: '手指比爱心', icon: '🫶', promptModifier: 'Change pose to making a heart shape with hands.' },
  { id: 'thinking', label: '思考', description: '手托着下巴', icon: '🤔', promptModifier: 'Change pose to a thinking pose with hand on chin.' },
  { id: 'facepalm', label: '扶额', description: '无奈/捂脸', icon: '🤦', promptModifier: 'Change pose to a playful facepalm.' },
  { id: 'shush', label: '嘘声', description: '手指放在嘴唇上', icon: '🤫', promptModifier: 'Change pose to a shushing gesture with finger on lips.' },
  { id: 'salute', label: '敬礼', description: '致敬的动作', icon: '🫡', promptModifier: 'Change pose to a respectful salute.' },
  { id: 'arms-crossed', label: '双手抱胸', description: '酷酷的站姿', icon: '🙅', promptModifier: 'Change pose to arms crossed over chest.' },
  { id: 'bubble-tea', label: '喝奶茶', description: '拿着珍珠奶茶', icon: '🧋', promptModifier: 'Change pose to holding a bubble tea cup.' },
  { id: 'book', label: '看书', description: '手里拿着一本书', icon: '📖', promptModifier: 'Change pose to holding an open book.' },
  { id: 'phone', label: '自拍', description: '拿着手机', icon: '📱', promptModifier: 'Change pose to holding a smartphone taking a selfie.' },
  { id: 'camera', label: '摄影师', description: '手里拿着相机', icon: '📷', promptModifier: 'Change pose to holding a camera.' },
  { id: 'cat', label: '抱猫咪', description: '怀里抱着小猫', icon: '🐈', promptModifier: 'Change pose to hugging a small cute cat.' }
];

// Character Archetypes - 32 New Personas
export const CHARACTER_ARCHETYPES = [
  // Any Gender / Neutral (16)
  { id: 'cute-pet', label: '可爱班宠', gender: 'Any', promptDescription: 'A cute class favorite with round glasses, soft fluffy hair, holding a snack, looking very innocent and adorable.' },
  { id: 'rebellious-art', label: '叛逆艺术生', gender: 'Any', promptDescription: 'A rebellious art student with messy hair, paint-splattered clothes, holding a paintbrush, cool attitude.' },
  { id: 'airhead', label: '迷糊天然呆', gender: 'Any', promptDescription: 'A clumsy airhead character with slightly messy hair, confused expression, oversized sweater, maybe a loose tie.' },
  { id: 'melancholy-art', label: '忧郁文艺范', gender: 'Any', promptDescription: 'A melancholy artist with longish hair, turtleneck sweater, sad thoughtful expression, holding a sketchbook.' },
  { id: 'prankster', label: '搞怪精灵', gender: 'Any', promptDescription: 'A mischievous prankster, winking, messy hair, colorful accessories, holding a toy or prank item, playful grin.' },
  { id: 'hardworking', label: '努力型学霸', gender: 'Any', promptDescription: 'A hardworking top student, very neat hair, glasses, studying hard, holding a thick book, determined expression.' },
  { id: 'genius', label: '天才型学神', gender: 'Any', promptDescription: 'A genius prodigy with a confident bored look, cool hair, spinning a pen, looking effortless and smart.' },
  { id: 'gossip', label: '八卦小雷达', gender: 'Any', promptDescription: 'A gossip radar character, hand near mouth whispering, wide eyes, holding a phone, expressive and curious.' },
  { id: 'monitor', label: '古板小班长', gender: 'Any', promptDescription: 'A strict class monitor, very neat hair, glasses, stern expression, adjusting glasses, perfectly buttoned shirt.' },
  { id: 'shy', label: '害羞小透明', gender: 'Any', promptDescription: 'A shy wallflower, hair covering face/eyes, blushing, looking down, hiding in a large scarf or collar.' },
  { id: 'drama', label: '天生戏精', gender: 'Any', promptDescription: 'A natural drama queen/king, exaggerated shocked expression or dramatic pose, hand on chest, spotlight vibe.' },
  { id: 'money', label: '精明小财迷', gender: 'Any', promptDescription: 'A shrewd money whiz with glasses, calculating look, holding a calculator or piggy bank, smart business vibe.' },
  { id: 'introvert', label: '社恐小蘑菇', gender: 'Any', promptDescription: 'A socially anxious introvert hiding in a big hood, nervous sweat drop, looking away, shrinking away.' },
  { id: 'music', label: '音乐鬼才', gender: 'Any', promptDescription: 'A musical genius with headphones, dreamy look, holding sheet music, artistic hair.' },
  { id: 'discipline', label: '风纪委员', gender: 'Any', promptDescription: 'A discipline committee member with a red armband, stern look, holding a clipboard, serious authority vibe.' },
  { id: 'karaoke', label: 'K歌之王', gender: 'Any', promptDescription: 'A karaoke king/queen holding a microphone, singing passionately, eyes closed, confident performer.' },

  // Male / Boy Leaning (7)
  { id: 'refined-boy', label: '精致男孩', gender: 'Male', promptDescription: 'A refined boy with perfectly styled hair, fashionable layered clothing, handsome, clean look.' },
  { id: 'athlete-boy', label: '热血体育生', gender: 'Male', promptDescription: 'An energetic athlete with a headband, messy short hair, basketball jersey, holding a ball, energetic smile.' },
  { id: 'pretty-boy', label: '病娇美少年', gender: 'Male', promptDescription: 'An obsessive pretty boy with pale skin, slightly long messy hair covering one eye, intense stare, bandage on cheek.' },
  { id: 'tech-geek', label: '科技极客', gender: 'Male', promptDescription: 'A tech geek with thick glasses, hoodie, messy hair, holding a game controller or tablet, smart look.' },
  { id: 'neighbor-boy', label: '邻家哥哥', gender: 'Male', promptDescription: 'A boy next door with a warm smile, neat short hair, casual shirt, friendly and reliable vibe.' },
  { id: 'bully-boy', label: '傲娇校霸', gender: 'Male', promptDescription: 'A tsundere school bully with a scowl or smirk, band-aid on nose, loose tie, messy hair, arms crossed, tough guy vibe.' },
  { id: 'gamer-boy', label: '游戏宅男', gender: 'Male', promptDescription: 'A gamer boy with a headset around neck, tired eyes, hoodie, messy hair, holding a portable console.' },

  // Female / Girl Leaning (9)
  { id: 'chill-girl', label: '佛系少女', gender: 'Female', promptDescription: 'A chill zen girl with a low loose ponytail, comfortable clothes, calm sleepy expression, holding a cup of tea.' },
  { id: 'sassy-girl', label: '毒舌小辣椒', gender: 'Female', promptDescription: 'A sassy girl with a sharp bob cut or high pony, sassy expression, arms crossed, trendy outfit, confident.' },
  { id: 'cool-senior', label: '高冷学姐', gender: 'Female', promptDescription: 'A cool senior sister with long straight hair, cold expression, sharp eyes, elegant uniform, mature vibe.' },
  { id: 'fangirl', label: '追星少女', gender: 'Female', promptDescription: 'A fangirl holding a lightstick or fan photo, excited expression, sparkle in eyes, cute hair clips.' },
  { id: 'neighbor-girl', label: '邻家妹妹', gender: 'Female', promptDescription: 'A girl next door with twin tails or cute bob, sweet smile, simple dress or overall, waving hello.' },
  { id: 'rich-girl', label: '傲娇大小姐', gender: 'Female', promptDescription: 'A tsundere rich girl with long elegant curly hair, arms crossed, looking down haughtily, fancy outfit.' },
  { id: 'anime-girl', label: '二次元女孩', gender: 'Female', promptDescription: 'An anime style girl with anime-style hair accessories, very big eyes, cute pose, 2D aesthetic style.' },
  { id: 'elegant-lady', label: '精致淑女', gender: 'Female', promptDescription: 'An elegant lady with an elegant hair updo, pearl earrings, soft smile, classy blouse, refined posture.' },
  { id: 'sweet-cool', label: '甜酷美少女', gender: 'Female', promptDescription: 'A sweet and cool girl with a choker, black and pink outfit, serious but cute expression, messy bun with loose strands.' }
];