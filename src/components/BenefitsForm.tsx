import { useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { Plus, X } from 'lucide-react';

export function BenefitsForm() {
  const { cardData, updateBenefits } = useCardStore();
  const [newBenefit, setNewBenefit] = useState('');

  const addBenefit = () => {
    if (newBenefit.trim()) {
      updateBenefits(
        [...cardData.benefits, newBenefit.trim()],
        cardData.activityTime,
        cardData.shippingInfo,
        cardData.command
      );
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    updateBenefits(
      cardData.benefits.filter((_, i) => i !== index),
      cardData.activityTime,
      cardData.shippingInfo,
      cardData.command
    );
  };

  const handleActivityTimeChange = (value: string) => {
    updateBenefits(
      cardData.benefits,
      value,
      cardData.shippingInfo,
      cardData.command
    );
  };

  const handleShippingTypeChange = (type: 'presale' | 'instock') => {
    updateBenefits(
      cardData.benefits,
      cardData.activityTime,
      { ...cardData.shippingInfo, type },
      cardData.command
    );
  };

  const handleShippingTimeChange = (value: string) => {
    updateBenefits(
      cardData.benefits,
      cardData.activityTime,
      { ...cardData.shippingInfo, shippingTime: value },
      cardData.command
    );
  };

  const handleReturnPolicyChange = (value: string) => {
    updateBenefits(
      cardData.benefits,
      cardData.activityTime,
      { ...cardData.shippingInfo, returnPolicy: value },
      cardData.command
    );
  };

  const handleInsuranceChange = (checked: boolean) => {
    updateBenefits(
      cardData.benefits,
      cardData.activityTime,
      { ...cardData.shippingInfo, insurance: checked },
      cardData.command
    );
  };

  const handleCommandChange = (value: string) => {
    updateBenefits(
      cardData.benefits,
      cardData.activityTime,
      cardData.shippingInfo,
      value
    );
  };

  return (
    <div className="space-y-6">
      {/* 直播间福利 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">直播间福利</label>
        <div className="space-y-2">
          {cardData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...cardData.benefits];
                  newBenefits[index] = e.target.value;
                  updateBenefits(
                    newBenefits,
                    cardData.activityTime,
                    cardData.shippingInfo,
                    cardData.command
                  );
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="福利描述"
              />
              <button
                type="button"
                onClick={() => removeBenefit(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="添加福利，如：盲盒发夹(1)+海岛花发夹(1)"
            />
            <button
              type="button"
              onClick={addBenefit}
              className="text-pink-600 hover:text-pink-700 p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          描述直播间专属福利，可添加多个
        </p>
      </div>

      {/* 活动时间 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">活动时间</label>
        <input
          type="text"
          value={cardData.activityTime}
          onChange={(e) => handleActivityTimeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="如：此刻至2026.01.31（管阿姨专属）"
        />
        <p className="text-xs text-gray-500 mt-1">
          描述活动有效时间
        </p>
      </div>

      {/* 发货信息 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">发货信息</label>
        
        {/* 发货类型 */}
        <div className="flex space-x-4 mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              checked={cardData.shippingInfo.type === 'presale'}
              onChange={() => handleShippingTypeChange('presale')}
              className="mr-2 text-pink-600 focus:ring-pink-500"
            />
            预售
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={cardData.shippingInfo.type === 'instock'}
              onChange={() => handleShippingTypeChange('instock')}
              className="mr-2 text-pink-600 focus:ring-pink-500"
            />
            现货
          </label>
        </div>

        {/* 发货时间 */}
        <input
          type="text"
          value={cardData.shippingInfo.shippingTime}
          onChange={(e) => handleShippingTimeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-3"
          placeholder="如：5天内发货"
        />

        {/* 退换货政策 */}
        <input
          type="text"
          value={cardData.shippingInfo.returnPolicy}
          onChange={(e) => handleReturnPolicyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-3"
          placeholder="如：7天无理由退换货，有运费险"
        />

        {/* 运费险 */}
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={cardData.shippingInfo.insurance}
            onChange={(e) => handleInsuranceChange(e.target.checked)}
            className="mr-2 text-pink-600 focus:ring-pink-500 rounded"
          />
          <span className="text-sm text-gray-700">包含运费险</span>
        </label>
      </div>

      {/* 直播口令 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">直播口令</label>
        <input
          type="text"
          value={cardData.command}
          onChange={(e) => handleCommandChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono"
          placeholder="如：dbisFPXYET2J"
        />
        <p className="text-xs text-gray-500 mt-1">
          用户下单时需要输入的专属口令
        </p>
      </div>

      {/* 预览 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">信息预览</h3>
        
        {cardData.benefits.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">直播间福利</div>
            <div className="text-sm text-gray-700">
              {cardData.benefits.join('；')}
            </div>
          </div>
        )}

        {cardData.activityTime && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">活动时间</div>
            <div className="text-sm text-gray-700">{cardData.activityTime}</div>
          </div>
        )}

        {cardData.shippingInfo.shippingTime && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">发货信息</div>
            <div className="text-sm text-gray-700">
              {cardData.shippingInfo.type === 'presale' ? '预售' : '现货'} · {cardData.shippingInfo.shippingTime}
              {cardData.shippingInfo.insurance && ' · 含运费险'}
            </div>
          </div>
        )}

        {cardData.shippingInfo.returnPolicy && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">退换政策</div>
            <div className="text-sm text-gray-700">{cardData.shippingInfo.returnPolicy}</div>
          </div>
        )}

        {cardData.command && (
          <div>
            <div className="text-xs text-gray-500 mb-1">直播口令</div>
            <div className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded border">
              {cardData.command}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}