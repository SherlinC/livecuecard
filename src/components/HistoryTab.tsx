import { useCardStore } from '../store/cardStore';

export function HistoryTab() {
  const { history } = useCardStore() as any;

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-600">暂无历史记录</div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((h: any) => (
        <div key={h.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
          {h.previewUrl ? (
            <img src={h.previewUrl} alt="预览" className="w-16 h-16 rounded object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-500">无预览</div>
          )}
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 line-clamp-1">{h.data.productTitle || '未命名手卡'}</div>
            <div className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
