export function TemplatesPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">模板库</h1>
        <p className="text-gray-600">选择一个模板开始制作</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="text-gray-900 font-semibold mb-3">横版</div>
          <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-white p-4 h-[420px] flex flex-col">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-8 h-8 rounded-full bg-black" />
              <div className="text-sm">品牌</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 h-64 items-stretch flex-none">
              <div className="flex flex-col h-full gap-4">
                <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">商品图</div>
                <div className="bg-gray-100 rounded-xl h-16 flex items-center px-4 text-gray-500 text-sm">名称 XXX</div>
              </div>
              <div className="flex flex-col h-full space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-black text-white h-16 flex items-center justify-center text-sm">
                    <div>
                      <div className="opacity-80">市场价</div>
                      <div className="text-xl font-semibold">1xxx</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-pink-500 text-white h-16 flex items-center justify-center text-sm">
                    <div>
                      <div>直播价</div>
                      <div className="text-xl font-semibold">9xx</div>
                      <div className="opacity-80 text-xs">8.3折</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-200 text-gray-800 h-16 flex items-center justify-center text-sm">
                    <div>
                      <div>佣金</div>
                      <div className="text-xl font-semibold">xx%</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 bg-gray-50 rounded-xl p-4 flex-1">
                  <div>
                    <div className="text-gray-600 mb-1">材料</div>
                    <div className="text-gray-800 text-sm">1. xxxx</div>
                    <div className="text-gray-800 text-sm">2. xxxxxxxx</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">设计</div>
                    <div className="text-gray-800 text-sm">1. xxxxx</div>
                    <div className="text-gray-800 text-sm">2. xxxxxxxx</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl mt-4 flex items-center justify-center text-gray-500 text-sm flex-1">尺码表</div>
          </div>
        </div>

        <div>
          <div className="text-gray-900 font-semibold mb-3">竖版</div>
          <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-white p-4 h-[420px]">
            <div className="flex items-center justify-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-black" />
              <div className="text-sm">品牌</div>
            </div>
            <div className="bg-gray-100 rounded-xl h-44 mt-4 flex items-center justify-center text-gray-500 text-sm">商品图</div>
            <div className="bg-gray-100 rounded-xl h-16 mt-4 flex items-center px-4 text-gray-500 text-sm">名称 XXX</div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl bg-black text-white h-16 flex items-center justify-center text-sm">
                <div>
                  <div className="opacity-80">市场价</div>
                  <div className="text-xl font-semibold">1xxx</div>
                </div>
              </div>
              <div className="rounded-xl bg-pink-500 text-white h-16 flex items-center justify-center text-sm">
                <div>
                  <div>直播价</div>
                  <div className="text-xl font-semibold">9xx</div>
                  <div className="opacity-80 text-xs">8.3折</div>
                </div>
              </div>
              <div className="rounded-xl bg-gray-200 text-gray-800 h-16 flex items-center justify-center text-sm">
                <div>
                  <div>佣金</div>
                  <div className="text-xl font-semibold">xx%</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <div>
                <div className="text-gray-600 mb-1">材料</div>
                <div className="text-gray-800 text-sm">1. xxxx</div>
                <div className="text-gray-800 text-sm">2. xxxxxxxx</div>
              </div>
              <div className="mt-3">
                <div className="text-gray-600 mb-1">设计</div>
                <div className="text-gray-800 text-sm">1. xxxxx</div>
                <div className="text-gray-800 text-sm">2. xxxxxxxx</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
