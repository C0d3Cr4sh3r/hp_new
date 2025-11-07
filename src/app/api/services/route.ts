import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function GET() {
  try {
    const services = await DatabaseService.getServices()
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error in services API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    const service = await DatabaseService.createService(body)
    
    if (!service) {
      return NextResponse.json({ error: 'Failed to create service' }, { status: 400 })
    }
    
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}