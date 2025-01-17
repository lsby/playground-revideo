import { Audio, Rect, Txt } from '@revideo/2d'
import { Promisable, ThreadGenerator, createRef, waitFor } from '@revideo/core'
import { z } from 'zod'
import { CosyVoice } from '../model/cosy-voice'

let cosyVoice = new CosyVoice('http://127.0.0.1:8000')

let 存储名称 = 'memoizeCache'
let 存储数据 = localStorage.getItem(存储名称) ?? '{}'
let 存储数据验证 = z.record(z.string(), z.string()).safeParse(JSON.parse(存储数据))

let 缓存: Record<string, string> = {}
if (存储数据验证.error === void 0) 缓存 = 存储数据验证.data

export function* tts(
  view: Rect,
  文本: string,
): Generator<void | Promise<any> | ThreadGenerator | Promisable<any>, void> {
  let 语音地址: string | null = 缓存[文本] ?? null

  if (语音地址 !== null) {
    let 地址有效 = yield urlIsValid(语音地址)
    if (地址有效 === false) 语音地址 = null
  }

  if (语音地址 === null) {
    语音地址 =
      z
        .string()
        .array()
        .parse(yield cosyVoice.生成acc地址(文本))[0] ?? null
    if (语音地址 === null) throw new Error('生成语音失败')
    缓存[文本] = 语音地址
    localStorage.setItem(存储名称, JSON.stringify(缓存))
  }

  let 音频引用 = createRef<Audio>()
  yield view.add(<Audio src={语音地址} play={true} ref={音频引用} />)
  yield view.add(<Txt text={文本} textWrap={true}></Txt>)
  yield* waitFor(音频引用().getDuration())
  yield view.removeChildren()
}

async function urlIsValid(url: string): Promise<boolean> {
  try {
    let response = await fetch(url, { method: 'GET' })
    return response.ok
  } catch (_e) {
    return false
  }
}
