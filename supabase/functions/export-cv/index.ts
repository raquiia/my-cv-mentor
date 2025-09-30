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
    const { cvData, template, format, userId } = await req.json();

    if (!cvData || !format) {
      throw new Error('Missing required fields');
    }

    console.log(`Exporting CV for user ${userId} in ${format} format with template ${template}`);

    // Generate HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    h1 { 
      font-size: 32px; 
      color: #2563eb;
      margin-bottom: 5px;
    }
    h2 { 
      font-size: 18px;
      color: #64748b;
      font-weight: normal;
      margin-bottom: 20px;
    }
    h3 { 
      font-size: 16px;
      color: #2563eb;
      margin: 20px 0 10px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
    }
    p { margin-bottom: 10px; }
    .contact { 
      margin-bottom: 20px;
      color: #64748b;
      font-size: 14px;
    }
    .section { margin-bottom: 25px; }
    .content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${cvData.name || 'Votre Nom'}</h1>
  <h2>${cvData.title || 'Titre Professionnel'}</h2>
  
  ${cvData.contact ? `
    <div class="contact">
      ${cvData.contact.email ? `📧 ${cvData.contact.email}` : ''}
      ${cvData.contact.phone ? ` | 📱 ${cvData.contact.phone}` : ''}
      ${cvData.contact.linkedin ? ` | 🔗 ${cvData.contact.linkedin}` : ''}
    </div>
  ` : ''}

  ${cvData.summary ? `
    <div class="section">
      <h3>Résumé Professionnel</h3>
      <div class="content">${cvData.summary}</div>
    </div>
  ` : ''}

  ${cvData.experience ? `
    <div class="section">
      <h3>Expérience Professionnelle</h3>
      <div class="content">${cvData.experience}</div>
    </div>
  ` : ''}

  ${cvData.education ? `
    <div class="section">
      <h3>Formation</h3>
      <div class="content">${cvData.education}</div>
    </div>
  ` : ''}

  ${cvData.skills ? `
    <div class="section">
      <h3>Compétences</h3>
      <div class="content">${cvData.skills}</div>
    </div>
  ` : ''}

  ${cvData.languages ? `
    <div class="section">
      <h3>Langues</h3>
      <div class="content">${cvData.languages}</div>
    </div>
  ` : ''}
</body>
</html>
    `;

    if (format === 'pdf') {
      // For MVP, return HTML content that can be printed as PDF by browser
      // In production, use puppeteer or similar
      return new Response(
        htmlContent,
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html',
            'Content-Disposition': 'attachment; filename="cv.html"'
          },
          status: 200 
        }
      );
    } else {
      // DOCX generation would require a library like docx
      // For MVP, return error or HTML
      throw new Error('DOCX export not yet implemented');
    }

  } catch (error) {
    console.error('Error in export-cv:', error);
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
