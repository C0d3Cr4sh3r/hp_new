import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT /api/portfolios/[id] - Update portfolio
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id } = await context.params
    const portfolioId = parseInt(id)
    
    if (isNaN(portfolioId)) {
      return NextResponse.json(
        { error: 'Invalid portfolio ID', success: false },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    console.log('PUT /api/portfolios/[id] called with id:', portfolioId, 'and body:', body)
    
    // Update the portfolio
    const updatedPortfolio = await DatabaseService.updatePortfolio(portfolioId, {
      title: body.title,
      description: body.description,
      category: body.category,
      image_url: body.image_url,
      image_alt: body.image_alt,
      image_width: body.image_width,
      image_height: body.image_height,
      image_storage_path: body.image_storage_path,
      project_url: body.project_url,
      client_name: body.client_name,
      project_date: body.project_date,
      technologies: body.technologies,
      is_featured: body.is_featured,
      sort_order: body.sort_order,
      status: body.status
    })
    
    console.log('Portfolio updated successfully:', portfolioId)
    
    return NextResponse.json({ 
      portfolio: updatedPortfolio, 
      success: true,
      message: 'Portfolio updated successfully'
    })
  } catch (error) {
    console.error('Error in PUT /api/portfolios/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio', success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/portfolios/[id] - Delete portfolio
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id } = await context.params
    const portfolioId = parseInt(id)
    
    if (isNaN(portfolioId)) {
      return NextResponse.json(
        { error: 'Invalid portfolio ID', success: false },
        { status: 400 }
      )
    }
    
    console.log('DELETE /api/portfolios/[id] called with id:', portfolioId)
    
    await DatabaseService.deletePortfolio(portfolioId)
    
    console.log('Portfolio deleted successfully:', portfolioId)
    
    return NextResponse.json({ 
      success: true,
      message: 'Portfolio deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/portfolios/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio', success: false },
      { status: 500 }
    )
  }
}