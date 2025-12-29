import { useState, useRef } from 'react';
import { CardPreview } from '../components/CardPreview';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { PriceForm } from '../components/PriceForm';
import { ImageUpload } from '../components/ImageUpload';
import { SizeChartForm } from '../components/SizeChartForm';
import { BenefitsForm } from '../components/BenefitsForm';
// 移除内部历史记录标签，统一使用顶部导航的 /history 页面
import { Download, Save } from 'lucide-react';
import { useCardStore } from '../store/cardStore';
import { generateCardImage, downloadImage, dataURLToBlob, downloadPdfFromDataURL } from '../utils/imageGenerator';

export function EditorPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [saveTip, setSaveTip] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [templateType, setTemplateType] = useState<'portrait' | 'landscape'>('portrait');
  const { cardData, isGenerating, setGenerating, setPreviewUrl, previewUrl, upsertHistoryByName, resetCardData } = useCardStore() as any;
  const previewRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'basic', name: '基础信息', component: BasicInfoForm },
    { id: 'price', name: '价格设置', component: PriceForm },
    { id: 'images', name: '图片上传', component: ImageUpload },
    { id: 'size', name: '尺寸信息', component: SizeChartForm },
    { id: 'benefits', name: '福利活动', component: BenefitsForm },
  ];

  const performGenerate = async (fmt: 'png' | 'pdf') => {
    setGenerating(true);
    try {
      if (previewRef.current) {
        const target = (previewRef.current.firstElementChild as HTMLElement) || previewRef.current;
        const result = await generateCardImage(target);
        if (result.success && result.dataURL) {
          setPreviewUrl(result.dataURL);
          if (fmt === 'png') {
            const blob = dataURLToBlob(result.dataURL);
            if (blob && blob.size > 1000) {
              downloadImage(result.dataURL, `直播手卡_${Date.now()}.png`);
            } else {
              downloadPdfFromDataURL(result.dataURL, `直播手卡_${Date.now()}.pdf`);
            }
          } else {
            downloadPdfFromDataURL(result.dataURL, `直播手卡_${Date.now()}.pdf`);
          }
        } else {
          console.error('生成图片失败:', result.error);
        }
      }
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setGenerating(false);
      setExportMenuOpen(false);
    }
  };

  const handleGenerate = () => {
    setExportMenuOpen((v) => !v);
  };

  const handleSave = async () => {
    const name = (cardData.productTitle || '').trim() || '未命名手卡';
    let preview: string | null = null;
    try {
      if (previewRef.current) {
        const target = (previewRef.current.firstElementChild as HTMLElement) || previewRef.current;
        const result = await generateCardImage(target);
        if (result.success && result.dataURL) {
          preview = result.dataURL;
        }
      }
    } catch {}
    upsertHistoryByName(name, { ...cardData }, preview);
    setSaveTip('已保存到历史记录');
    window.setTimeout(() => setSaveTip(null), 1800);
  };

  const handleNewCard = () => {
    resetCardData();
    setActiveTab('basic');
    setSaveTip('已创建新卡片，请填写产品标题作为卡片名称');
    window.setTimeout(() => setSaveTip(null), 2000);
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  const LandscapeTemplatePreview = () => (
    <div className="group cursor-pointer">
      <div className="card-font bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-[420px] flex flex-col">
        <div className="flex items-center gap-3 text-gray-900">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-black">
            {cardData.brandLogo && (
              <img src={cardData.brandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="text-sm">{cardData.brandName || '品牌'}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 h-64 items-stretch flex-none">
          <div className="flex flex-col h-full gap-4">
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
              {cardData.mainImage ? (
                <img src={cardData.mainImage} alt="商品图" className="w-full h-full object-cover" />
              ) : (
                <>商品图</>
              )}
            </div>
            <div className="bg-gray-100 rounded-lg h-16 flex items-center px-4 text-gray-900 text-lg font-bold">
              {cardData.productTitle ? cardData.productTitle : '产品标题'}
            </div>
          </div>
          <div className="flex flex-col h-full space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-black text-white h-16 flex items-center justify-center text-sm">
                <div>
                  <div className="text-xs text-gray-300">市场价</div>
                  <div className="text-sm font-bold">¥{cardData.marketPrice || 0}</div>
                </div>
              </div>
              <div className="rounded-lg bg-pink-600 text-white h-16 flex items-center justify-center text-sm">
                <div>
                  <div className="text-xs text-pink-200">直播价</div>
                  <div className="text-sm font-bold">¥{cardData.livePrice || 0}</div>
                  {cardData.discount && (
                    <div className="opacity-80 text-xs">{cardData.discount}</div>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-gray-600 text-white h-16 flex items-center justify-center text-sm">
                <div>
                  <div className="text-xs text-gray-300">佣金</div>
                  <div className="text-sm font-bold">{cardData.commission || 0}%</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 bg-gray-50 rounded-lg p-3 flex-1">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">材料</div>
                {cardData.materials && cardData.materials.length > 0 ? (
                  cardData.materials.map((m: any, index: number) => (
                    <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">暂无材料</div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">设计</div>
                {cardData.designs && cardData.designs.length > 0 ? (
                  cardData.designs.map((d: any, index: number) => (
                    <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {d.text}</div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">暂无设计</div>
                )}
              </div>
            </div>
          </div>
        </div>
        {(cardData.colors?.length > 0 || cardData.sizes?.length > 0) && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {cardData.colors && cardData.colors.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">颜色</h4>
                <div className="text-sm text-gray-600">{(cardData.colors || []).join('、')}</div>
              </div>
            )}
            {cardData.sizes && cardData.sizes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">尺码</h4>
                <div className="text-sm text-gray-600">{cardData.sizes.join('、')}</div>
              </div>
            )}
          </div>
        )}
        <div className="bg-gray-50 rounded-xl mt-4 text-gray-700 text-sm flex-1 p-4">
          {Object.keys(cardData.sizeChart?.sizes || {}).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    {cardData.sizeChart.headers.map((h: string, i: number) => (
                      <th key={i} className="text-left py-1 px-2 text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cardData.sizeChart.sizes).map(([size, data]: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="py-1 px-2 font-medium">{size}</td>
                      {cardData.sizeChart.headers.slice(1).map((header: string, headerIndex: number) => (
                        <td key={headerIndex} className="py-1 px-2 text-gray-600">{data[header] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">尺码表</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧表单区域 */}
      <div className="w-2/5 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">手卡编辑器</h1>
          </div>

          {/* 标签页 */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 表单内容 */}
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>

      {/* 右侧预览区域 */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">实时预览</h2>
          <div className="flex items-center space-x-2">
              <button onClick={handleNewCard} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                新建卡片
              </button>
              <button onClick={handleSave} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
              <div className="relative" onMouseLeave={() => setExportMenuOpen(false)}>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? '生成中...' : '生成手卡'}
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => { setExportFormat('png'); performGenerate('png'); }}
                    >
                      导出为 PNG
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => { setExportFormat('pdf'); performGenerate('pdf'); }}
                    >
                      导出为 PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 模板选择 */}
          <div className="mb-4">
            <div className="inline-flex bg-gray-100 p-1 rounded-lg">
              <button
                className={`px-3 py-1 text-sm rounded-md ${templateType==='portrait' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
                onClick={() => setTemplateType('portrait')}
              >
                竖版
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${templateType==='landscape' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
                onClick={() => setTemplateType('landscape')}
              >
                横版
              </button>
            </div>
          </div>

          {saveTip && (
            <div className="mb-4 px-3 py-2 bg-green-50 text-green-700 text-sm rounded border border-green-200">{saveTip}</div>
          )}
          <div ref={previewRef}>
            {templateType === 'portrait' ? <CardPreview /> : <LandscapeTemplatePreview />}
          </div>
          
        </div>
      </div>
    </div>
  );
}
