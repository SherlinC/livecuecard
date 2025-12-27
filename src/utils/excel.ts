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

  const result: CardData[] = rows.map((r, idx) => {
    const shipping: ShippingInfo = {
      type: (String(r['shippingType'] || 'presale').trim() === 'instock' ? 'instock' : 'presale'),
      shippingTime: String(r['shippingTime'] || ''),
      returnPolicy: String(r['returnPolicy'] || ''),
      insurance: parseBoolean(r['insurance'])
    };

    const sizeChart = parseSizeChart(r['sizeChartJson']);
    const sizeRecommendations = parseSizeRecs(r['sizeRecsJson']);

    const parsedColors = (toArray(r['colors']).length ? toArray(r['colors']) : toArray(r['color']));
    const card: CardData = {
      platforms: toArray(r['platforms']).length ? toArray(r['platforms']) : ['小红书'],
      productTitle: String(r['productTitle'] || ''),
      materials: parseMaterials(r['materials']),
      designs: parseDesigns(r['designs']),
      marketPrice: Number(r['marketPrice'] || 0),
      livePrice: Number(r['livePrice'] || 0),
      discount: String(r['discount'] || ''),
      commission: Number(r['commission'] || 0),
      mainImage: String(r['mainImage'] || ''),
      backImage: String(r['backImage'] || ''),
      sizeChart,
      sizeRecommendations,
      benefits: toArray(r['benefits']),
      activityTime: String(r['activityTime'] || ''),
      shippingInfo: shipping,
      command: String(r['command'] || ''),
      color: parsedColors[0] || '',
      colors: parsedColors,
      sizes: toArray(r['sizes'])
    };

    if (!card.productTitle) errors.push(`第${idx + 1}行缺少 productTitle`);
    return card;
  });

  return { rows: result, errors };
}

export function downloadTemplate() {
  const headers = [
    'platforms',
    'productTitle',
    'materials',
    'designs',
    'marketPrice',
    'livePrice',
    'discount',
    'commission',
    'mainImage',
    'backImage',
    'colors',
    'sizes',
    'benefits',
    'activityTime',
    'shippingType',
    'shippingTime',
    'returnPolicy',
    'insurance',
    'command',
    'sizeChartJson',
    'sizeRecsJson'
  ];

  const sample = {
    platforms: '小红书;淘宝;抖音',
    productTitle: '毛领奢美人马甲 两面穿羊毛保暖马夹',
    materials: '衣身100%仿羊毛;优质环保狐狸毛毛领',
    designs: '西装封里;U形拉链;正反可穿',
    marketPrice: 1102,
    livePrice: 914,
    discount: '史低8.3折',
    commission: 25,
    mainImage: 'https://picsum.photos/id/200/600/600',
    backImage: 'https://picsum.photos/id/201/600/600',
    colors: '黑色;白色',
    sizes: '0;2',
    benefits: '盲盒发夹(1)+海岛花发夹(1)',
    activityTime: '此刻至2026-01-31',
    shippingType: 'presale',
    shippingTime: '5天内发货',
    returnPolicy: '7天无理由退换货，有运费险',
    insurance: true,
    command: 'dbisFPXYET2J',
    sizeChartJson: JSON.stringify(defaultSizeChart),
    sizeRecsJson: JSON.stringify([
      { height: 160, weight: 50, recommendedSize: '0' },
      { height: 170, weight: 60, recommendedSize: '2' }
    ])
  };

  const ws = XLSX.utils.json_to_sheet([sample], { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '手卡数据');
  XLSX.writeFile(wb, '手卡模板.xlsx');
}
