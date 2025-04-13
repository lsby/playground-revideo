import { parser } from '@lezer/javascript'
import { Code, LezerHighlighter, Rect } from '@revideo/2d'
import { Promisable, ThreadGenerator } from '@revideo/core'

export function* 代码组件(
  view: Rect,
  代码: string,
  选项: { 背景颜色: string; 字体大小: number },
): Generator<void | Promise<any> | ThreadGenerator | Promisable<any>, void> {
  view.add(
    <>
      <Rect width={'100%'} height={'100%'} fill={选项.背景颜色} />
      <Code highlighter={new LezerHighlighter(parser.configure({ dialect: 'jsx ts' }))} fontSize={选项.字体大小} code={代码} />
    </>,
  )
}
