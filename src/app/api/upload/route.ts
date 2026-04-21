import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const contactId = formData.get('contactId') as string

    if (!file || !contactId) {
      return NextResponse.json({ error: 'File and contactId are required' }, { status: 400 })
    }

    // Verify user owns the contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single()

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 })
    }

    // Read file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine upload directory
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true })

    // Generate unique filename to prevent collisions and path traversal
    const extension = path.extname(file.name)
    const uniqueFilename = `${uuidv4()}${extension}`
    const filePath = path.join(uploadDir, uniqueFilename)

    // Write file to local disk
    await fs.writeFile(filePath, buffer)

    // Save record to database
    const { error: dbError } = await supabase.from('contact_files').insert({
      user_id: user.id,
      contact_id: contactId,
      file_name: file.name,
      file_path: filePath // Store absolute path or relative, depends on UPLOAD_DIR
    })

    if (dbError) {
      // Cleanup if DB insert fails
      await fs.unlink(filePath).catch(console.error)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
