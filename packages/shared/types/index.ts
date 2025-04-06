/**
 * 塔的部位枚举
 */
export enum TowerSection {
  TOP = '顶部',
  MIDDLE = '中部',
  BOTTOM = '底部'
}

/**
 * 塔的详细信息接口
 */
export interface TowerInfo {
  id: string;
  name: string;
  section: TowerSection;
  description: string;
  imageUrl: string;
  detailItems?: TowerDetailItem[];
}

/**
 * 塔的详细信息项目接口
 */
export interface TowerDetailItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

/**
 * 文化知识类别枚举
 */
export enum CultureCategory {
  HISTORY = '历史背景',
  ARCHITECTURE = '建筑特色',
  STORY = '相关传说',
  RITUAL = '祈福仪式',
  DECORATION = '装饰特点',
  GENERAL = '通用知识'
}

/**
 * 文化知识条目接口
 */
export interface CultureKnowledge {
  id: string;
  title: string;
  category: CultureCategory;
  content: string;
  imageUrl?: string;
}

/**
 * 用户许愿信息接口
 */
export interface WishInfo {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  type: WishType;
}

/**
 * 许愿类型枚举
 */
export enum WishType {
  HEALTH = '健康平安',
  ACADEMIC = '学业有成',
  CAREER = '事业成功',
  LOVE = '姻缘美满',
  FAMILY = '家庭和睦',
  WEALTH = '财运亨通',
  OTHER = '其他祝愿'
} 