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

    // Convert to base64 for document parsing with Gemini
    const base64Content = btoa(String.fromCharCode(...fileContent));
    
    console.log(`File size: ${fileContent.length} bytes, Type: ${fileType}`);
    
    // Prepare content for Gemini - it can read PDF/DOCX directly
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Tu es un expert en extraction d'informations de CV. Analyse ce document CV et extrait TOUTES les informations en format JSON structuré.

IMPORTANT: 
- Extrait les VRAIES informations du document, pas des exemples génériques
- Pour experience et education, crée des tableaux d'objets
- Pour skills, crée un tableau de strings
- Si une information n'est pas trouvée, mets une chaîne vide

Format JSON attendu:
{
  "name": "nom complet exact du candidat",
  "title": "titre professionnel actuel",
  "summary": "résumé professionnel ou objectif de carrière",
  "experience": [
    {
      "title": "titre du poste",
      "company": "nom de l'entreprise",
      "years": "période (ex: 2020-2023)",
      "description": "description des responsabilités"
    }
  ],
  "education": [
    {
      "degree": "diplôme obtenu",
      "university": "nom de l'établissement",
      "years": "période (ex: 2015-2019)"
    }
  ],
  "skills": ["compétence1", "compétence2", "compétence3"],
  "languages": "langues parlées avec niveaux",
  "contact": {
    "email": "email@example.com",
    "phone": "+33 6 12 34 56 78",
    "linkedin": "url linkedin"
  }
}

Réponds UNIQUEMENT avec le JSON valide, sans markdown, sans texte additionnel.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType};base64,${base64Content}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
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
