import { useState, useRef } from 'react';
import { useCardStore } from '../store/cardStore';
import { Upload, X, Plus } from 'lucide-react';

export function ImageUpload() {
  const { cardData, updateImages } = useCardStore();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], 'main');
    }
  };

  const handleFile = (file: File, type: 'main' | 'back') => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'main') {
          updateImages(result, cardData.backImage);
        } else {
          updateImages(cardData.mainImage, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], type);
    }
  };

  const removeImage = (type: 'main' | 'back') => {
    if (type === 'main') {
      updateImages('', cardData.backImage);
    } else {
      updateImages(cardData.mainImage, '');
    }
  };

  const triggerFileInput = (type: 'main' | 'back') => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-type', type);
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const type = fileInputRef.current?.getAttribute('data-type') as 'main' | 'back' || 'main';
          handleFileInput(e, type);
        }}
        className="hidden"
      />

      {/* 主图上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">产品主图</label>
        {cardData.mainImage ? (
          <div className="relative">
            <img
              src={cardData.mainImage}
              alt="产品主图"
              className="w-full h-64 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage('main')}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => triggerFileInput('main')}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">点击或拖拽图片到此处上传</p>
            <p className="text-xs text-gray-500">支持 JPG、PNG、GIF 格式</p>
          </div>
        )}
      </div>

      {/* 背面图上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">产品背面图 (可选)</label>
        {cardData.backImage ? (
          <div className="relative">
            <img
              src={cardData.backImage}
              alt="产品背面图"
              className="w-full h-64 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage('back')}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0], 'back');
              }
            }}
            onClick={() => triggerFileInput('back')}
          >
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">点击或拖拽上传背面图</p>
            <p className="text-xs text-gray-500">可选，用于展示产品背面细节</p>
          </div>
        )}
      </div>

      

      {/* 图片要求说明 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">图片要求</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 建议尺寸：800x800 像素以上</li>
          <li>• 格式支持：JPG、PNG、GIF</li>
          <li>• 文件大小：不超过 5MB</li>
          <li>• 建议使用清晰、明亮的产品图片</li>
        </ul>
      </div>
    </div>
  );
}
