import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';

export function HistoryPage() {
  const navigate = useNavigate();
  const { history, updateCardData, removeHistoryEntry } = useCardStore() as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
        <div className="text-sm text-gray-500">共 {history?.length || 0} 条</div>
      </div>

      {(!history || history.length === 0) ? (
        <div className="text-center py-20">
          <p className="text-gray-600">暂无历史记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((h: any) => (
            <div key={h.id} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col">
              {h.previewUrl ? (
                <img src={h.previewUrl} alt="预览" className="w-full h-40 rounded object-cover border" />
              ) : (
                <div className="w-full h-40 rounded bg-gray-100 border flex items-center justify-center text-sm text-gray-500">无预览</div>
              )}
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-900">{h.name || h.data.productTitle || '未命名手卡'}</div>
                <div className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => { updateCardData(h.data); navigate('/editor'); }}
                >打开到编辑器</button>
                <button
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => { if (confirm('确认删除该历史手卡？')) removeHistoryEntry(h.id); }}
                >删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
