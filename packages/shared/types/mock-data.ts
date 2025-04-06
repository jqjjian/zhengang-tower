import { 
  TowerInfo, 
  TowerSection, 
  CultureKnowledge, 
  CultureCategory,
  WishInfo,
  WishType 
} from './index';

/**
 * 塔信息模拟数据
 */
export const MOCK_TOWER_INFO: TowerInfo[] = [
  {
    id: 'top-1',
    name: '塔刹',
    section: TowerSection.TOP,
    description: '塔顶装饰，象征佛教智慧之光普照大地。',
    imageUrl: '/assets/images/tower/top-1.jpg',
    detailItems: [
      {
        id: 'top-1-detail-1',
        title: '塔刹结构',
        content: '塔刹由相轮、宝珠、华盖等部分组成，代表佛教宇宙观。',
        imageUrl: '/assets/images/tower/top-1-detail-1.jpg'
      }
    ]
  },
  {
    id: 'middle-1',
    name: '塔身',
    section: TowerSection.MIDDLE,
    description: '塔身呈八角形，层层递进，代表佛教八正道。',
    imageUrl: '/assets/images/tower/middle-1.jpg',
    detailItems: [
      {
        id: 'middle-1-detail-1',
        title: '砖雕花纹',
        content: '塔身砖雕精美，融合汉唐风格，展现古代工匠精湛技艺。',
        imageUrl: '/assets/images/tower/middle-1-detail-1.jpg'
      }
    ]
  },
  {
    id: 'bottom-1',
    name: '塔基',
    section: TowerSection.BOTTOM,
    description: '塔基稳固宽厚，象征佛教坚实的根基。',
    imageUrl: '/assets/images/tower/bottom-1.jpg',
    detailItems: [
      {
        id: 'bottom-1-detail-1',
        title: '基座雕刻',
        content: '基座雕刻有莲花图案，象征佛教中的清净与超脱。',
        imageUrl: '/assets/images/tower/bottom-1-detail-1.jpg'
      }
    ]
  }
];

/**
 * 文化知识模拟数据
 */
export const MOCK_CULTURE_KNOWLEDGE: CultureKnowledge[] = [
  {
    id: 'culture-1',
    title: '镇罡塔的历史渊源',
    category: CultureCategory.HISTORY,
    content: '镇罡塔始建于唐代，历经宋元明清多次修缮，是中国古代建筑艺术的瑰宝。',
    imageUrl: '/assets/images/culture/history-1.jpg'
  },
  {
    id: 'culture-2',
    title: '砖雕艺术特色',
    category: CultureCategory.ARCHITECTURE,
    content: '镇罡塔的砖雕融合了汉族和少数民族的艺术特色，题材丰富多样。',
    imageUrl: '/assets/images/culture/architecture-1.jpg'
  },
  {
    id: 'culture-3',
    title: '镇罡塔与当地民俗',
    category: CultureCategory.STORY,
    content: '相传镇罡塔有镇妖驱邪之力，当地民众常在此祈福许愿。',
    imageUrl: '/assets/images/culture/story-1.jpg'
  }
];

/**
 * 许愿信息模拟数据
 */
export const MOCK_WISH_INFO: WishInfo[] = [
  {
    id: 'wish-1',
    userId: 'user-1',
    content: '祈愿家人平安健康，事业顺利。',
    createdAt: '2023-05-15T08:30:00.000Z',
    type: WishType.HEALTH
  },
  {
    id: 'wish-2',
    userId: 'user-2',
    content: '祝愿孩子学业进步，考上理想的大学。',
    createdAt: '2023-05-16T09:45:00.000Z',
    type: WishType.ACADEMIC
  },
  {
    id: 'wish-3',
    userId: 'user-3',
    content: '愿生意兴隆，财源广进。',
    createdAt: '2023-05-17T14:20:00.000Z',
    type: WishType.WEALTH
  }
]; 