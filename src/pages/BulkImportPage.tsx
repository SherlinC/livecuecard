import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, Package2 } from 'lucide-react';
import { parseExcel, downloadTemplate } from '../utils/excel';
import { useCardStore } from '../store/cardStore';
import { CardPreview } from '../components/CardPreview';
import { generateCardImage, dataURLToBlob } from '../utils/imageGenerator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as Dialog from '@radix-ui/react-dialog';
import type { CardData } from '../types/card';

export function BulkImportPage() {
  const [rowsCount, setRowsCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const { updateCardData } = useCardStore();
  const [items, setItems] = useState<CardData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<CardData | null>(null);

  const parsedRowsRef = useRef<any[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const { rows, errors } = await parseExcel(file);
    parsedRowsRef.current = rows;
    setRowsCount(rows.length);
    setErrors(errors);
    setItems(rows as CardData[]);
  };

  const ensureImageLoaded = (url?: string) => new Promise<void>((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });

  const batchGenerate = async () => {
    if (!previewRef.current || items.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    const zip = new JSZip();

    for (let i = 0; i < items.length; i++) {
      const row = items[i];

      await Promise.all([
        ensureImageLoaded(row.mainImage),
        ensureImageLoaded(row.backImage)
      ]);
      await new Promise(r => setTimeout(r, 50));

      const target = (previewRef.current.firstElementChild as HTMLElement) || previewRef.current;
      const result = await generateCardImage(target);
      if (result.success && result.dataURL) {
        const blob = dataURLToBlob(result.dataURL);
        if (blob) {
          const base = row.productTitle?.slice(0, 20) || `手卡_${i+1}`;
          zip.file(`${base}.png`, blob);
        }
      }
      setProgress(Math.round(((i + 1) / items.length) * 100));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, '手卡批量.zip');
    setIsGenerating(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">批量导入</h1>
        <p className="text-gray-600 mb-6">上传符合模板的Excel文件，系统将批量生成手卡图片并打包下载。</p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg cursor-pointer hover:bg-pink-700">
              <Upload className="w-4 h-4 mr-2" />
              选择Excel文件
              <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
            </label>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              下载Excel模板
            </button>
          </div>

          {fileName && (
            <div className="mt-4 text-sm text-gray-600">已选择：{fileName}</div>
          )}

          <div className="mt-4 flex items-center gap-6 text-sm">
            <div>解析到 <span className="font-semibold text-pink-600">{rowsCount}</span> 行</div>
            {errors.length > 0 && (
              <div className="text-red-600">错误：{errors.slice(0,3).join('；')}{errors.length>3?'…':''}</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">批量生成</h2>
            <button
              disabled={isGenerating || rowsCount===0}
              onClick={batchGenerate}
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              <Package2 className="w-4 h-4 mr-2" />
              {isGenerating ? `正在生成 (${progress}%)` : '开始批量生成并打包下载'}
            </button>
          </div>
          <div className="text-sm text-gray-600">点击后会在后台依次生成每张手卡，并最终打包为一个ZIP下载。</div>
        </div>

        {items.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">预览与编辑</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {items.map((it, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-3">
                  <div className="border rounded-lg">
                    <CardPreview data={it} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-700 truncate max-w-[65%]">{it.productTitle || `手卡 ${idx+1}`}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingIndex(idx);
                          setEditing(JSON.parse(JSON.stringify(it)));
                        }}
                        className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >编辑</button>
                      <button
                        onClick={() => {
                          const arr = items.filter((_, i) => i !== idx);
                          setItems(arr);
                          setRowsCount(arr.length);
                        }}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog.Root open={editingIndex !== null} onOpenChange={(o) => { if (!o) { setEditingIndex(null); setEditing(null); } }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">编辑手卡</h3>
              {editing && (
                <div className="space-y-3">
                  <input
                    value={editing.productTitle}
                    onChange={(e) => setEditing({ ...editing, productTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="产品标题"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editing.marketPrice}
                      onChange={(e) => setEditing({ ...editing, marketPrice: parseFloat(e.target.value || '0') })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="市场价"
                    />
                    <input
                      type="number"
                      value={editing.livePrice}
                      onChange={(e) => setEditing({ ...editing, livePrice: parseFloat(e.target.value || '0') })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="直播价"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={editing.discount}
                      onChange={(e) => setEditing({ ...editing, discount: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="折扣信息"
                    />
                    <input
                      type="number"
                      value={editing.commission}
                      onChange={(e) => setEditing({ ...editing, commission: parseFloat(e.target.value || '0') })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="佣金比例%"
                    />
                  </div>
                  <input
                    value={(editing.colors || []).join(', ')}
                    onChange={(e) => setEditing({ ...editing, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean), color: e.target.value.split(',').map(s => s.trim()).filter(Boolean)[0] || '' })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="颜色，逗号分隔"
                  />
                  <input
                    value={(editing.sizes || []).join(', ')}
                    onChange={(e) => setEditing({ ...editing, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="尺码，逗号分隔"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Dialog.Close className="px-3 py-2 bg-gray-100 rounded">取消</Dialog.Close>
                <button
                  onClick={() => {
                    if (editingIndex !== null && editing) {
                      const arr = [...items];
                      arr[editingIndex] = editing;
                      setItems(arr);
                      setEditingIndex(null);
                      setEditing(null);
                    }
                  }}
                  className="px-3 py-2 bg-pink-600 text-white rounded"
                >保存</button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
          <div ref={previewRef}>
            {editing ? <CardPreview data={editing} /> : items[0] ? <CardPreview data={items[0]} /> : <CardPreview />}
          </div>
        </div>
      </div>
      {items.length > 0 && (
        <button
          onClick={batchGenerate}
          disabled={isGenerating}
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl bg-pink-600 text-white shadow-lg hover:bg-pink-700 disabled:opacity-50"
        >{isGenerating ? `正在批量生成 (${progress}%)` : '批量生成'}</button>
      )}
    </div>
  );
}
