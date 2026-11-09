# Miniature Atlas · 3D 模型图集

本目录位于仓库的 `public/model-gallery/`。运行 Vite 开发服务器后访问 `/model-gallery/`；部署到 GitHub Pages 后访问 `/jujubit-brand-assets/model-gallery/`。

图集包含 108 组不同的参考图片和逐一配对的 GLB 模型。左侧为 2D 图片列表，默认选中第一件；右侧同步展示所选作品的 2D 图片和可旋转、缩放的 3D 模型。支持 TTRPG、POP、ANIME 分类、搜索、上一件和下一件切换，以及重置模型视角。3D 预览右上角可下载当前 GLB。

图片、模型和 3D 查看器均保存在本目录，资源由站点自身提供；浏览器可能阻止直接以 `file://` 地址加载 GLB。

原“灵感作品”已按角色风格并入 TTRPG、POP、ANIME，全部 108 组图片与模型仍保留。

提供的 `grid/config.json` 和 `grid/grid.pck` 是 Godot 场景包。当前网页使用的 `model-viewer` 不能直接加载 PCK 或 Godot shader，因此场景尚未替换。若要在此 HTML 中使用原场景，需提供从 Godot 导出的网页可用场景资源（如 GLB 场景与 HDR/图片环境贴图），或提供原 Godot 项目供转换。
