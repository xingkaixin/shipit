# Shipit

把 Logo、产品名称、版本和发布信息变成一条 5 秒庆祝短片。预览和
MP4 导出完全在浏览器本地完成。

## 开发

```bash
corepack enable
pnpm install
pnpm dev
```

## 验证

```bash
pnpm check
pnpm build
```

## 浏览器与输出

- MP4 导出依赖浏览器的 H.264/WebCodecs 编码能力，页面会按所选规格实时检查。
- 4K 导出优先写入浏览器的本地临时文件，避免完整视频常驻内存；不支持该能力时会回退到内存导出。
- 4K 60 FPS 的像素处理量约为 1080p 30 FPS 的 8 倍，移动设备建议优先使用 1080p。
- Logo 支持 PNG、JPG 和 WebP，最大 10 MB、最长边 8192 像素且总像素低于 1600 万。
- 素材、预览和视频编码都在当前浏览器本地完成。
