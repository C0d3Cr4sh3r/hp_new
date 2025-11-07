import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

// GET /api/portfolios - Get all active portfolios
// Query params: category (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    
    console.log('GET /api/portfolios called with category:', category)
    
    const portfolios = category 
      ? await DatabaseService.getPortfoliosByCategory(category)
      : await DatabaseService.getPortfolios()
    
    console.log(`Found ${portfolios.length} portfolios for category: ${category || 'all'}`)
    
    return NextResponse.json({ 
      portfolios, 
      count: portfolios.length,
      category: category || 'all',
      success: true 
    })
  } catch (error) {
    console.error('Error in GET /api/portfolios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolios', success: false },
      { status: 500 }
    )
  }
}

// POST /api/portfolios - Create new portfolio
export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    console.log('POST /api/portfolios called with body:', body)
    
    // Validate required fields
    if (!body.title || !body.category) {
      return NextResponse.json(
        { error: 'Title and category are required', success: false },
        { status: 400 }
      )
    }
    
    // Create the portfolio
    const portfolio = await DatabaseService.createPortfolio({
      title: body.title,
      description: body.description || '',
      category: body.category,
      image_url: body.image_url || '',
      image_alt: body.image_alt || '',
      image_width: body.image_width || undefined,
      image_height: body.image_height || undefined,
      image_storage_path: body.image_storage_path || '',
      project_url: body.project_url || '',
      client_name: body.client_name || '',
      project_date: body.project_date || '',
      technologies: body.technologies || [],
      is_featured: body.is_featured || false,
      sort_order: body.sort_order || 0,
      status: body.status || 'active'
    })
    
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Failed to create portfolio', success: false },
        { status: 500 }
      )
    }
    
    console.log('Portfolio created successfully:', portfolio.id)
    
    return NextResponse.json({ 
      portfolio, 
      success: true,
      message: 'Portfolio created successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/portfolios:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio', success: false },
      { status: 500 }
    )
  }
}