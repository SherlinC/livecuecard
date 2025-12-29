import { create } from 'zustand';
import { CardData, CardHistoryEntry } from '../types/card';

interface CardState {
  cardData: CardData;
  isGenerating: boolean;
  previewUrl: string | null;
  history: CardHistoryEntry[];
  
  // 更新卡片数据
  updateCardData: (data: Partial<CardData>) => void;
  
  // 更新基础信息
  updateBasicInfo: (platforms: string[], productTitle: string) => void;
  
  // 更新材料信息
  updateMaterials: (materials: any[]) => void;
  
  // 更新设计特点
  updateDesigns: (designs: any[]) => void;
  
  // 更新价格信息
  updatePriceInfo: (marketPrice: number, livePrice: number, discount: string, commission: number) => void;
  
  // 更新图片
  updateImages: (mainImage: string, backImage?: string) => void;
  
  // 更新尺寸信息
  updateSizeInfo: (sizeChart: any, sizeRecommendations: any[]) => void;
  
  // 更新福利活动
  updateBenefits: (benefits: string[], activityTime: string, shippingInfo: any, command: string) => void;
  
  // 设置生成状态
  setGenerating: (generating: boolean) => void;
  
  // 设置预览URL
  setPreviewUrl: (url: string | null) => void;
  
  // 重置卡片数据
  resetCardData: () => void;

  // 历史记录
  addHistoryEntry: (entry: CardHistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  upsertHistoryByName: (name: string, data: CardData, previewUrl?: string | null) => void;
}

const defaultCardData: CardData = {
  platforms: ['小红书'],
  productTitle: '',
  brandName: '',
  brandLogo: '',
  materials: [],
  designs: [],
  marketPrice: 0,
  livePrice: 0,
  discount: '',
  commission: 0,
  mainImage: '',
  sizeChart: {
    headers: ['尺码', '衣长', '胸围(外/拉伸)', '肩宽'],
    sizes: {}
  },
  sizeRecommendations: [],
  benefits: [],
  activityTime: '',
  shippingInfo: {
    type: 'presale',
    shippingTime: '',
    returnPolicy: '',
    insurance: false
  },
  command: '',
  color: '',
  colors: [],
  sizes: []
};

function readHistory(): CardHistoryEntry[] {
  try {
    const raw = localStorage.getItem('cardHistory');
    if (!raw) return [];
    const arr = JSON.parse(raw) as CardHistoryEntry[];
    return Array.isArray(arr) ? arr.sort((a,b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

export const useCardStore = create<CardState>((set, get) => ({
  cardData: defaultCardData,
  isGenerating: false,
  previewUrl: null,
  history: readHistory(),
  
  updateCardData: (data) => set((state) => ({
    cardData: { ...state.cardData, ...data }
  })),
  
  updateBasicInfo: (platforms, productTitle) => set((state) => ({
    cardData: { 
      ...state.cardData, 
      platforms, 
      productTitle 
    }
  })),
  
  updateMaterials: (materials) => set((state) => ({
    cardData: { ...state.cardData, materials }
  })),
  
  updateDesigns: (designs) => set((state) => ({
    cardData: { ...state.cardData, designs }
  })),
  
  updatePriceInfo: (marketPrice, livePrice, discount, commission) => set((state) => ({
    cardData: { 
      ...state.cardData, 
      marketPrice, 
      livePrice, 
      discount, 
      commission 
    }
  })),
  
  updateImages: (mainImage, backImage) => set((state) => ({
    cardData: { 
      ...state.cardData, 
      mainImage, 
      backImage 
    }
  })),
  
  updateSizeInfo: (sizeChart, sizeRecommendations) => set((state) => ({
    cardData: { 
      ...state.cardData, 
      sizeChart, 
      sizeRecommendations 
    }
  })),
  
  updateBenefits: (benefits, activityTime, shippingInfo, command) => set((state) => ({
    cardData: { 
      ...state.cardData, 
      benefits, 
      activityTime, 
      shippingInfo, 
      command 
    }
  })),
  
  setGenerating: (generating) => set({ isGenerating: generating }),
  
  setPreviewUrl: (url) => set({ previewUrl: url }),
  
  resetCardData: () => set({ cardData: defaultCardData })
  ,
  addHistoryEntry: (entry) => set((state) => {
    const next = [entry, ...state.history].sort((a,b) => b.createdAt - a.createdAt);
    try { localStorage.setItem('cardHistory', JSON.stringify(next)); } catch {}
    return { history: next };
  }),
  removeHistoryEntry: (id) => set((state) => {
    const next = state.history.filter(h => h.id !== id);
    try { localStorage.setItem('cardHistory', JSON.stringify(next)); } catch {}
    return { history: next };
  }),
  upsertHistoryByName: (name, data, previewUrl) => set((state) => {
    const idx = state.history.findIndex(h => (h.name || h.data.productTitle || '') === name);
    const entry: CardHistoryEntry = {
      id: name,
      name,
      createdAt: Date.now(),
      data,
      previewUrl: previewUrl ?? null,
    };
    let next: CardHistoryEntry[];
    if (idx >= 0) {
      next = [...state.history];
      next[idx] = entry;
    } else {
      next = [entry, ...state.history];
    }
    next = next.sort((a,b) => b.createdAt - a.createdAt);
    try { localStorage.setItem('cardHistory', JSON.stringify(next)); } catch {}
    return { history: next };
  })
}));
