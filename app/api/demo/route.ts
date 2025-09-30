// app/api/demo/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { name, email, phone, company, projectsPerYear, interest, message } = await request.json()

  const { data, error } = await supabase
    .from('leads')
    .insert([
      { name, email, phone, company, projects_per_year: projectsPerYear, interest, message },
    ])

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'There was an error saving the lead.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Lead saved successfully!' })
}