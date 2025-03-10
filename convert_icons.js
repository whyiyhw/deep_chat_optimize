const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 确保已安装sharp库
try {
  require.resolve('sharp');
} catch (e) {
  console.log('正在安装sharp库，用于图像处理...');
  exec('pnpm install sharp', (error) => {
    if (error) {
      console.error('安装sharp失败，请手动安装: pnpm install sharp');
      process.exit(1);
    } else {
      console.log('sharp安装成功，继续处理图标...');
      convertIcons();
    }
  });
  return;
}

// 转换图标的主函数
async function convertIcons() {
  const sharp = require('sharp');
  const sizes = [16, 48, 128];
  const svgPath = path.join(__dirname, 'public', 'images', 'icon.svg');
  
  try {
    // 检查SVG文件是否存在
    if (!fs.existsSync(svgPath)) {
      console.error(`SVG文件不存在: ${svgPath}`);
      return;
    }
    
    // 读取SVG文件
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 为每个尺寸创建PNG
    for (const size of sizes) {
      const outputPath = path.join(__dirname, 'public', 'images', `icon${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`已创建 ${size}x${size} 图标: ${outputPath}`);
    }
    
    console.log('所有图标已成功转换！');
  } catch (error) {
    console.error('转换图标时出错:', error);
  }
}

// 如果sharp已安装，直接执行转换
convertIcons(); 