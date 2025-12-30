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
import { useNavigate } from 'react-router-dom';

export function BulkImportPage() {
  const [rowsCount, setRowsCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [templateType, setTemplateType] = useState<'portrait' | 'landscape'>('landscape');
  const [bulkBrandLogo, setBulkBrandLogo] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);
  const { updateCardData, resetCardData } = useCardStore();
  const navigate = useNavigate();
  const [items, setItems] = useState<CardData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<CardData | null>(null);
  const bulkLogoInputRef = useRef<HTMLInputElement>(null);

  const parsedRowsRef = useRef<any[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const { rows, errors } = await parseExcel(file);
    parsedRowsRef.current = rows;
    setRowsCount(rows.length);
    setErrors(errors);
    const withLogo = bulkBrandLogo ? (rows as CardData[]).map(r => ({ ...r, brandLogo: bulkBrandLogo })) : (rows as CardData[]);
    setItems(withLogo);
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
      setEditing(row);
      await new Promise(r => setTimeout(r, 120));

      const target = (previewRef.current.querySelector(`[data-template="${templateType}"]`) as HTMLElement)
        || (previewRef.current.firstElementChild as HTMLElement)
        || previewRef.current;
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
    const brand = (items.find(it => (it.brandName && it.brandName.trim()))?.brandName?.trim() || '手卡');
    const suffix = templateType === 'landscape' ? '横版' : '竖版';
    const safe = brand.replace(/[^\u4e00-\u9fa5\w\-]+/g, '_');
    saveAs(zipBlob, `${safe}_${suffix}.zip`);
    setIsGenerating(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">批量导入</h1>

        </div>
        <p className="text-gray-600 mb-6">上传符合模板的Excel文件，系统将批量生成手卡图片并打包下载。</p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">下载Excel模板</h2>
          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            下载Excel模板
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg cursor-pointer hover:bg-pink-700">
              <Upload className="w-4 h-4 mr-2" />
              选择Excel文件
              <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
            </label>
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

          <div className="mt-4">
            <h3 className="text-md font-semibold text-gray-900 mb-2">批量增加品牌Logo</h3>
            <input
              ref={bulkLogoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const url = String(reader.result || '');
                  setBulkBrandLogo(url);
                  setItems(prev => prev.map(it => ({ ...it, brandLogo: url })));
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div
                className="group relative w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-200 cursor-pointer"
                onClick={() => bulkLogoInputRef.current?.click()}
              >
                {bulkBrandLogo ? (
                  <img src={bulkBrandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-700">
                    <span className="inline group-hover:hidden">Logo</span>
                    <span className="hidden group-hover:inline">+</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">设置后，批量预览与导出中的所有卡片均使用该Logo</div>
            </div>
          </div>
        </div>

        

        {items.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-md font-semibold text-gray-900">预览与编辑</h3>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${templateType==='landscape' ? 'bg-white border border-gray-300 text-pink-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setTemplateType('landscape')}
                >横版</button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${templateType==='portrait' ? 'bg-white border border-gray-300 text-pink-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setTemplateType('portrait')}
                >竖版</button>
              </div>
              <button
                disabled={isGenerating || rowsCount===0}
                onClick={batchGenerate}
                className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                <Package2 className="w-4 h-4 mr-2" />
                {isGenerating ? `正在生成 (${progress}%)` : '开始批量生成并打包下载'}
              </button>
            </div>
            <div className={`grid ${templateType==='portrait' ? 'md:grid-cols-3 gap-4' : 'grid-cols-2 gap-[30px]'}`}>
              {items.map((it, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-3">
                  <div className={`inline-block ${templateType==='landscape' ? 'w-full' : 'w-fit'}`}> 
                    {templateType === 'portrait' ? (
                      <div className="card-font bg-white rounded-2xl shadow p-4 border border-gray-200 box-border block w-full max-w-[400px] h-[300px] overflow-hidden">
                        <CardPreview data={it} fill frameless />
                      </div>
                    ) : (
                      // 横版预览
                      <div className="card-font bg-white rounded-2xl shadow p-4 border border-gray-200 box-border block w-full h-[300px] overflow-hidden">
                        <div className="flex items-center justify-between text-gray-900">
                          <div className="flex items-center gap-[6px]">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-black">
                              {it.brandLogo && (
                                <img src={it.brandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900 uppercase">{it.brandName || '品牌'}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {it.platforms.map((p: string, i: number) => (
                              <div key={i} className="platform-badge">{p}</div>
                            ))}
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <h3 className="text-lg font-bold text-gray-900 py-3 truncate break-words">{it.productTitle || '产品标题'}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 items-stretch min-h-0 overflow-hidden">
                          <div className="flex flex-col h-full gap-4">
                            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                              {it.mainImage ? (
                                <img src={it.mainImage} alt="商品图" className="w-full h-full object-cover" />
                              ) : (
                                <>商品图</>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col h-full space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-lg bg-black text-white h-16 flex items-center justify-center text-sm">
                                <div>
                                  <div className="text-xs text-gray-300">市场价</div>
                                  <div className="text-sm font-bold">¥{it.marketPrice || 0}</div>
                                </div>
                              </div>
                              <div className="rounded-lg bg-pink-600 text-white h-16 flex items-center justify-center text-sm">
                                <div>
                                  <div className="text-xs text-pink-200">直播价</div>
                                  <div className="text-sm font-bold">¥{it.livePrice || 0}</div>
                                  {it.discount && (
                                    <div className="opacity-80 text-xs">{it.discount}</div>
                                  )}
                                </div>
                              </div>
                              <div className="rounded-lg bg-gray-600 text-white h-16 flex items-center justify-center text-sm">
                                <div>
                                  <div className="text-xs text-gray-300">佣金</div>
                                  <div className="text-sm font-bold">{it.commission || 0}%</div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {it.materials.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-sm font-medium text-gray-700 mb-1">材料</div>
                                  {it.materials.map((m, index) => (
                                    <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                                  ))}
                                </div>
                              )}
                              {it.designs.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-sm font-medium text-gray-700 mb-1">设计</div>
                                  {it.designs.map((m, index) => (
                                    <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {(it.colors && it.colors.length > 0) || (it.sizes && it.sizes.length > 0) ? (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {(it.colors && it.colors.length > 0) && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">颜色</h4>
                                <div className="text-sm text-gray-600">{(it.colors || []).join('、')}</div>
                              </div>
                            )}
                            {(it.sizes && it.sizes.length > 0) && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">尺码</h4>
                                <div className="text-sm text-gray-600">{it.sizes.join('、')}</div>
                              </div>
                            )}
                          </div>
                        ) : null}
                        {(it.benefits.length > 0 || it.activityTime || it.shippingInfo.shippingTime || it.shippingInfo.insurance || it.shippingInfo.returnPolicy || it.command) && (
                          <div className="space-y-3 mt-2">
                            {(it.shippingInfo.shippingTime || it.shippingInfo.insurance || it.shippingInfo.returnPolicy) && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">发货信息</h4>
                                <div className="text-sm text-gray-600">
                                  {[
                                    (it.shippingInfo.type === 'presale' ? '预售' : '现货'),
                                    it.shippingInfo.shippingTime || '',
                                    it.shippingInfo.insurance ? '含运费险' : '',
                                    it.shippingInfo.returnPolicy || ''
                                  ].filter(Boolean).join(' · ')}
                                </div>
                              </div>
                            )}
                            {it.benefits.length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">直播间福利</h4>
                                {it.benefits.map((benefit, index) => (
                                  <div key={index} className="text-sm text-gray-600">{benefit}</div>
                                ))}
                              </div>
                            )}
                            {(it.activityTime && it.command) ? (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">活动时间</h4>
                                  <div className="text-sm text-gray-600">{it.activityTime}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">直播口令</h4>
                                  <div className="text-sm text-gray-600 font-mono">{it.command}</div>
                                </div>
                              </div>
                            ) : (
                              <>
                                {it.activityTime && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">活动时间</h4>
                                    <div className="text-sm text-gray-600">{it.activityTime}</div>
                                  </div>
                                )}
                                {it.command && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">直播口令</h4>
                                    <div className="text-sm text-gray-600 font-mono">{it.command}</div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-700 truncate max-w-[65%]">{it.productTitle || `手卡 ${idx+1}`}</div>
                    <div className="flex items-center gap-2 flex-nowrap">
                      <label className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 cursor-pointer h-8 whitespace-nowrap">
                        商品图
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const url = String(reader.result || '');
                              setItems(prev => prev.map((row, i) => i === idx ? { ...row, mainImage: url } : row));
                              if (editingIndex === idx && editing) {
                                setEditing({ ...editing, mainImage: url });
                                updateCardData({ mainImage: url });
                              }
                              e.currentTarget.value = '';
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          try {
                            setEditingIndex(idx);
                            setEditing(JSON.parse(JSON.stringify(it)));
                          } catch {}
                        }}
                        className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 h-8 whitespace-nowrap"
                      >编辑</button>
                      <button
                        onClick={() => {
                          const arr = items.filter((_, i) => i !== idx);
                          setItems(arr);
                          setRowsCount(arr.length);
                        }}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 h-8 whitespace-nowrap"
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
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] max-h-[80vh] bg-white rounded-xl shadow-xl p-0 flex flex-col">
              <div className="px-6 py-4 border-b bg-white">
                <h3 className="text-lg font-semibold">编辑手卡</h3>
              </div>
              <div className="px-6 py-4 flex-1 overflow-y-auto">
                <div className="flex gap-6">
                  <div className="basis-[35%] min-w-[320px] space-y-3">
                    {editing && (
                      <>
                        <input value={editing.productTitle} onChange={(e)=>setEditing({ ...editing, productTitle: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="产品标题" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={editing.marketPrice} onChange={(e)=>setEditing({ ...editing, marketPrice: parseFloat(e.target.value || '0') })} className="w-full px-3 py-2 border rounded" placeholder="市场价" />
                          <input type="number" value={editing.livePrice} onChange={(e)=>setEditing({ ...editing, livePrice: parseFloat(e.target.value || '0') })} className="w-full px-3 py-2 border rounded" placeholder="直播价" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editing.discount} onChange={(e)=>setEditing({ ...editing, discount: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="折扣信息" />
                          <input type="number" value={editing.commission} onChange={(e)=>setEditing({ ...editing, commission: parseFloat(e.target.value || '0') })} className="w-full px-3 py-2 border rounded" placeholder="佣金比例%" />
                        </div>
                        <input value={editing.brandName || ''} onChange={(e)=>setEditing({ ...editing, brandName: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="品牌名称" />
                        <textarea value={(editing.materials||[]).map(m=>m.text).join('\n')} onChange={(e)=>setEditing({ ...editing, materials: e.target.value.split('\n').map(t=>t.trim()).filter(Boolean).map(t=>({ text: t })) })} className="w-full px-3 py-2 border rounded h-24" placeholder="材料（每行一条）" />
                        <textarea value={(editing.designs||[]).map(d=>d.text).join('\n')} onChange={(e)=>setEditing({ ...editing, designs: e.target.value.split('\n').map(t=>t.trim()).filter(Boolean).map(t=>({ text: t })) })} className="w-full px-3 py-2 border rounded h-24" placeholder="设计（每行一条）" />
                        <input value={(editing.colors||[]).join(', ')} onChange={(e)=>setEditing({ ...editing, colors: e.target.value.split(',').map(s=>s.trim()).filter(Boolean), color: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)[0] || '' })} className="w-full px-3 py-2 border rounded" placeholder="颜色，逗号分隔" />
                        <input value={(editing.sizes||[]).join(', ')} onChange={(e)=>setEditing({ ...editing, sizes: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border rounded" placeholder="尺码，逗号分隔" />
                        <textarea value={(editing.benefits||[]).join('\n')} onChange={(e)=>setEditing({ ...editing, benefits: e.target.value.split('\n').map(s=>s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border rounded h-24" placeholder="直播间福利（每行一条）" />
                        <input value={editing.activityTime || ''} onChange={(e)=>setEditing({ ...editing, activityTime: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="活动时间" />
                        <div className="grid grid-cols-2 gap-3">
                          <select value={editing.shippingInfo?.type || 'presale'} onChange={(e)=>setEditing({ ...editing, shippingInfo: { ...(editing.shippingInfo||{ type:'presale', shippingTime:'', returnPolicy:'', insurance:false }), type: e.target.value as any } })} className="w-full px-3 py-2 border rounded">
                            <option value="presale">预售</option>
                            <option value="instock">现货</option>
                          </select>
                          <input value={editing.shippingInfo?.shippingTime || ''} onChange={(e)=>setEditing({ ...editing, shippingInfo: { ...(editing.shippingInfo||{ type:'presale', shippingTime:'', returnPolicy:'', insurance:false }), shippingTime: e.target.value } })} className="w-full px-3 py-2 border rounded" placeholder="发货时间" />
                        </div>
                        <input value={editing.shippingInfo?.returnPolicy || ''} onChange={(e)=>setEditing({ ...editing, shippingInfo: { ...(editing.shippingInfo||{ type:'presale', shippingTime:'', returnPolicy:'', insurance:false }), returnPolicy: e.target.value } })} className="w-full px-3 py-2 border rounded" placeholder="退换政策" />
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!editing.shippingInfo?.insurance} onChange={(e)=>setEditing({ ...editing, shippingInfo: { ...(editing.shippingInfo||{ type:'presale', shippingTime:'', returnPolicy:'', insurance:false }), insurance: e.target.checked } })} />
                          含运费险
                        </label>
                        <input value={editing.command || ''} onChange={(e)=>setEditing({ ...editing, command: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="直播口令" />
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 mb-2">预览</div>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      {editing && (
                        templateType === 'portrait' ? (
                          <CardPreview data={editing} />
                        ) : (
                          (() => {
                            const d = editing;
                            return (
                              <div className="card-font bg-white rounded-2xl shadow p-4 border border-gray-200 block w-full">
                                <div className="flex items-center justify-between text-gray-900">
                                  <div className="flex items-center gap-[6px]">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-black">
                                      {d.brandLogo && (
                                        <img src={d.brandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 uppercase">{d.brandName || '品牌'}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {d.platforms.map((p: string, i: number) => (
                                      <div key={i} className="platform-badge">{p}</div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-center mt-2">
                                  <h3 className="text-lg font-bold text-gray-900 py-3">{d.productTitle || '产品标题'}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 items-stretch">
                                  <div className="flex flex-col h-full gap-4">
                                    <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                                      {d.mainImage ? (
                                        <img src={d.mainImage} alt="商品图" className="w-full h-full object-cover" />
                                      ) : (
                                        <>商品图</>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col h-full space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="rounded-lg bg-black text-white h-16 flex items-center justify-center text-sm">
                                        <div>
                                          <div className="text-xs text-gray-300">市场价</div>
                                          <div className="text-sm font-bold">¥{d.marketPrice || 0}</div>
                                        </div>
                                      </div>
                                      <div className="rounded-lg bg-pink-600 text-white h-16 flex items-center justify-center text-sm">
                                        <div>
                                          <div className="text-xs text-pink-200">直播价</div>
                                          <div className="text-sm font-bold">¥{d.livePrice || 0}</div>
                                          {d.discount && (
                                            <div className="opacity-80 text-xs">{d.discount}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="rounded-lg bg-gray-600 text-white h-16 flex items-center justify-center text-sm">
                                        <div>
                                          <div className="text-xs text-gray-300">佣金</div>
                                          <div className="text-sm font-bold">{d.commission || 0}%</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      {d.materials.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                          <div className="text-sm font-medium text-gray-700 mb-1">材料</div>
                                          {d.materials.map((m: any, index: number) => (
                                            <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                                          ))}
                                        </div>
                                      )}
                                      {d.designs.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                          <div className="text-sm font-medium text-gray-700 mb-1">设计</div>
                                          {d.designs.map((m: any, index: number) => (
                                            <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {(d.colors && d.colors.length > 0) || (d.sizes && d.sizes.length > 0) ? (
                                  <div className="grid grid-cols-2 gap-2 mt-4">
                                    {(d.colors && d.colors.length > 0) && (
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">颜色</h4>
                                        <div className="text-sm text-gray-600">{(d.colors || []).join('、')}</div>
                                      </div>
                                    )}
                                    {(d.sizes && d.sizes.length > 0) && (
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">尺码</h4>
                                        <div className="text-sm text-gray-600">{d.sizes.join('、')}</div>
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                                {(d.benefits.length > 0 || d.activityTime || d.shippingInfo.shippingTime || d.shippingInfo.insurance || d.shippingInfo.returnPolicy || d.command) && (
                                  <div className="space-y-3 mt-2">
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
                                    {d.benefits.length > 0 && (
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">直播间福利</h4>
                                        {d.benefits.map((benefit: string, index: number) => (
                                          <div key={index} className="text-sm text-gray-600">{benefit}</div>
                                        ))}
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
                            );
                          })()
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg.white">
                <div className="flex justify-end gap-2">
                  <Dialog.Close className="px-3 py-2 bg-gray-100 rounded">关闭</Dialog.Close>
                  <button onClick={()=>{ if (editingIndex !== null && editing) { const arr = [...items]; arr[editingIndex] = editing; setItems(arr); setEditingIndex(null); setEditing(null); } }} className="px-3 py-2 bg-pink-600 text-white rounded">保存</button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
          <div ref={previewRef}>
            {templateType === 'portrait' ? (
              <div data-template="portrait">
                {editing ? <CardPreview data={editing} /> : items[0] ? <CardPreview data={items[0]} /> : <CardPreview />}
              </div>
            ) : (
              (() => {
                const d = editing ?? (items[0] || null);
                if (!d) return <div data-template="landscape"><CardPreview /></div>;
                return (
                  <div data-template="landscape" className="card-font bg-white rounded-2xl shadow-lg p-6 border border-gray-200 inline-block w-[600px] flex flex-col">
                    <div className="flex items-center justify-between text-gray-900">
                      <div className="flex items-center gap-[6px]">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black">
                          {d.brandLogo && (
                            <img src={d.brandLogo} alt="品牌Logo" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900 uppercase">{d.brandName || '品牌'}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {d.platforms.map((p: string, i: number) => (
                          <div key={i} className="platform-badge">{p}</div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <h3 className="text-lg font-bold text-gray-900 py-3">{d.productTitle || '产品标题'}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 items-stretch">
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                          {d.mainImage ? (
                            <img src={d.mainImage} alt="商品图" className="w-full h-full object-cover" />
                          ) : (
                            <>商品图</>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col h-full space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-black text-white h-16 flex items-center justify-center text-sm">
                            <div>
                              <div className="text-xs text-gray-300">市场价</div>
                              <div className="text-sm font-bold">¥{d.marketPrice || 0}</div>
                            </div>
                          </div>
                          <div className="rounded-lg bg-pink-600 text-white h-16 flex items-center justify-center text-sm">
                            <div>
                              <div className="text-xs text-pink-200">直播价</div>
                              <div className="text-sm font-bold">¥{d.livePrice || 0}</div>
                              {d.discount && (
                                <div className="opacity-80 text-xs">{d.discount}</div>
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg bg-gray-600 text-white h-16 flex items-center justify-center text-sm">
                            <div>
                              <div className="text-xs text-gray-300">佣金</div>
                              <div className="text-sm font-bold">{d.commission || 0}%</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {d.materials.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-700 mb-1">材料</div>
                              {d.materials.map((m, index) => (
                                <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                              ))}
                            </div>
                          )}
                          {d.designs.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-700 mb-1">设计</div>
                              {d.designs.map((m, index) => (
                                <div key={index} className="text-sm text-gray-600 mb-1">{index + 1}. {m.text}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {(d.colors && d.colors.length > 0) || (d.sizes && d.sizes.length > 0) ? (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {(d.colors && d.colors.length > 0) && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">颜色</h4>
                            <div className="text-sm text-gray-600">{(d.colors || []).join('、')}</div>
                          </div>
                        )}
                        {(d.sizes && d.sizes.length > 0) && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">尺码</h4>
                            <div className="text-sm text-gray-600">{d.sizes.join('、')}</div>
                          </div>
                        )}
                      </div>
                    ) : null}
                    {(d.benefits.length > 0 || d.activityTime || d.shippingInfo.shippingTime || d.shippingInfo.insurance || d.shippingInfo.returnPolicy || d.command) && (
                      <div className="space-y-3 mt-2">
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
                        {d.benefits.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">直播间福利</h4>
                            {d.benefits.map((benefit, index) => (
                              <div key={index} className="text-sm text-gray-600">{benefit}</div>
                            ))}
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
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
