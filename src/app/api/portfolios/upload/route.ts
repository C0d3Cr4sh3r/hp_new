import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import sharp from 'sharp'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    console.log('POST /api/portfolios/upload called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', success: false },
        { status: 400 }
      )
    }
    
    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed.', success: false },
        { status: 400 }
      )
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.', success: false },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Process image with Sharp
    const processedImage = await sharp(buffer)
      .resize(1200, 800, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer()
    
    // Get image metadata
    const metadata = await sharp(processedImage).metadata()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `portfolio_${timestamp}_${randomString}.webp`
    const storagePath = `portfolios/${filename}`
    
    console.log('Uploading to storage:', storagePath)

    const supabase = getSupabaseAdminClient()

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(storagePath, processedImage, {
        contentType: 'image/webp',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)

      // Bucket nicht gefunden?
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        return NextResponse.json(
          { error: 'Storage-Bucket "portfolio-images" nicht gefunden. Bitte in Supabase erstellen.', success: false },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to upload image', success: false },
        { status: 500 }
      )
    }

    console.log('Upload successful:', uploadData.path)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(storagePath)
    
    const publicUrl = urlData.publicUrl
    
    console.log('Public URL generated:', publicUrl)
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      image_url: publicUrl,
      image_storage_path: storagePath,
      image_width: metadata.width,
      image_height: metadata.height,
      filename: filename
    })
    
  } catch (error) {
    console.error('Error in POST /api/portfolios/upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', success: false },
      { status: 500 }
    )
  }
}