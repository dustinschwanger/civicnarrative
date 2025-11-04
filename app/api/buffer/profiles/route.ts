import { NextRequest, NextResponse } from 'next/server'
import { getBufferClient } from '@/lib/buffer'

export async function GET(request: NextRequest) {
  try {
    const bufferClient = getBufferClient()
    const profiles = await bufferClient.getProfiles()

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Error fetching Buffer profiles:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
