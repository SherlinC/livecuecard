import { Link } from 'react-router-dom';
import { Edit, Layout, History, Sparkles, Zap, Palette } from 'lucide-react';

export function HomePage() {
  const features = [
    {
      icon: Sparkles,
      title: '简单易用',
      description: '拖拽式操作，所见即所得，无需设计基础'
    },
    {
      icon: Palette,
      title: '精美模板',
      description: '专业设计师打造的精美模板，一键使用'
    },
    {
      icon: Zap,
      title: '快速生成',
      description: '填写信息，秒级生成专业手卡'
    }
  ];

  const LandscapePreview = () => (
    <div className="group cursor-pointer">
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
  );

  const PortraitPreview = () => (
    <div className="group cursor-pointer">
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
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            专业直播手卡
            <span className="text-pink-600">一键生成</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            为直播带货量身打造的手卡生成工具，让您的直播更加专业、高效
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/editor"
              className="inline-flex items-center px-8 py-4 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
            >
              <Edit className="w-5 h-5 mr-2" />
              开始制作手卡
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-xl border-2 border-pink-600 hover:bg-pink-50 transition-colors"
            >
              <Layout className="w-5 h-5 mr-2" />
              浏览模板
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们</h2>
          <p className="text-lg text-gray-600">专业、高效、易用的直播手卡生成工具</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-2xl mb-4">
                <feature.icon className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Preview */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">精美模板</h2>
          <p className="text-lg text-gray-600">专业设计师打造的精美模板，适用于各种直播场景</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <LandscapePreview />
          <PortraitPreview />
        </div>
        <div className="text-center">
          <Link
            to="/templates"
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
          >
            <Layout className="w-5 h-5 mr-2" />
            查看更多模板
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 rounded-3xl text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            开始制作您的第一张手卡
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            免费使用，无需注册，立即开始制作专业的直播手卡
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center px-8 py-4 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
          >
            <Edit className="w-5 h-5 mr-2" />
            立即开始
          </Link>
        </div>
      </section>
    </div>
  );
}
