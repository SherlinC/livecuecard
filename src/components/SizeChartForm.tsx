import { useState, useEffect } from 'react';
import { useCardStore } from '../store/cardStore';
import { Plus, X } from 'lucide-react';

export function SizeChartForm() {
  const { cardData, updateSizeInfo } = useCardStore();
  const [newSize, setNewSize] = useState('');
  const [newOptionSize, setNewOptionSize] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newRecommendedSize, setNewRecommendedSize] = useState('');

  const defaultHeaders = ['尺码', '衣长', '胸围(外/拉伸)', '肩宽'];
  useEffect(() => {
    const original = cardData.sizes || [];
    const normalized = Array.from(new Set(original.map((s) => (/^[a-zA-Z]+$/.test(s) ? s.toUpperCase() : s))));
    const changed = normalized.length !== original.length || normalized.some((s, i) => s !== original[i]);
    if (changed) {
      const notes = (cardData.sizeNotes || {}) as Record<string, string>;
      const mappedNotes: Record<string, string> = {};
      normalized.forEach((s) => {
        const candidate = notes[s] ?? notes[s.toLowerCase()] ?? notes[s.toUpperCase()];
        if (candidate) mappedNotes[s] = candidate;
      });
      useCardStore.getState().updateCardData({ sizes: normalized, sizeNotes: mappedNotes });
    }
  }, [cardData.sizes, cardData.sizeNotes]);

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
    if (newHeight && newWeight) {
      const h = parseInt(newHeight);
      const w = parseInt(newWeight);
      let rec = newRecommendedSize.trim();
      if (!rec) {
        let tag = w <= 45 ? 'XS' : w <= 52 ? 'S' : w <= 60 ? 'M' : w <= 70 ? 'L' : 'XL';
        const sizes = (cardData.sizes || []).map(s => s.toUpperCase());
        const foundIndex = sizes.indexOf(tag);
        rec = foundIndex >= 0 ? (cardData.sizes || [tag])[foundIndex] : ((cardData.sizes || [tag])[0] || tag);
      }
      const newRecommendations = [
        ...cardData.sizeRecommendations,
        { height: h, weight: w, recommendedSize: rec }
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
      

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">可选尺码</label>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-2">字母码</div>
            <div className="flex flex-wrap gap-2">
              {['S','M','L','XL','XXL'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    const selected = (cardData.sizes || []);
                    const next = selected.includes(sz)
                      ? selected.filter(s => s !== sz)
                      : [...selected, sz];
                    useCardStore.getState().updateCardData({ sizes: next });
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (cardData.sizes || []).includes(sz)
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2">数字码</div>
            <div className="flex flex-wrap gap-2">
              {['0','1','2','3','4'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    const selected = (cardData.sizes || []);
                    const next = selected.includes(sz)
                      ? selected.filter(s => s !== sz)
                      : [...selected, sz];
                    useCardStore.getState().updateCardData({ sizes: next });
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (cardData.sizes || []).includes(sz)
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
          {(cardData.sizes || []).length > 0 && (
            <div className="space-y-2">
              {(cardData.sizes || []).map((sz, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-sm text-gray-700 w-16">{sz}</div>
                  <input
                    type="text"
                    value={cardData.sizeNotes?.[sz] || ''}
                    onChange={(e) => {
                      const nextNotes = { ...(cardData.sizeNotes || {}) };
                      nextNotes[sz] = e.target.value;
                      useCardStore.getState().updateCardData({ sizeNotes: nextNotes });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    placeholder="备注（可选）"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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
            onKeyDown={(e) => { if (e.key === 'Enter') addRecommendation(); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="身高(cm)"
          />
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addRecommendation(); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="体重(kg)"
          />
          <input
            type="text"
            value={newRecommendedSize}
            onChange={(e) => setNewRecommendedSize(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addRecommendation(); }}
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
