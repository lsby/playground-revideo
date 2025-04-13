import { Rect, Txt } from '@revideo/2d'
import { Promisable, ThreadGenerator, waitFor } from '@revideo/core'

export function* tts(
  view: Rect,
  文本: string,
  选项: { 字幕颜色: string; 指导?: string; 语速?: number; 种子?: number },
): Generator<void | Promise<any> | ThreadGenerator | Promisable<any>, void> {
  yield view.add(<Txt text={文本} textWrap={true} textAlign={'center'} fill={选项.字幕颜色}></Txt>)
  yield* waitFor(文本.length * 0.3)
  yield view.removeChildren()
}
