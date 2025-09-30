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

    console.log(`File size: ${fileContent.length} bytes, Type: ${fileType}`);

    // Simple text extraction for PDF (basic, works for text-based PDFs)
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      // Basic PDF text extraction - convert to string and extract readable text
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(fileContent);
      
      // Extract text between common PDF text markers and clean it
      const textMatches = rawText.match(/\(([^)]+)\)/g) || [];
      extractedText = textMatches
        .map(match => match.replace(/[()]/g, ''))
        .filter(text => text.length > 1)
        .join(' ');
      
      // Also try to extract text between BT/ET markers (PDF text objects)
      const btMatches = rawText.match(/BT\s+(.*?)\s+ET/gs) || [];
      const btText = btMatches
        .map(match => match.replace(/BT|ET|Tf|Td|Tj|TJ|'|"/g, ' '))
        .join(' ');
      
      extractedText = (extractedText + ' ' + btText)
        .replace(/[^\w\s@.,+\-()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // For DOCX and other formats, try basic text extraction
      const decoder = new TextDecoder('utf-8', { fatal: false });
      extractedText = decoder.decode(fileContent)
        .replace(/[^\w\s@.,+\-()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    console.log(`Extracted text length: ${extractedText.length} characters`);
    console.log(`First 500 chars: ${extractedText.substring(0, 500)}`);

    if (!extractedText || extractedText.length < 50) {
      throw new Error('Could not extract readable text from document. Please ensure the PDF is text-based (not scanned).');
    }

    // Call Lovable AI for parsing
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
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
            content: `Tu es un expert en extraction d'informations de CV. Analyse ce texte extrait d'un CV et extrait TOUTES les informations en format JSON structuré.

IMPORTANT: 
- Extrait les VRAIES informations du texte, pas des exemples génériques
- Pour experience et education, crée des tableaux d'objets avec toutes les entrées trouvées
- Pour skills, crée un tableau de strings avec toutes les compétences trouvées
- Si une information n'est pas trouvée, mets une chaîne vide ou un tableau vide

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

Texte du CV:
${extractedText}

Réponds UNIQUEMENT avec le JSON valide, sans markdown ni texte additionnel.`
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
