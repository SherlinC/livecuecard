import { useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { Plus, X } from 'lucide-react';

export function SizeChartForm() {
  const { cardData, updateSizeInfo } = useCardStore();
  const [newSize, setNewSize] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newRecommendedSize, setNewRecommendedSize] = useState('');

  const defaultHeaders = ['尺码', '衣长', '胸围(外/拉伸)', '肩宽'];

  const addSize = () => {
    if (newSize.trim()) {
      const newSizes = {
        ...cardData.sizeChart.sizes,
        [newSize.trim()]: {
          '衣长': '',
          '胸围(外/拉伸)': '',
          '肩宽': ''
        }
      };
      updateSizeInfo(
        { ...cardData.sizeChart, sizes: newSizes },
        cardData.sizeRecommendations
      );
      setNewSize('');
    }
  };

  const removeSize = (sizeKey: string) => {
    const newSizes = { ...cardData.sizeChart.sizes };
    delete newSizes[sizeKey];
    updateSizeInfo(
      { ...cardData.sizeChart, sizes: newSizes },
      cardData.sizeRecommendations
    );
  };

  const updateSizeData = (sizeKey: string, field: string, value: string) => {
    const newSizes = {
      ...cardData.sizeChart.sizes,
      [sizeKey]: {
        ...cardData.sizeChart.sizes[sizeKey],
        [field]: value
      }
    };
    updateSizeInfo(
      { ...cardData.sizeChart, sizes: newSizes },
      cardData.sizeRecommendations
    );
  };

  const addRecommendation = () => {
    if (newHeight && newWeight && newRecommendedSize) {
      const newRecommendations = [
        ...cardData.sizeRecommendations,
        {
          height: parseInt(newHeight),
          weight: parseInt(newWeight),
          recommendedSize: newRecommendedSize
        }
      ];
      updateSizeInfo(cardData.sizeChart, newRecommendations);
      setNewHeight('');
      setNewWeight('');
      setNewRecommendedSize('');
    }
  };

  const removeRecommendation = (index: number) => {
    const newRecommendations = cardData.sizeRecommendations.filter((_, i) => i !== index);
    updateSizeInfo(cardData.sizeChart, newRecommendations);
  };

  return (
    <div className="space-y-6">
      {/* 尺码表 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">尺码表</label>
        
        {/* 添加新尺码 */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSize()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="输入尺码，如：S、M、L"
          />
          <button
            type="button"
            onClick={addSize}
            className="text-pink-600 hover:text-pink-700 p-2"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 尺码表格 */}
        {Object.keys(cardData.sizeChart.sizes).length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">尺码</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">衣长</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">胸围(外/拉伸)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">肩宽</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(cardData.sizeChart.sizes).map(([sizeKey, sizeData]) => (
                  <tr key={sizeKey}>
                    <td className="px-3 py-2 font-medium text-gray-900">{sizeKey}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={sizeData['衣长'] || ''}
                        onChange={(e) => updateSizeData(sizeKey, '衣长', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                        placeholder="cm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={sizeData['胸围(外/拉伸)'] || ''}
                        onChange={(e) => updateSizeData(sizeKey, '胸围(外/拉伸)', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                        placeholder="cm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={sizeData['肩宽'] || ''}
                        onChange={(e) => updateSizeData(sizeKey, '肩宽', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                        placeholder="cm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeSize(sizeKey)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 身高体重推荐 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">身高体重推荐</label>
        
        {/* 添加推荐 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <input
            type="number"
            value={newHeight}
            onChange={(e) => setNewHeight(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="身高(cm)"
          />
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="体重(kg)"
          />
          <input
            type="text"
            value={newRecommendedSize}
            onChange={(e) => setNewRecommendedSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="推荐尺码"
          />
          <button
            type="button"
            onClick={addRecommendation}
            className="text-pink-600 hover:text-pink-700 p-2"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 推荐列表 */}
        {cardData.sizeRecommendations.length > 0 && (
          <div className="space-y-2">
            {cardData.sizeRecommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="text-sm">
                  <span className="text-gray-600">身高:</span>
                  <span className="font-medium ml-1">{rec.height}cm</span>
                  <span className="text-gray-600 ml-3">体重:</span>
                  <span className="font-medium ml-1">{rec.weight}kg</span>
                  <span className="text-gray-600 ml-3">推荐:</span>
                  <span className="font-medium text-pink-600 ml-1">{rec.recommendedSize}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRecommendation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 尺码说明 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">尺码说明</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 请根据实际商品测量数据填写</li>
          <li>• 胸围请分别填写平铺和拉伸尺寸</li>
          <li>• 身高体重推荐仅供参考</li>
          <li>• 建议提供2-3个尺码供用户选择</li>
        </ul>
      </div>
    </div>
  );
}