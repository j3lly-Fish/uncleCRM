import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error || !contact) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Build vCard string
    let vcard = 'BEGIN:VCARD\n'
    vcard += 'VERSION:3.0\n'
    vcard += `FN:${contact.name}\n`
    vcard += `N:${contact.name};;;;\n`
    
    if (contact.email) {
      vcard += `EMAIL;TYPE=INTERNET:${contact.email}\n`
    }
    
    if (contact.phone) {
      vcard += `TEL;TYPE=CELL:${contact.phone}\n`
    }
    
    if (contact.address) {
      // Basic address mapping (vCard format: PO Box;Ext;Street;Locality;Region;PostalCode;Country)
      vcard += `ADR;TYPE=HOME:;;${contact.address.replace(/\n/g, ', ')};;;;\n`
    }
    
    if (contact.birthday) {
      vcard += `BDAY:${contact.birthday.split('T')[0].replace(/-/g, '')}\n`
    }

    vcard += 'END:VCARD'

    const response = new NextResponse(vcard)
    response.headers.set('Content-Type', 'text/vcard; charset=utf-8')
    response.headers.set('Content-Disposition', `attachment; filename="${contact.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf"`)
    
    return response

  } catch (error) {
    console.error('vCard export error:', error)
    return new NextResponse('Export failed', { status: 500 })
  }
}
