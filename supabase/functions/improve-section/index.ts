import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, content, userId } = await req.json();

    if (!section || !content || !userId) {
      throw new Error('Missing required fields');
    }

    console.log(`Improving section: ${section} for user: ${userId}`);

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check credits (10 required)
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet || wallet.balance < 10) {
      throw new Error('Insufficient credits (10 required)');
    }

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompts: Record<string, string> = {
      summary: 'Améliore ce résumé professionnel: clarté, impact, mots-clés ATS. Reste factuel. Max 4-5 lignes.',
      experience: 'Réécris ces expériences avec: verbes d\'action, résultats quantifiés (%, €, nombre), accomplissements concrets. Reste véridique.',
      education: 'Améliore la section formation: diplômes clairs, établissements reconnus, mentions. Formel et précis.',
      skills: 'Optimise cette liste de compétences pour ATS: catégorisation claire (Techniques/Langages/Outils/Soft skills), mots-clés secteur.'
    };

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
            content: systemPrompts[section] || 'Améliore ce contenu de CV de manière professionnelle et factuelle.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI API failed');
    }

    const aiData = await aiResponse.json();
    const improved = aiData.choices[0].message.content;

    // Deduct credits
    const { error: deductError } = await supabaseClient.rpc('deduct_credits', {
      _user_id: userId,
      _amount: 10,
      _feature: `cv_improve_${section}`
    });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      throw new Error('Failed to deduct credits');
    }

    console.log('Section improved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        improved,
        creditsUsed: 10
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in improve-section:', error);
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
