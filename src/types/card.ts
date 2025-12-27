export interface CardData {
  // 基础信息
  platforms: string[];
  productTitle: string;
  materials: MaterialItem[];
  designs: DesignItem[];
  
  // 价格信息
  marketPrice: number;
  livePrice: number;
  discount: string;
  commission: number;
  
  // 图片信息
  mainImage: string;
  backImage?: string;
  
  // 尺寸信息
  sizeChart: SizeChart;
  sizeRecommendations: SizeRecommendation[];
  
  // 福利活动
  benefits: string[];
  activityTime: string;
  shippingInfo: ShippingInfo;
  command: string;
  
  // 其他信息
  color: string;
  colors?: string[];
  sizes: string[];
}

export interface MaterialItem {
  text: string;
  highlight?: boolean;
}

export interface DesignItem {
  text: string;
}

export interface SizeChart {
  headers: string[];
  sizes: {
    [key: string]: {
      [header: string]: string;
    };
  };
}

export interface SizeRecommendation {
  height: number;
  weight: number;
  recommendedSize: string;
}

export interface ShippingInfo {
  type: 'presale' | 'instock';
  shippingTime: string;
  returnPolicy: string;
  insurance: boolean;
}

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  templateData: Partial<CardData>;
  thumbnailUrl?: string;
  isPublic?: boolean;
}

export interface CardHistoryEntry {
  id: string;
  name: string;
  createdAt: number;
  data: CardData;
  previewUrl?: string | null;
}
