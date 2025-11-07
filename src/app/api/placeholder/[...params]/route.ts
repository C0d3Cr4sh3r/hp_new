import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = url.pathname.split('/').slice(-3) // ['placeholder', width, height]
    const searchParams = url.searchParams
    
    const width = parseInt(params[1]) || 800
    const height = parseInt(params[2]) || 600
    const text = searchParams.get('text') || 'Placeholder'

    // Generiere einen simplen Placeholder mit sharp
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="24" 
          fill="white" 
          text-anchor="middle" 
          dy="0.3em"
        >
          ${text.replace(/\+/g, ' ')}
        </text>
      </svg>
    `

    const buffer = await sharp(Buffer.from(svg))
      .webp({ quality: 80 })
      .toBuffer()

    const body = new Uint8Array(buffer)

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating placeholder:', error)
    
    // Fallback: Einfache Response mit 1x1 WebP
    const fallback = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 55, g: 65, b: 81 }
      }
    }).webp().toBuffer()

    const fallbackBody = new Uint8Array(fallback)

    return new NextResponse(fallbackBody, {
      headers: {
        'Content-Type': 'image/webp',
      },
    })
  }
}