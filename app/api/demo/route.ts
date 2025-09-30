// app/api/demo/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Define a schema for server-side validation
const leadSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  company: z.string().min(1, { message: "Company name is required." }),
  projectsPerYear: z.string().min(1, { message: "Projects per year is required." }),
  interest: z.string().min(1, { message: "Primary interest is required." }),
  message: z.string().optional(),
});


export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Validate the incoming data
    const validation = leadSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation Error:", validation.error.flatten());
      return NextResponse.json({ error: "Invalid input.", details: validation.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, company, projectsPerYear, interest, message } = validation.data;

    // 2. Insert data into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        { name, email, phone, company, projects_per_year: projectsPerYear, interest, message },
      ])
      .select() // Use .select() to confirm the insert was successful

    // 3. Handle Supabase-specific errors
    if (error) {
      console.error('Supabase error:', error.message)
      return NextResponse.json({ error: 'Database error.', details: error.message }, { status: 500 })
    }

    // 4. Send success response
    return NextResponse.json({ message: 'Lead saved successfully!', data: data })

  } catch (e: any) {
    // 5. Handle any other unexpected server errors
    console.error('Unexpected API error:', e.message)
    return NextResponse.json({ error: 'An unexpected error occurred.', details: e.message }, { status: 500 })
  }
}
