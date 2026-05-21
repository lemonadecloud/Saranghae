import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text')

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  if (text.length > 300) {
    return NextResponse.json({ error: 'text too long' }, { status: 400 })
  }

  const url =
    `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ko&client=gtx&ttsspeed=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      },
    })

    if (!res.ok) {
      throw new Error(`upstream ${res.status}`)
    }

    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (err) {
    console.error('[TTS]', err)
    return NextResponse.json({ error: 'tts unavailable' }, { status: 502 })
  }
}
