import { useCardStore } from '../store/cardStore';

export function PriceForm() {
  const { cardData, updatePriceInfo } = useCardStore();

  const computeLiveFromDiscount = (market: number, discountText: string): number | null => {
    const zhe = discountText.match(/([0-9]+(?:\.[0-9]+)?)\s*折/i);
    if (zhe) {
      const rate = parseFloat(zhe[1]) / 10;
      if (!isNaN(rate)) return parseFloat((market * rate).toFixed(2));
    }
    const off = discountText.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
    if (off && /off/i.test(discountText)) {
      const rate = 1 - parseFloat(off[1]) / 100;
      if (!isNaN(rate)) return parseFloat((market * rate).toFixed(2));
    }
    const minus = discountText.match(/(减|立减|优惠)\s*¥?([0-9]+(?:\.[0-9]+)?)/);
    if (minus) {
      const m = parseFloat(minus[2]);
      if (!isNaN(m)) return Math.max(0, parseFloat((market - m).toFixed(2)));
    }
    return null;
  };

  // 移除百分比输入逻辑，改用中文折扣

  const getZhFromDiscount = (text: string): string => {
    const pct = text.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
    if (pct) {
      const off = parseFloat(pct[1]);
      if (!isNaN(off)) {
        const zh = (100 - off) / 10;
        return zh.toFixed(1).replace(/\.0$/, '');
      }
    }
    const zhe = text.match(/([0-9]+(?:\.[0-9]+)?)\s*折/i);
    if (zhe) return zhe[1];
    return '';
  };

  const handleZhDiscountChange = (value: string) => {
    const zh = Math.max(0, Math.min(10, parseFloat(value) || 0));
    const offPct = Math.max(0, Math.min(100, parseFloat((100 - zh * 10).toFixed(1))));
    const live = parseFloat((cardData.marketPrice * (zh / 10)).toFixed(2));
    updatePriceInfo(cardData.marketPrice, live, `${offPct}% OFF`, cardData.commission);
  };

  const handleMarketPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    const computed = computeLiveFromDiscount(price, cardData.discount || '');
    updatePriceInfo(price, computed ?? cardData.livePrice, cardData.discount, cardData.commission);
  };

  const handleLivePriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    updatePriceInfo(cardData.marketPrice, price, cardData.discount, cardData.commission);
  };

  const handleDiscountChange = (value: string) => {
    const computed = computeLiveFromDiscount(cardData.marketPrice, value || '');
    updatePriceInfo(cardData.marketPrice, computed ?? cardData.livePrice, value, cardData.commission);
  };

  const handleCommissionChange = (value: string) => {
    const commission = parseFloat(value) || 0;
    updatePriceInfo(cardData.marketPrice, cardData.livePrice, cardData.discount, commission);
  };

  return (
    <div className="space-y-6">
      {/* 市场价 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          市场价 (元)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
          <input
            type="number"
            value={cardData.marketPrice || ''}
            onChange={(e) => handleMarketPriceChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600"
            placeholder="请输入市场价"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* 中文折扣（折） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">中文折扣（折）</label>
        <div className="relative">
          <input
            type="number"
            value={getZhFromDiscount(cardData.discount || '')}
            onChange={(e) => handleZhDiscountChange(e.target.value)}
            className="w-full pr-3 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600"
            placeholder="例如：8.8 表示 12% OFF"
            min="0"
            max="10"
            step="0.1"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">输入折扣（0-10），自动计算直播价与“x% OFF”。</p>
      </div>

      {/* 直播价 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          直播价 (元)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
          <input
            type="number"
            value={cardData.livePrice || ''}
            onChange={(e) => handleLivePriceChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600"
            placeholder="请输入直播价"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* 佣金比例 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          佣金比例 (%)
        </label>
        <div className="relative">
          <input
            type="number"
            value={cardData.commission || ''}
            onChange={(e) => handleCommissionChange(e.target.value)}
            className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600"
            placeholder="请输入佣金比例"
            min="0"
            max="100"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          主播可获得的佣金比例，范围：0-100%
        </p>
      </div>

      

      {/* 优惠计算 */}
      {cardData.marketPrice > 0 && cardData.livePrice > 0 && (
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-pink-800 mb-2">优惠信息</h3>
          <div className="text-sm text-pink-700">
            {cardData.marketPrice > cardData.livePrice ? (
              <>
                节省 ¥{(cardData.marketPrice - cardData.livePrice).toFixed(2)} (
                {((1 - cardData.livePrice / cardData.marketPrice) * 100).toFixed(1)}% OFF)
              </>
            ) : cardData.marketPrice < cardData.livePrice ? (
              <>直播价比市场价高 ¥{(cardData.livePrice - cardData.marketPrice).toFixed(2)}</>
            ) : (
              <>直播价与市场价相同</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
