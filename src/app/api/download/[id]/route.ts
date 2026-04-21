import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const fileId = resolvedParams.id
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get file metadata and verify ownership
    const { data: fileRecord, error } = await supabase
      .from('contact_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single()

    if (error || !fileRecord) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 })
    }

    const filePath = fileRecord.file_path

    try {
      // Read file from disk
      const fileBuffer = await fs.readFile(filePath)

      // Create response with file content
      const response = new NextResponse(fileBuffer)
      
      // Set headers to force download with original filename
      response.headers.set('Content-Disposition', `attachment; filename="${fileRecord.file_name}"`)
      response.headers.set('Content-Type', 'application/octet-stream')
      
      return response
    } catch (e) {
      console.error('Error reading file from disk:', e)
      return NextResponse.json({ error: 'File missing from disk' }, { status: 404 })
    }

  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
