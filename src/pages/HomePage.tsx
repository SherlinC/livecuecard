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

  const templates = [
    {
      id: 1,
      name: '时尚女装',
      preview: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop'
    },
    {
      id: 2,
      name: '美妆护肤',
      preview: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=400&fit=crop'
    },
    {
      id: 3,
      name: '家居用品',
      preview: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=400&fit=crop'
    }
  ];

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
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {templates.map((template) => (
            <div key={template.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                </div>
              </div>
            </div>
          ))}
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