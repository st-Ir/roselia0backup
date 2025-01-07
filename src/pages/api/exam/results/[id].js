import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
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
