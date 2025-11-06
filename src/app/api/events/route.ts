import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, Event } from '../../../../lib/supabase'

// GET /api/events - Fetch all events
export async function GET() {
  try {
    const events = await DatabaseService.getEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.date || !body.type || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, type, status' },
        { status: 400 }
      )
    }

    const event = await DatabaseService.createEvent(body)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}