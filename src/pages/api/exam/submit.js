import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qfmwkqxjbqjpzpjqbdcb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbXdrcXhqYnFqcHpwanFiZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5NjQzMDYsImV4cCI6MjAxODU0MDMwNn0.Pu_jFpYwPXDlQtKOjLBVOYgwqO6Yw5_YLGJOLLGfLxA'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body
    console.log('Received exam submission:', body)

    // Validate required fields
    if (!body.student_id) {
      return res.status(400).json({ error: 'student_id is required' })
    }

    if (typeof body.score !== 'number') {
      return res.status(400).json({ error: 'score must be a number' })
    }

    if (typeof body.passed !== 'boolean') {
      return res.status(400).json({ error: 'passed must be a boolean' })
    }

    // Format data for Supabase
    const examData = {
      student_id: body.student_id,
      score: body.score,
      passed: body.passed,
      answers: body.answers || {},
      created_at: new Date().toISOString()
    }

    console.log('Saving exam data:', examData)

    const { data, error } = await supabase
      .from('exam_results')
      .insert(examData)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ 
        error: 'Database error',
        details: error.message
      })
    }

    console.log('Exam saved successfully:', data)

    return res.status(200).json({ 
      success: true,
      message: 'Exam result saved successfully',
      data
    })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}