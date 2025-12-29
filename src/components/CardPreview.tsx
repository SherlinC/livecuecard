import { useCardStore } from '../store/cardStore';
import type { CardData } from '../types/card';

export function CardPreview({ data }: { data?: CardData }) {
  const { cardData } = useCardStore();
  const d = data ?? cardData;
  return (
    <div className="card-font bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto border border-gray-200">
      {/* 品牌与平台同一行：左品牌，右平台 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-[6px]">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-black">
            {d.brandLogo && (
              <img src={d.brandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="text-sm font-medium text-gray-900 uppercase">{(d.brandName || '品牌')}</div>
        </div>
        <div className="flex items-center space-x-2">
          {d.platforms.map((platform, index) => (
            <div key={index} className="platform-badge">
              {platform}
            </div>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="space-y-4">
        {/* 产品标题 */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {d.productTitle || '产品标题'}
          </h3>
        </div>

        {/* 产品图片（正面/背面并排或占位） */}
        <div className={`${cardData.mainImage && cardData.backImage ? 'grid grid-cols-2 gap-3' : 'flex justify-center'}`}>
          {d.mainImage && (
            <div className="rounded-lg overflow-hidden">
              <div className="aspect-square">
                <img
                  src={d.mainImage}
                  alt="产品正面"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          {d.backImage && (
            <div className="bg-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-square">
                <img
                  src={d.backImage}
                  alt="产品背面"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center text-xs text-gray-600 mt-1">背面</div>
            </div>
          )}
          {!d.mainImage && !d.backImage && (
            <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm w-full max-w-[280px]">
              <div className="aspect-square w-full flex items-center justify-center">商品图</div>
            </div>
          )}
        </div>

        {/* 材料信息 */}
        {d.materials.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">材料</h4>
            {d.materials.map((material, index) => (
              <div key={index} className="text-sm text-gray-600 mb-1">
                {index + 1}. {material.text}
              </div>
            ))}
          </div>
        )}

        {/* 设计特点 */}
        {d.designs.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">设计</h4>
            {d.designs.map((design, index) => (
              <div key={index} className="text-sm text-gray-600 mb-1">
                {index + 1}. {design.text}
              </div>
            ))}
          </div>
        )}

        {/* 价格信息 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black text-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-300">市场价</div>
            <div className="text-sm font-bold">¥{d.marketPrice || 0}</div>
          </div>
          <div className="bg-pink-600 text-white rounded-lg p-3 text-center">
            <div className="text-xs text-pink-200">直播价</div>
            <div className="text-sm font-bold">¥{d.livePrice || 0}</div>
            {d.discount && (
              <div className="text-xs text-pink-200">{d.discount}</div>
            )}
          </div>
          <div className="bg-gray-600 text-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-300">佣金</div>
            <div className="text-sm font-bold">{d.commission || 0}%</div>
          </div>
        </div>

        {/* 规格信息：颜色与尺码 */}
        {(d.colors && d.colors.length > 0) || (d.sizes && d.sizes.length > 0) ? (
          <div className="grid grid-cols-2 gap-2">
            {(d.colors && d.colors.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">颜色</h4>
                <div className="text-sm text-gray-600">
                  {(d.colors || []).join('、')}
                </div>
              </div>
            )}
            {(d.sizes && d.sizes.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">尺码</h4>
                <div className="text-sm text-gray-600">
                  {d.sizes.map(s => s + (d.sizeNotes && d.sizeNotes[s] ? `（${d.sizeNotes[s]}）` : '')).join('、')}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {(d.sizeRecommendations && d.sizeRecommendations.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">身高体重推荐</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {d.sizeRecommendations.map((rec, idx) => (
                <div key={idx}>
                  {rec.height}cm · {rec.weight}kg · 推荐 {rec.recommendedSize}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 尺寸表 */}
        {Object.keys(d.sizeChart.sizes).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">尺寸表</h4>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b">
                    {d.sizeChart.headers.map((header, index) => (
                      <th key={index} className="text-left py-1 px-2 text-gray-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(d.sizeChart.sizes).map(([size, data], index) => (
                    <tr key={index} className="border-b">
                      <td className="py-1 px-2 font-medium">{size}</td>
                      {d.sizeChart.headers.slice(1).map((header, headerIndex) => (
                        <td key={headerIndex} className="py-1 px-2 text-gray-600">
                          {data[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 福利活动 */}
        {(d.benefits.length > 0 || d.activityTime || d.shippingInfo.shippingTime || d.command) && (
          <div className="space-y-3">
            {d.benefits.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">直播间福利</h4>
                {d.benefits.map((benefit, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {benefit}
                  </div>
                ))}
              </div>
            )}

            {(d.shippingInfo.shippingTime || d.shippingInfo.insurance || d.shippingInfo.returnPolicy) && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">发货信息</h4>
                <div className="text-sm text-gray-600">
                  {[
                    (d.shippingInfo.type === 'presale' ? '预售' : '现货'),
                    d.shippingInfo.shippingTime || '',
                    d.shippingInfo.insurance ? '含运费险' : '',
                    d.shippingInfo.returnPolicy || ''
                  ].filter(Boolean).join(' · ')}
                </div>
              </div>
            )}

            {(d.activityTime && d.command) ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">活动时间</h4>
                  <div className="text-sm text-gray-600">{d.activityTime}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">直播口令</h4>
                  <div className="text-sm text-gray-600 font-mono">{d.command}</div>
                </div>
              </div>
            ) : (
              <>
                {d.activityTime && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">活动时间</h4>
                    <div className="text-sm text-gray-600">{d.activityTime}</div>
                  </div>
                )}
                {d.command && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">直播口令</h4>
                    <div className="text-sm text-gray-600 font-mono">{d.command}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
