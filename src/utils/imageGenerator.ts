import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

async function waitFontsReady() {
  try {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  } catch {}
}

async function ensureImagesLoaded(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
  await Promise.all(
    imgs.map(img => new Promise<void>(resolve => {
      if (img.complete) return resolve();
      img.crossOrigin = img.crossOrigin || 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }))
  );
}

export async function generateCardImage(element: HTMLElement, options: Partial<any> = {}) {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width || element.offsetWidth || element.scrollWidth || 400);
  const height = Math.ceil(rect.height || element.offsetHeight || element.scrollHeight || 600);
  const renderWidth = width + 2; // 额外预留边框像素，避免裁剪
  const renderHeight = height + 20;
  const scale = Math.min(3, window.devicePixelRatio || 1);

  const defaultOptions: any = {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: renderWidth,
    height: renderHeight,
    foreignObjectRendering: true,
    scrollX: 0,
    scrollY: 0,
    onclone: (doc) => {
      const root = doc.body.querySelector('*') as HTMLElement;
      if (root) root.style.transform = 'none';
      if (root) {
        (root.style as any)['-webkit-font-smoothing'] = 'antialiased';
        (root.style as any)['text-rendering'] = 'optimizeLegibility';
      }
      const imgs = Array.from(doc.querySelectorAll('img')) as HTMLImageElement[];
      imgs.forEach(i => (i.crossOrigin = 'anonymous'));
    },
    ...options
  };

  try {
    await waitFontsReady();
    await ensureImagesLoaded(element);
    // 始终使用克隆容器渲染，确保布局与字体度量一致
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0px';
  container.style.top = '0px';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  container.style.width = `${renderWidth}px`;
  container.style.height = 'auto';
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${renderWidth}px`;
  clone.style.height = `${renderHeight}px`;
  clone.style.backgroundColor = '#ffffff';
  // 去除导出图的阴影，仅保留内容
  clone.style.boxShadow = 'none';
    // 保留原节点的 padding 和 border 样式，防止导出时丢失
    const cs = getComputedStyle(element);
    clone.style.boxSizing = 'border-box';
    try {
      clone.style.padding = cs.padding || clone.style.padding;
      const borderTop = `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`;
      const borderRight = `${cs.borderRightWidth} ${cs.borderRightStyle} ${cs.borderRightColor}`;
      const borderBottom = `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`;
      const borderLeft = `${cs.borderLeftWidth} ${cs.borderLeftStyle} ${cs.borderLeftColor}`;
      clone.style.borderTop = borderTop;
      clone.style.borderRight = borderRight;
      clone.style.borderBottom = borderBottom;
      clone.style.borderLeft = borderLeft;
      clone.style.boxShadow = cs.boxShadow || clone.style.boxShadow;
      clone.style.borderRadius = cs.borderRadius || clone.style.borderRadius;
    } catch {}
    // 预处理图片跨域
    Array.from(clone.querySelectorAll('img')).forEach((img) => {
      const im = img as HTMLImageElement;
      im.crossOrigin = im.crossOrigin || 'anonymous';
    });
  container.appendChild(clone);
  document.body.appendChild(container);
  await new Promise(r => setTimeout(r, 50));
  await ensureImagesLoaded(clone);

  // 补齐底部边框：在容器上绘制相同样式的底边，避免裁剪丢失
  try {
    const cs = getComputedStyle(element);
    const bw = parseFloat(cs.borderBottomWidth || '0');
    if (bw > 0) {
      container.style.borderBottom = `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`;
      container.style.borderRadius = cs.borderRadius || container.style.borderRadius;
      container.style.boxShadow = 'none';
    }
  } catch {}

  let canvas = await html2canvas(clone, defaultOptions);
  let dataURL = canvas.toDataURL('image/png', 0.95);

    // 如遇到空白，改用非 foreignObject 兜底
    if (dataURL.length < 1000 || isCanvasBlank(canvas)) {
      const retryOptions = { ...defaultOptions, foreignObjectRendering: false };
      canvas = await html2canvas(clone, retryOptions);
      dataURL = canvas.toDataURL('image/png', 0.95);
    }

    // 若仍为空白或几乎空白，使用 html-to-image 兜底
    if (!dataURL || dataURL.length < 1000 || isCanvasBlank(canvas)) {
      try {
    const png = await toPng(clone, {
      backgroundColor: '#ffffff',
      cacheBust: true,
      pixelRatio: Math.min(2, window.devicePixelRatio || 1),
      canvasWidth: renderWidth,
      canvasHeight: renderHeight,
    });
        dataURL = png;
      } catch {}
    }

    document.body.removeChild(container);
    return { success: true, dataURL, canvas };
  } catch (error) {
    console.error('生成图片失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '生成图片失败' };
  }
}

function isCanvasBlank(canvas: HTMLCanvasElement) {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const { width, height } = canvas;
    const data = ctx.getImageData(Math.floor(width/2), Math.floor(height/2), 1, 1).data;
    // 检测中心像素是否接近白色
    const [r,g,b,a] = data;
    return a === 255 && r > 250 && g > 250 && b > 250;
  } catch {
    return false;
  }
}

export function downloadPdfFromDataURL(dataURL: string, filename = '直播手卡.pdf') {
  try {
    const img = new Image();
    img.onload = () => {
      const pdf = new jsPDF({ unit: 'px', format: [img.width, img.height] });
      pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
      pdf.save(filename);
    };
    img.src = dataURL;
    return { success: true };
  } catch (error) {
    console.error('下载PDF失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '下载PDF失败'
    };
  }
}

export function downloadImage(dataURL: string, filename = '直播手卡.png') {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
    return { success: true };
  } catch (error) {
    console.error('下载图片失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '下载图片失败'
    };
  }
}

export function dataURLToBlob(dataURL: string): Blob | null {
  try {
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1];
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    
    return new Blob([array], { type: mime });
  } catch (error) {
    console.error('转换Blob失败:', error);
    return null;
  }
}
