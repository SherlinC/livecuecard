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
  const { cardData, isGenerating, setGenerating, setPreviewUrl, previewUrl, upsertHistoryByName, resetCardData } = useCardStore() as any;
  const previewRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'basic', name: '基础信息', component: BasicInfoForm },
    { id: 'price', name: '价格设置', component: PriceForm },
    { id: 'images', name: '图片上传', component: ImageUpload },
    { id: 'size', name: '尺寸信息', component: SizeChartForm },
    { id: 'benefits', name: '福利活动', component: BenefitsForm },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (previewRef.current) {
        const target = (previewRef.current.firstElementChild as HTMLElement) || previewRef.current;
        const result = await generateCardImage(target);
        if (result.success && result.dataURL) {
          setPreviewUrl(result.dataURL);
          if (exportFormat === 'png') {
            const blob = dataURLToBlob(result.dataURL);
            if (blob && blob.size > 1000) {
              downloadImage(result.dataURL, `直播手卡_${Date.now()}.png`);
            } else {
              // PNG 近似空白时兜底 PDF
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
    }
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
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat((e.target.value as 'png'|'pdf'))}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                aria-label="导出格式"
              >
                <option value="png">PNG</option>
                <option value="pdf">PDF</option>
              </select>
              <button onClick={handleNewCard} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                新建卡片
              </button>
              <button onClick={handleSave} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? '生成中...' : '生成手卡'}
              </button>
            </div>
          </div>
          {saveTip && (
            <div className="mb-4 px-3 py-2 bg-green-50 text-green-700 text-sm rounded border border-green-200">{saveTip}</div>
          )}
          <div ref={previewRef}>
            <CardPreview />
          </div>
          
        </div>
      </div>
    </div>
  );
}
