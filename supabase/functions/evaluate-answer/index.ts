import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EvaluationRequest {
  question: string;
  userAnswer: string;
  idealPoints: string[];
  category: string;
}

interface EvaluationResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { question, userAnswer, idealPoints, category }: EvaluationRequest = await req.json();

    if (!question || !userAnswer) {
      return new Response(
        JSON.stringify({ error: "Question and answer are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      console.log("No OpenAI API key found, using fallback evaluation");
      const fallbackEvaluation = generateFallbackEvaluation(userAnswer, idealPoints);
      
      return new Response(
        JSON.stringify(fallbackEvaluation),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `You are an expert interview coach. Evaluate the following interview answer.

Question: ${question}
Category: ${category}
Ideal answer should include these points: ${idealPoints.join(', ')}

Candidate's Answer: ${userAnswer}

Provide a detailed evaluation in the following JSON format:
{
  "score": <number from 1-10>,
  "feedback": "<detailed constructive feedback paragraph>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Be constructive, specific, and encouraging. Focus on both what was done well and what could be improved.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert interview coach who provides constructive, specific, and encouraging feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", await openaiResponse.text());
      const fallbackEvaluation = generateFallbackEvaluation(userAnswer, idealPoints);
      
      return new Response(
        JSON.stringify(fallbackEvaluation),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const aiResult = await openaiResponse.json();
    const evaluation = JSON.parse(aiResult.choices[0].message.content);

    return new Response(
      JSON.stringify(evaluation),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to evaluate answer",
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function generateFallbackEvaluation(userAnswer: string, idealPoints: string[]): EvaluationResponse {
  const wordCount = userAnswer.split(/\s+/).length;
  const hasStructure = userAnswer.includes('.'|| userAnswer.includes(','));
  const answerLower = userAnswer.toLowerCase();
  
  const pointsCovered = idealPoints.filter(point => {
    const keywords = point.toLowerCase().split(' ');
    return keywords.some(keyword => answerLower.includes(keyword));
  });
  
  let score = 5;
  if (wordCount > 50) score += 1;
  if (wordCount > 100) score += 1;
  if (hasStructure) score += 1;
  if (pointsCovered.length > 0) score += pointsCovered.length;
  score = Math.min(score, 10);
  
  const strengths = [];
  const improvements = [];
  
  if (wordCount > 50) {
    strengths.push("Provided a detailed response with good depth");
  } else {
    improvements.push("Consider providing more detail and specific examples");
  }
  
  if (pointsCovered.length > 0) {
    strengths.push(`Addressed key points: ${pointsCovered.join(', ')}`);
  } else {
    improvements.push("Try to address the key aspects of the question more directly");
  }
  
  if (hasStructure) {
    strengths.push("Answer is well-structured and easy to follow");
  } else {
    improvements.push("Break your answer into clear points for better clarity");
  }
  
  if (strengths.length === 0) {
    strengths.push("You provided a response to the question");
  }
  
  if (improvements.length === 0) {
    improvements.push("Continue practicing to refine your delivery");
  }
  
  const feedback = `Your answer scored ${score}/10. ${strengths.join('. ')}. To improve further: ${improvements.join('. ')}.`;
  
  return {
    score,
    feedback,
    strengths,
    improvements,
  };
}