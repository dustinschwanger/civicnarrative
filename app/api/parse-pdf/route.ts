import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to Uint8Array (required by unpdf)
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Extract text from PDF using unpdf
    const { text, totalPages } = await extractText(uint8Array)

    return NextResponse.json({
      text,
      pages: totalPages,
    })
  } catch (error) {
    console.error('Error parsing PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}
