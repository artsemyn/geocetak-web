import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Types for request/response
interface EvaluationRequest {
  problemText: string
  studentAnswer: string
  lessonId: string | number
  rubricId?: string | number
  geometryType: 'cylinder' | 'cone' | 'sphere'
}

interface AIFeedback {
  overallScore: number
  criteriaScores: {
    mathematical_accuracy: number
    conceptual_understanding: number
    problem_solving_approach: number
    communication: number
    [key: string]: number
  }
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  nextSteps: string[]
}

interface ChainOfThoughtStep {
  step: number
  reasoning: string
  finding: string
  confidence: number
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestData: EvaluationRequest = await req.json()
    const { problemText, studentAnswer, lessonId, rubricId, geometryType } = requestData

    // Normalize IDs to numbers for database operations
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId
    const numericRubricId = rubricId ? (typeof rubricId === 'string' ? parseInt(rubricId) : rubricId) : null

    // Validate input
    if (!problemText || !studentAnswer || !lessonId || !geometryType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (isNaN(numericLessonId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid lesson ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create assessment record with pending status
    const { data: assessment, error: createError } = await supabase
      .from('ai_assessments')
      .insert({
        user_id: user.id,
        lesson_id: numericLessonId,
        rubric_id: numericRubricId,
        problem_text: problemText,
        student_answer: studentAnswer,
        status: 'processing'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating assessment:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create assessment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()

    try {
      // Get rubric for structured evaluation
      let rubricCriteria = {}
      if (numericRubricId) {
        const { data: rubric } = await supabase
          .from('assessment_rubrics')
          .select('criteria')
          .eq('id', numericRubricId)
          .single()
        
        if (rubric) {
          rubricCriteria = rubric.criteria
        }
      }

      // Build comprehensive prompt with Chain-of-Thought reasoning
      const prompt = buildEvaluationPrompt(problemText, studentAnswer, geometryType, rubricCriteria)
      
      // Call Gemini API
      const result = await model.generateContent(prompt)
      const response = await result.response
      const aiResponse = response.text()

      // Parse AI response
      const { feedback, reasoning } = parseAIResponse(aiResponse)
      
      const processingTime = Date.now() - startTime

      // Update assessment with results
      const { data: updatedAssessment, error: updateError } = await supabase
        .from('ai_assessments')
        .update({
          ai_score: feedback.overallScore,
          ai_feedback: feedback,
          reasoning_steps: reasoning,
          processing_time_ms: processingTime,
          status: 'completed'
        })
        .eq('id', assessment.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating assessment:', updateError)
      }

      // Return results
      return new Response(
        JSON.stringify({
          assessmentId: assessment.id,
          feedback,
          reasoning,
          processingTimeMs: processingTime
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (aiError) {
      console.error('AI evaluation error:', aiError)
      
      // Update assessment status to failed
      await supabase
        .from('ai_assessments')
        .update({ status: 'failed' })
        .eq('id', assessment.id)

      return new Response(
        JSON.stringify({ error: 'AI evaluation failed', details: aiError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function buildEvaluationPrompt(
  problemText: string, 
  studentAnswer: string, 
  geometryType: string,
  rubricCriteria: any
): string {
  const geometryContext = getGeometryContext(geometryType)
  
  return `You are an expert mathematics tutor specializing in 3D geometry education for Indonesian middle school students (SMP kelas 9). You have deep knowledge of geometric concepts and excellent pedagogical skills.

TASK: Evaluate a student's essay response to a geometry problem using Chain-of-Thought reasoning.

GEOMETRY CONTEXT:
${geometryContext}

PROBLEM STATEMENT:
${problemText}

STUDENT ANSWER:
${studentAnswer}

EVALUATION RUBRIC:
${JSON.stringify(rubricCriteria, null, 2)}

INSTRUCTIONS:
1. Use Chain-of-Thought reasoning - think step by step before scoring
2. Be encouraging and constructive in feedback
3. Identify both strengths and areas for improvement
4. Provide specific suggestions for next learning steps
5. Score each criterion on a 1-4 scale (4=excellent, 3=good, 2=satisfactory, 1=needs improvement)

REQUIRED OUTPUT FORMAT (valid JSON):
{
  "chainOfThought": [
    {
      "step": 1,
      "reasoning": "First, I need to check if the student correctly identified...",
      "finding": "Student correctly applied the cylinder formula L=2πr(r+t)",
      "confidence": 0.9
    }
  ],
  "feedback": {
    "overallScore": 85,
    "criteriaScores": {
      "mathematical_accuracy": 4,
      "conceptual_understanding": 3,
      "problem_solving_approach": 4,
      "communication": 3
    },
    "strengths": [
      "Excellent use of cylinder surface area formula",
      "Clear step-by-step calculation process"
    ],
    "improvements": [
      "Could better explain the real-world context",
      "Mathematical notation could be clearer"
    ],
    "detailedFeedback": "Your solution demonstrates strong mathematical skills...",
    "nextSteps": [
      "Practice explaining geometric concepts in your own words",
      "Try solving similar problems with different measurements"
    ]
  }
}

Think carefully and provide detailed, constructive feedback that will help this student improve their mathematical understanding.`
}

function getGeometryContext(geometryType: string): string {
  const contexts = {
    cylinder: `
CYLINDER (TABUNG) KEY CONCEPTS:
- Surface Area Formula: L = 2πr(r + t) where r=radius, t=height
- Volume Formula: V = πr²t
- Components: 2 circular bases + rectangular lateral surface
- Real-world examples: cans, pipes, water tanks
- Net (jaring-jaring): 2 circles + 1 rectangle`,
    
    cone: `
CONE (KERUCUT) KEY CONCEPTS:
- Surface Area Formula: L = πr(r + s) where r=radius, s=slant height
- Volume Formula: V = ⅓πr²t
- Pythagorean relationship: s² = r² + t²
- Volume relationship: Cone = ⅓ × Cylinder (same base, height)
- Real-world examples: ice cream cones, traffic cones, funnels
- Net (jaring-jaring): 1 circle + 1 sector`,
    
    sphere: `
SPHERE (BOLA) KEY CONCEPTS:
- Surface Area Formula: L = 4πr²
- Volume Formula: V = ⁴⁄₃πr³
- Perfect symmetry - all points equidistant from center
- Archimedes' discovery: Sphere volume = ⅔ of surrounding cylinder
- Real-world examples: balls, planets, bubbles
- No true net - can be approximated with segments`
  }
  
  return contexts[geometryType as keyof typeof contexts] || contexts.cylinder
}

function parseAIResponse(response: string): { feedback: AIFeedback, reasoning: ChainOfThoughtStep[] } {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      feedback: parsed.feedback,
      reasoning: parsed.chainOfThought || []
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Fallback response
    return {
      feedback: {
        overallScore: 50,
        criteriaScores: {
          mathematical_accuracy: 2,
          conceptual_understanding: 2,
          problem_solving_approach: 2,
          communication: 2
        },
        strengths: ["Attempted to solve the problem"],
        improvements: ["AI evaluation failed - teacher review needed"],
        detailedFeedback: "This response requires manual teacher evaluation due to processing error.",
        nextSteps: ["Please consult with your teacher for detailed feedback"]
      },
      reasoning: [{
        step: 1,
        reasoning: "AI processing failed",
        finding: "Manual evaluation required",
        confidence: 0.0
      }]
    };
  }
}