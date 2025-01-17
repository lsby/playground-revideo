import axios from 'axios'
import fs from 'fs'
import { z } from 'zod'

type CosyVoice配置 = {
  音色: '中文女' | '中文男'
  语速?: number
  提示音?: {
    语音wav地址: string
    文本: string
  }
}

export class CosyVoice {
  constructor(
    private 服务器地址: string,
    private 配置: CosyVoice配置,
  ) {}

  async 生成acc地址(文本: string): Promise<string[]> {
    let 使用提示音 = this.配置.提示音 === void 0 ? false : true
    let 提示音wav地址 = this.配置.提示音?.语音wav地址 ?? null
    let 提示音文本 = this.配置.提示音?.文本 ?? null

    let 请求结果 = await axios.post(
      `${this.服务器地址}/gradio_api/call/generate_audio`,
      {
        data: [
          文本,
          使用提示音 ? '3s极速复刻' : '预训练音色',
          this.配置.音色,
          使用提示音 ? 提示音文本 : '',
          null,
          使用提示音 ? { path: 提示音wav地址 } : null,
          '',
          0,
          false,
          this.配置.语速 ?? 1,
        ],
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    let 事件id = z.object({ event_id: z.string() }).parse(请求结果.data).event_id

    let 生成结果 = await axios.get(`${this.服务器地址}/gradio_api/call/generate_audio/${事件id}`)
    let 结果匹配 =
      z
        .string()
        .parse(生成结果.data)
        .match(/data:\s*(\[\{.*\}\])/)?.[1] ?? null
    if (结果匹配 === null) throw new Error('响应中未找到Data部分')

    let m3u8地址 =
      z
        .object({ url: z.string() })
        .array()
        .parse(JSON.parse(结果匹配))[0]
        // 似乎是gradio的bug
        ?.url.replace('/gradio_a/gradio_api/', '/gradio_api/') ?? null
    if (m3u8地址 === null) throw new Error('未找到流媒体URL')

    let m3u8文件 = await axios.get(m3u8地址)
    let m3u8内容 = z.string().parse(m3u8文件.data)
    let 片段Urls = Array.from(m3u8内容.matchAll(/#EXTINF:[0-9.]+,\s*([^\n]+)/g))
      .map((match) => match[1])
      .filter((a) => a !== void 0)
      .map((a) => m3u8地址.replace('playlist.m3u8', a))

    return 片段Urls
  }
  async 生成aac数据(文本: string): Promise<Buffer> {
    let 片段Urls = await this.生成acc地址(文本)

    let 音频缓冲区: Buffer[] = []
    for (let 片段Url of 片段Urls) {
      let 响应 = await axios.get(片段Url, { responseType: 'arraybuffer' })
      音频缓冲区.push(Buffer.from(响应.data))
    }

    let 输出音频 = Buffer.concat(音频缓冲区.map((buffer) => new Uint8Array(buffer.buffer)))

    return 输出音频
  }
  async 生成aac文件(文本: string, 文件路径: string): Promise<void> {
    await fs.promises.writeFile(文件路径, new Uint8Array(await this.生成aac数据(文本)))
  }
}
