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

    // Generate HTML content based on template
    const getTemplateStyles = (templateId: string) => {
      const styles = {
        moderne: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            padding: 40px;
            max-width: 210mm;
            margin: 0 auto;
            background: #ffffff;
          }
          h1 { 
            font-size: 36px; 
            color: #2563eb;
            margin-bottom: 5px;
            font-weight: 700;
          }
          h2 { 
            font-size: 18px;
            color: #64748b;
            font-weight: 400;
            margin-bottom: 25px;
          }
          h3 { 
            font-size: 16px;
            color: #2563eb;
            margin: 25px 0 15px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
            font-weight: 600;
          }
          .contact { 
            margin-bottom: 25px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.8;
          }
          .section { margin-bottom: 30px; }
          .content { white-space: pre-wrap; line-height: 1.8; }
        `,
        classique: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.7;
            color: #000000;
            padding: 40px;
            max-width: 210mm;
            margin: 0 auto;
            background: #ffffff;
          }
          .container { display: grid; grid-template-columns: 200px 1fr; gap: 30px; }
          .sidebar { border-right: 2px solid #000000; padding-right: 20px; }
          .main { padding-left: 20px; }
          h1 { 
            font-size: 32px; 
            color: #000000;
            margin-bottom: 8px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          h2 { 
            font-size: 16px;
            color: #333333;
            font-weight: 400;
            margin-bottom: 25px;
            font-style: italic;
          }
          h3 { 
            font-size: 14px;
            color: #000000;
            margin: 20px 0 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .contact { 
            margin-bottom: 20px;
            color: #333333;
            font-size: 13px;
            line-height: 1.9;
          }
          .section { margin-bottom: 25px; }
          .content { white-space: pre-wrap; line-height: 1.8; font-size: 14px; }
        `,
        creatif: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Poppins', 'Arial', sans-serif;
            line-height: 1.6;
            color: #0f172a;
            padding: 40px;
            max-width: 210mm;
            margin: 0 auto;
            background: #ffffff;
          }
          h1 { 
            font-size: 42px; 
            color: #059669;
            margin-bottom: 8px;
            font-weight: 800;
            letter-spacing: -1px;
          }
          h2 { 
            font-size: 20px;
            color: #64748b;
            font-weight: 300;
            margin-bottom: 30px;
          }
          h3 { 
            font-size: 18px;
            color: #059669;
            margin: 25px 0 15px;
            font-weight: 700;
            border-left: 4px solid #059669;
            padding-left: 15px;
          }
          .contact { 
            margin-bottom: 25px;
            color: #475569;
            font-size: 14px;
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
          }
          .section { margin-bottom: 30px; }
          .content { white-space: pre-wrap; line-height: 1.9; }
        `,
        tech: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Roboto Mono', 'Courier New', monospace;
            line-height: 1.6;
            color: #1e1b4b;
            padding: 40px;
            max-width: 210mm;
            margin: 0 auto;
            background: #ffffff;
          }
          h1 { 
            font-size: 38px; 
            color: #6366f1;
            margin-bottom: 8px;
            font-weight: 700;
            font-family: 'Arial', sans-serif;
          }
          h2 { 
            font-size: 16px;
            color: #64748b;
            font-weight: 400;
            margin-bottom: 25px;
            font-family: 'Arial', sans-serif;
          }
          h3 { 
            font-size: 16px;
            color: #6366f1;
            margin: 25px 0 15px;
            font-weight: 600;
            background: #eef2ff;
            padding: 10px 15px;
            border-radius: 4px;
            font-family: 'Arial', sans-serif;
          }
          .contact { 
            margin-bottom: 25px;
            color: #475569;
            font-size: 13px;
            font-family: 'Arial', sans-serif;
            border: 1px solid #e0e7ff;
            padding: 15px;
            border-radius: 4px;
          }
          .section { margin-bottom: 30px; }
          .content { white-space: pre-wrap; line-height: 1.8; font-size: 14px; }
        `
      };
      return styles[templateId as keyof typeof styles] || styles.moderne;
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${getTemplateStyles(template)}
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
