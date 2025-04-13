import { makeScene2D, Rect } from '@revideo/2d'
import { createRef, makeProject } from '@revideo/core'
import { 清空 } from './components/clear'
import { 代码组件 } from './components/code'
import { 列表组件 } from './components/list'
import { 主标题组件 } from './components/title'
import { 小节标题组件 } from './components/title-section'
import { 动画 } from './scenes/animation'
import { 代码 } from './scenes/code'
import { 滤镜 } from './scenes/filters'
import { 公式 } from './scenes/formula'
import { 连线 } from './scenes/ligature'
import { 引用 } from './scenes/ref'
import { 信号 } from './scenes/signal'
import { 层次结构 } from './scenes/stage'
import { 快速开始 } from './scenes/start'
import { 过渡 } from './scenes/transitions'
import { TTS } from './scenes/tts'
// 这个tts是假的, 避免开发时不断生成, 浪费时间
import { tts } from './components/tts-fake'
// 调试完成后记得使用真正的tts
// import { tts } from './components/tts'

let 我的视频 = makeScene2D('我的视频', function* (view) {
  // 一些颜色定义, 请帮我选择合适的
  // ## 🎨 视频配色选择标准说明
  // 为了提升教学类视频的观感与专业性，我们在选择背景色、代码区域背景色与字幕颜色时，遵循以下三个核心标准：
  // ### 1. 对比度适中，观感舒适
  // - 背景与文字、代码之间应具备良好的对比度，确保内容清晰可读。
  // - 避免使用纯黑（#000000）或纯白（#ffffff），以减少视觉疲劳，适合长时间观看。
  // - 字幕颜色需与背景形成对比，兼顾易读性与柔和度。
  // ### 2. 层级分明，视觉结构清晰
  // - 背景色作为主视觉基底，应简洁、低饱和，避免喧宾夺主。
  // - 代码区域颜色需略深或略浅于背景，形成自然的视觉分区，引导观众聚焦内容。
  // - 字幕颜色使用高对比度的中性色（如深灰 #333333 或米白 #f8f8f2），增强识别度。
  // ### 3. 符合主题气质，统一风格感
  // - 配色应符合视频内容的风格，例如科技类偏冷色、儿童科普可选暖色或粉彩。
  // - 保持整体配色协调统一，避免使用过多颜色，以凸显内容的逻辑性与专业性。
  // - 使用现代感或极简主义配色（如 Nord、Material Design）更易传递高质感。
  let 背景色 = '#2e3440'
  let 代码区域背景色 = '#3b4252'
  let 字幕颜色 = '#eceff4'

  // 背景
  view.add(<Rect width={'100%'} height={'100%'} fill={背景色} />)

  // 这是几个区块, 注意覆盖关系
  let 展示区域 = createRef<Rect>()
  let 代码区域 = createRef<Rect>()
  let 字幕区域 = createRef<Rect>()
  view.add(<Rect ref={展示区域} />)
  view.add(<Rect ref={代码区域} />)
  view.add(<Rect ref={字幕区域} y={450} />)

  // 一开始应该展示主标题和副标题
  yield* 主标题组件(展示区域(), '这是主标题', '这是副标题', { 颜色: 字幕颜色 })

  // =================
  // tts的使用方法
  // =================
  // 调用tts即可生成音频和字幕
  // 音频播放完成后yield才会过去, 所以不用设置延时
  // 每一句最好不要太长, 不然字幕会换行
  yield* tts(字幕区域(), '进行一些说明', { 字幕颜色 })

  // 说完之后, 记得清空展示区域
  yield* 清空(展示区域())

  // 开始小结, 出现小结标题
  yield* 小节标题组件(展示区域(), '小结标题', { 颜色: 字幕颜色 })
  // 用tts讲要说的内容
  yield* tts(字幕区域(), '进行一些说明', { 字幕颜色 })

  // ...

  // 说完之后, 记得清空展示区域
  yield* 清空(展示区域())

  // =================
  // 代码的使用方法
  // =================
  // 这样显示代码
  yield* 代码组件(
    代码区域(),
    `
// 列表生成式的味道
const nums = [1, 2, 3, 4, 5]
const result = nums
  .filter(x => x % 2 === 0)   // 保留偶数
  .map(x => x * 2)            // 每个数乘2

console.log(result) // [4, 8]
      `,
    { 背景颜色: 代码区域背景色, 字体大小: 50 },
  )
  yield* tts(字幕区域(), '进行一些说明', { 字幕颜色 })
  // 解释完代码记得清除代码区域
  yield* 清空(代码区域())

  // =================
  // 列表的使用方法
  // =================
  // 要用列表的话, 先这样写一个列表
  let 列表 = yield* 列表组件(展示区域(), ['- 第一点.', '- 第二点.', '- 第三点.', '...'], {
    字体大小: 50,
    颜色: 字幕颜色,
  })
  // 然后这样调用来显示出下一点, 然后说明
  yield* 列表.下一个('左')
  yield* tts(字幕区域(), '进行一些说明', { 字幕颜色 })
  // 讲完了再显示下一点, 然后说明
  yield* 列表.下一个('左')
  yield* tts(字幕区域(), '进行一些说明', { 字幕颜色 })

  // 说完之后, 记得清空展示区域
  yield* 清空(展示区域())

  // ...

  // 开始下一小结, 出现小结标题
  yield* 小节标题组件(展示区域(), '小结标题', { 颜色: 字幕颜色 })

  // ...
})

export default makeProject({
  // 一些自己编写的简单的例子, 仅作为参考, 省略了很多内容.
  scenes: [快速开始, TTS, 层次结构, 引用, 动画, 信号, 过渡, 代码, 公式, 连线, 滤镜, 我的视频],
  settings: {
    shared: { size: { x: 1920, y: 1080 } },
    // https://github.com/redotvideo/revideo/issues/182
    rendering: {
      exporter: { name: '@revideo/core/ffmpeg', options: { format: 'mp4' } },
    },
  },
})
