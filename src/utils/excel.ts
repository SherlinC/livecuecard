import * as XLSX from 'xlsx';
import { CardData, MaterialItem, DesignItem, SizeChart, ShippingInfo, SizeRecommendation } from '../types/card';

export interface ExcelParseResult {
  rows: CardData[];
  errors: string[];
}

const defaultSizeChart: SizeChart = {
  headers: ['尺码', '衣长', '胸围(外/拉伸)', '肩宽'],
  sizes: {}
};

function toArray(input: any): string[] {
  if (!input) return [];
  const s = String(input).trim();
  if (!s) return [];
  return s.split(/[;,、\n]/).map(v => v.trim()).filter(Boolean);
}

function parseBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  const s = String(input).trim().toLowerCase();
  return ['true', '是', 'y', 'yes', '1'].includes(s);
}

function parseMaterials(s: any): MaterialItem[] {
  return toArray(s).map(t => ({ text: t }));
}

function parseDesigns(s: any): DesignItem[] {
  return toArray(s).map(t => ({ text: t }));
}

function parseSizeChart(json: any): SizeChart {
  if (!json) return defaultSizeChart;
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    if (obj && Array.isArray(obj.headers) && obj.sizes) return obj as SizeChart;
  } catch {}
  return defaultSizeChart;
}

function parseSizeRecs(json: any): SizeRecommendation[] {
  if (!json) return [];
  try {
    const arr = typeof json === 'string' ? JSON.parse(json) : json;
    if (Array.isArray(arr)) return arr as SizeRecommendation[];
  } catch {}
  return [];
}

export async function parseExcel(file: File): Promise<ExcelParseResult> {
  const errors: string[] = [];
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

  const pick = (r: Record<string, any>, keys: string[]): any => {
    for (const k of keys) {
      if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
    }
    return '';
  };

  const result: CardData[] = rows.map((r, idx) => {
    const shippingTypeRaw = String(pick(r, ['发货类型', 'shippingType']) || 'presale').trim().toLowerCase();
    const type: 'presale' | 'instock' = (shippingTypeRaw === 'instock' || shippingTypeRaw === '现货') ? 'instock' : 'presale';
    const shipping: ShippingInfo = {
      type,
      shippingTime: String(pick(r, ['发货时间', 'shippingTime']) || ''),
      returnPolicy: String(pick(r, ['退换政策', '退换货政策', 'returnPolicy']) || ''),
      insurance: parseBoolean(pick(r, ['包含运费险', 'insurance']))
    };

    const sizeChart = parseSizeChart(pick(r, ['尺码表JSON', 'sizeChartJson']));
    const sizeRecommendations = parseSizeRecs(pick(r, ['尺码推荐JSON', 'sizeRecsJson']));

    const parsedColors = (toArray(pick(r, ['颜色', 'colors']))?.length ? toArray(pick(r, ['颜色', 'colors'])) : toArray(pick(r, ['color'])));
    const card: CardData = {
      platforms: toArray(pick(r, ['平台', 'platforms']))?.length ? toArray(pick(r, ['平台', 'platforms'])) : ['小红书'],
      productTitle: String(pick(r, ['产品标题', 'productTitle']) || ''),
      brandName: String(pick(r, ['品牌名称', 'brandName']) || ''),
      brandLogo: String(pick(r, ['品牌Logo', 'brandLogo']) || ''),
      materials: parseMaterials(pick(r, ['材料', 'materials'])),
      designs: parseDesigns(pick(r, ['设计', 'designs'])),
      marketPrice: Number(pick(r, ['市场价', 'marketPrice']) || 0),
      livePrice: Number(pick(r, ['直播价', 'livePrice']) || 0),
      discount: String(pick(r, ['折扣信息', 'discount']) || ''),
      commission: Number(pick(r, ['佣金比例', '佣金', 'commission']) || 0),
      mainImage: String(pick(r, ['主图', '商品图', 'mainImage']) || ''),
      backImage: String(pick(r, ['背面图', 'backImage']) || ''),
      sizeChart,
      sizeRecommendations,
      benefits: toArray(pick(r, ['直播间福利', 'benefits'])),
      activityTime: String(pick(r, ['活动时间', 'activityTime']) || ''),
      shippingInfo: shipping,
      command: String(pick(r, ['直播口令', 'command']) || ''),
      color: parsedColors[0] || '',
      colors: parsedColors,
      sizes: toArray(pick(r, ['尺码', 'sizes']))
    };

    if (!card.productTitle) errors.push(`第${idx + 1}行缺少 产品标题`);
    return card;
  });

  return { rows: result, errors };
}

export function downloadTemplate() {
  const headers = [
    '产品标题',
    '市场价',
    '直播价',
    '佣金比例',
    '平台',
    '品牌名称',
    '品牌Logo',
    '颜色',
    '尺码',
    '材料',
    '设计',
    '主图',
    '背面图',
    '直播间福利',
    '活动时间',
    '发货类型',
    '发货时间',
    '退换政策',
    '包含运费险',
    '直播口令',
    '尺码表JSON',
    '尺码推荐JSON'
  ];

  const sample: Record<string, any> = {
    产品标题: '毛领奢美人马甲 两面穿羊毛保暖马夹',
    市场价: 1102,
    直播价: 914,
    佣金比例: 25,
    平台: '小红书;淘宝;抖音',
    品牌名称: 'WEIQIN',
    品牌Logo: 'https://picsum.photos/id/12/120/120',
    颜色: '黑色;白色',
    尺码: '0;2',
    材料: '衣身100%仿羊毛;优质环保狐狸毛毛领',
    设计: '西装封里;U形拉链;正反可穿',
    主图: 'https://picsum.photos/id/200/600/600',
    背面图: 'https://picsum.photos/id/201/600/600',
    直播间福利: '盲盒发夹(1)+海岛花发夹(1)',
    活动时间: '此刻至2026-01-31',
    发货类型: '预售',
    发货时间: '5天内发货',
    退换政策: '7天无理由',
    包含运费险: '是',
    直播口令: 'dbisFPXYET2J',
    尺码表JSON: JSON.stringify(defaultSizeChart),
    尺码推荐JSON: JSON.stringify([
      { height: 160, weight: 50, recommendedSize: '0' },
      { height: 170, weight: 60, recommendedSize: '2' }
    ])
  };

  const ws = XLSX.utils.json_to_sheet([sample], { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '手卡数据');
  XLSX.writeFile(wb, '手卡模板.xlsx');
}
