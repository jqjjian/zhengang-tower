/**
 * 颜色主题配置接口
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    default: string;
    paper: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  error: string;
  warning: string;
  info: string;
  success: string;
  divider: string;
}

/**
 * 字体主题配置接口
 */
export interface ThemeFonts {
  fontFamily: string;
  fontSize: {
    tiny: string;
    small: string;
    normal: string;
    large: string;
    xlarge: string;
    xxlarge: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
}

/**
 * 间距主题配置接口
 */
export interface ThemeSpacing {
  tiny: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
  xxlarge: string;
}

/**
 * 圆角主题配置接口
 */
export interface ThemeBorderRadius {
  tiny: string;
  small: string;
  medium: string;
  large: string;
  full: string;
}

/**
 * 阴影主题配置接口
 */
export interface ThemeShadows {
  none: string;
  tiny: string;
  small: string;
  medium: string;
  large: string;
}

/**
 * 完整主题配置接口
 */
export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  transitions: {
    duration: {
      short: number;
      medium: number;
      long: number;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      sharp: string;
    };
  };
} 