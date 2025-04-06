/**
 * 3D模型位置信息
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D模型旋转信息
 */
export interface Rotation {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D模型缩放信息
 */
export interface Scale {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D模型变换信息
 */
export interface Transform {
  position: Position;
  rotation: Rotation;
  scale: Scale;
}

/**
 * 3D模型热点信息
 */
export interface Hotspot {
  id: string;
  name: string;
  description?: string;
  position: Position;
  target?: string; // 点击后跳转的目标ID
}

/**
 * 3D模型信息
 */
export interface Model3D {
  id: string;
  name: string;
  description?: string;
  url: string; // 模型文件路径
  format: ModelFormat; // 模型格式
  transform?: Transform; // 默认变换
  hotspots?: Hotspot[]; // 热点信息
}

/**
 * 模型格式枚举
 */
export enum ModelFormat {
  GLTF = 'gltf',
  GLB = 'glb',
  OBJ = 'obj',
  FBX = 'fbx',
}

/**
 * 相机视角信息
 */
export interface CameraView {
  id: string;
  name: string;
  description?: string;
  position: Position;
  target: Position; // 相机看向的位置
  fov?: number; // 视场角
}

/**
 * 模型交互动作
 */
export interface ModelAction {
  id: string;
  name: string;
  description?: string;
  type: ActionType; // 动作类型
  targetId: string; // 目标模型ID
  duration?: number; // 动作持续时间（秒）
  easing?: string; // 缓动函数名
  params?: Record<string, any>; // 动作参数
}

/**
 * 动作类型枚举
 */
export enum ActionType {
  ROTATE = 'rotate',
  MOVE = 'move',
  SCALE = 'scale',
  HIGHLIGHT = 'highlight',
  ANIMATE = 'animate',
  HIDE = 'hide',
  SHOW = 'show',
} 