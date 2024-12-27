import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qfmwkqxjbqjpzpjqbdcb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbXdrcXhqYnFqcHpwanFiZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NjQzMDYsImV4cCI6MjAxODU0MDMwNn0.Pu_jFpYwPXDlQtKOjLBVOYgwqO6Yw5_YLGJOLLGfLxA'

const supabase = createClient(supabaseUrl, supabaseKey)

export const GET = async ({ params }) => {
  try {
    const { id } = params
    console.log('Fetching results for student:', id)
    
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    console.log('Found results:', data)

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
