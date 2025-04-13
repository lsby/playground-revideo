import { Rect, Txt } from '@revideo/2d'
import { createRef } from '@revideo/core'
import { 迭代器通用返回类型 } from '../types'

export function* 小节标题组件(
  展示区域: Rect,
  内容: string,
  选项: {
    颜色: string
    大小?: number
  },
): Generator<never, { 上移(): 迭代器通用返回类型 }, unknown> {
  let 引用 = createRef<Txt>()
  展示区域.add(<Txt ref={引用} text={内容} fontSize={选项.大小 ?? 80} fill={选项.颜色} />)

  return {
    上移(): 迭代器通用返回类型 {
      return 引用().position({ x: 引用().x(), y: -400 }, 1)
    },
  }
}
