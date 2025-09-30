import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    const fileType = file.type;
    const fileName = file.name;

    console.log(`Parsing CV: ${fileName} (${fileType})`);

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);

    // Call Lovable AI for parsing
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Convert to base64 for text extraction (simplified for MVP)
    const text = new TextDecoder().decode(fileContent);
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en parsing de CV. Extrait les informations suivantes au format JSON:
{
  "name": "nom complet",
  "title": "titre professionnel",
  "summary": "résumé professionnel",
  "experience": "expériences professionnelles",
  "education": "formation",
  "skills": "compétences",
  "languages": "langues",
  "contact": { "email": "", "phone": "", "linkedin": "" }
}

Réponds UNIQUEMENT avec le JSON, sans markdown ni texte additionnel.`
          },
          {
            role: 'user',
            content: `Parse ce CV:\n\n${text.substring(0, 10000)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error('Failed to parse CV with AI');
    }

    const aiData = await aiResponse.json();
    const cvDataStr = aiData.choices[0].message.content;
    
    // Extract JSON from response (remove markdown if present)
    const jsonMatch = cvDataStr.match(/\{[\s\S]*\}/);
    const cvData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cvDataStr);

    console.log('CV parsed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        cvData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in parse-cv:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
