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
    const { imageDataUrl } = await req.json();
    
    if (!imageDataUrl) {
      throw new Error('Image data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Extracting photo from CV page using AI vision...');

    // Use Lovable AI with vision to detect and extract the profile photo
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
                text: `Analyse cette page de CV et détecte s'il y a une photo de profil du candidat (pas un logo d'entreprise, pas un screenshot de page entière, mais bien la PHOTO PERSONNELLE du candidat - généralement un portrait en haut du CV).

CRITIQUE: Je ne veux PAS l'image entière de la page, je veux UNIQUEMENT la zone où se trouve la photo du candidat.

Si tu détectes une photo de profil personnelle du candidat:
- Réponds avec: {"hasPhoto": true, "description": "position et caractéristiques de la photo", "coordinates": {"x": position_x_en_pourcentage, "y": position_y_en_pourcentage, "width": largeur_en_pourcentage, "height": hauteur_en_pourcentage}}
- Les coordonnées doivent être en pourcentage (0-100) de la page totale
- Exemple: une photo ronde de 3cm en haut à gauche d'une page A4 = {"x": 5, "y": 5, "width": 10, "height": 10}

Si aucune photo de profil n'est détectée OU si c'est juste un screenshot de page:
- Réponds avec: {"hasPhoto": false, "description": "pas de photo personnelle détectée"}

Réponds UNIQUEMENT avec le JSON, sans markdown ni texte additionnel.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
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
      throw new Error('Failed to analyze CV with AI');
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    console.log('Photo detection result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in extract-photo:', error);
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
