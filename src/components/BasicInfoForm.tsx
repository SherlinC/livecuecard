import { useState, useRef } from 'react';
import { useCardStore } from '../store/cardStore';
import { Plus, X, Trash } from 'lucide-react';

export function BasicInfoForm() {
  const { cardData, updateBasicInfo, updateMaterials, updateDesigns } = useCardStore();
  const [newMaterial, setNewMaterial] = useState('');
  const [newDesign, setNewDesign] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const platforms = ['小红书', '淘宝', '抖音', '快手', '微博'];

  const handlePlatformChange = (platform: string) => {
    const newPlatforms = cardData.platforms.includes(platform)
      ? cardData.platforms.filter(p => p !== platform)
      : [...cardData.platforms, platform];
    updateBasicInfo(newPlatforms, cardData.productTitle);
  };

  const handleLogoFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        useCardStore.getState().updateCardData({ brandLogo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoFile(e.target.files[0]);
    }
  };

  const triggerLogoInput = () => {
    logoInputRef.current?.click();
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      updateMaterials([...cardData.materials, { text: newMaterial.trim() }]);
      setNewMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    updateMaterials(cardData.materials.filter((_, i) => i !== index));
  };

  const addDesign = () => {
    if (newDesign.trim()) {
      updateDesigns([...cardData.designs, { text: newDesign.trim() }]);
      setNewDesign('');
    }
  };

  const removeDesign = (index: number) => {
    updateDesigns(cardData.designs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* 平台选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">直播平台</label>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => handlePlatformChange(platform)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                cardData.platforms.includes(platform)
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">品牌名称</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoInput}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <div
              className="group relative w-12 h-12 rounded-full overflow-hidden bg-black cursor-pointer"
              onClick={triggerLogoInput}
            >
              {cardData.brandLogo ? (
                <img src={cardData.brandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-white">+logo</div>
              )}
              {cardData.brandLogo && (
                <button
                  type="button"
                  className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    useCardStore.getState().updateCardData({ brandLogo: '' });
                  }}
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={cardData.brandName || ''}
              onChange={(e) => useCardStore.getState().updateCardData({ brandName: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
              placeholder="品牌名称"
            />
          </div>
        </div>
      </div>

      {/* 产品标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">产品标题</label>
        <textarea
          value={cardData.productTitle}
          onChange={(e) => updateBasicInfo(cardData.platforms, e.target.value)}
          placeholder="请输入产品标题"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 resize-none"
          rows={2}
        />
      </div>

      {/* 材料信息 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">材料信息</label>
        <div className="space-y-2">
          {cardData.materials.map((material, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <input
                type="text"
                value={material.text}
                onChange={(e) => {
                  const newMaterials = [...cardData.materials];
                  newMaterials[index].text = e.target.value;
                  updateMaterials(newMaterials);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newMaterials = [...cardData.materials];
                    newMaterials.splice(index + 1, 0, { text: '' });
                    updateMaterials(newMaterials);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
                placeholder="材料描述"
              />
              <button
                type="button"
                onClick={() => removeMaterial(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 w-6">{cardData.materials.length + 1}.</span>
            <input
              type="text"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
              placeholder="添加材料信息"
            />
            <button
              type="button"
              onClick={addMaterial}
              className="text-pink-600 hover:text-pink-700 p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 设计特点 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">设计特点</label>
        <div className="space-y-2">
          {cardData.designs.map((design, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <input
                type="text"
                value={design.text}
                onChange={(e) => {
                  const newDesigns = [...cardData.designs];
                  newDesigns[index].text = e.target.value;
                  updateDesigns(newDesigns);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newDesigns = [...cardData.designs];
                    newDesigns.splice(index + 1, 0, { text: '' });
                    updateDesigns(newDesigns);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
                placeholder="设计特点"
              />
              <button
                type="button"
                onClick={() => removeDesign(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 w-6">{cardData.designs.length + 1}.</span>
            <input
              type="text"
              value={newDesign}
              onChange={(e) => setNewDesign(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDesign()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
              placeholder="添加设计特点"
            />
            <button
              type="button"
              onClick={addDesign}
              className="text-pink-600 hover:text-pink-700 p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 颜色选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
        <div className="space-y-2">
          {(cardData.colors ?? []).map((c, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <input
                type="text"
                value={c}
                onChange={(e) => {
                  const arr = [...(cardData.colors ?? [])];
                  arr[index] = e.target.value;
                  useCardStore.getState().updateCardData({ colors: arr, color: arr[0] ?? '' });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const arr = [...(cardData.colors ?? [])];
                    arr.splice(index + 1, 0, '');
                    useCardStore.getState().updateCardData({ colors: arr, color: arr[0] ?? '' });
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
                placeholder="颜色"
              />
              <button
                type="button"
                onClick={() => {
                  const arr = (cardData.colors ?? []).filter((_, i) => i !== index);
                  useCardStore.getState().updateCardData({ colors: arr, color: arr[0] ?? '' });
                }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 w-6">{(cardData.colors?.length ?? 0) + 1}.</span>
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newColor.trim()) {
                  const arr = [...(cardData.colors ?? []), newColor.trim()];
                  useCardStore.getState().updateCardData({ colors: arr, color: arr[0] ?? '' });
                  setNewColor('');
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
              placeholder="如：黑色、白色、红色"
            />
            <button
              type="button"
              onClick={() => {
                if (newColor.trim()) {
                  const arr = [...(cardData.colors ?? []), newColor.trim()];
                  useCardStore.getState().updateCardData({ colors: arr, color: arr[0] ?? '' });
                  setNewColor('');
                }
              }}
              className="text-pink-600 hover:text-pink-700 p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 尺码选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">可选尺码</label>
        <div className="space-y-2">
          {cardData.sizes.map((s, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <input
                type="text"
                value={s}
                onChange={(e) => {
                  const arr = [...cardData.sizes];
                  arr[index] = e.target.value;
                  useCardStore.getState().updateCardData({ sizes: arr });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const arr = [...cardData.sizes];
                    arr.splice(index + 1, 0, '');
                    useCardStore.getState().updateCardData({ sizes: arr });
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
                placeholder="尺码，如：S、M、L、XL"
              />
              <button
                type="button"
                onClick={() => {
                  const arr = cardData.sizes.filter((_, i) => i !== index);
                  useCardStore.getState().updateCardData({ sizes: arr });
                }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 w-6">{cardData.sizes.length + 1}.</span>
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newSize.trim()) {
                  const arr = [...cardData.sizes, newSize.trim()];
                  useCardStore.getState().updateCardData({ sizes: arr });
                  setNewSize('');
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 text-sm"
              placeholder="添加尺码，如：S、M、L、XL"
            />
            <button
              type="button"
              onClick={() => {
                if (newSize.trim()) {
                  const arr = [...cardData.sizes, newSize.trim()];
                  useCardStore.getState().updateCardData({ sizes: arr });
                  setNewSize('');
                }
              }}
              className="text-pink-600 hover:text-pink-700 p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
