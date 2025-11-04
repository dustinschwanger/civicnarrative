import { NextRequest, NextResponse } from 'next/server'
import { getLateClient } from '@/lib/late'

export async function GET(request: NextRequest) {
  try {
    const lateClient = getLateClient()
    const accounts = await lateClient.getAccounts()

    // Return as "profiles" for backward compatibility with UI
    return NextResponse.json({ profiles: accounts })
  } catch (error) {
    console.error('Error fetching LATE accounts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}
