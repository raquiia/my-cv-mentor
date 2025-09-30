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
      const baseStyles = `
        @page { 
          size: A4;
          margin: 0;
        }
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
        body { 
          line-height: 1.6;
          font-size: 11pt;
        }
        .cv-preview-content {
          padding: 2.5rem;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        section { margin-bottom: 1.5rem; }
        .entry { margin-bottom: 1.25rem; }
        .meta {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        p { margin-bottom: 0.5rem; }
      `;
      
      const styles = {
        moderne: baseStyles + `
          body { 
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #1a1a1a;
            background: #ffffff;
          }
          .moderne-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 1.5rem;
          }
          .moderne-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #2563eb;
          }
          h1 { 
            color: #2563eb; 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 0.5rem;
          }
          .title-text {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
          }
          h2 { 
            color: #2563eb; 
            font-size: 1.25rem; 
            font-weight: 600; 
            margin-top: 1.5rem; 
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #2563eb;
          }
          h3 { 
            font-size: 1.1rem; 
            font-weight: 600; 
            margin-bottom: 0.25rem;
          }
          .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .skill-tag {
            padding: 0.5rem 1rem;
            background: #f3f4f6;
            border-radius: 9999px;
            font-size: 0.875rem;
            display: inline-block;
          }
        `,
        classique: baseStyles + `
          body { 
            font-family: Georgia, 'Times New Roman', serif;
            color: #1a1a1a;
            background: #f8f9fa;
          }
          .cv-preview-content {
            background: transparent;
          }
          .classique-header { 
            text-align: center; 
            padding-bottom: 1.5rem;
            border-bottom: 3px double #e5e7eb;
            margin-bottom: 1.5rem;
          }
          .classique-photo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #333;
            margin: 0 auto 1rem;
            display: block;
          }
          h1 { 
            font-size: 2.25rem; 
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          .title-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #6b7280;
          }
          .classique-grid {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 2rem;
          }
          .classique-sidebar { 
            border-right: 1px solid #e5e7eb; 
            padding-right: 1.5rem;
          }
          .classique-sidebar .contact-list {
            font-size: 0.875rem;
            line-height: 1.6;
          }
          .classique-sidebar ul {
            list-style: none;
            padding: 0;
          }
          .classique-sidebar li {
            margin-bottom: 0.5rem;
            padding-left: 1rem;
            position: relative;
          }
          .classique-sidebar li::before {
            content: "•";
            position: absolute;
            left: 0;
          }
          h2 {
            font-size: 1.2rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
            margin-top: 1.75rem;
            margin-bottom: 0.75rem;
          }
          h3 { 
            font-size: 1.1rem; 
            font-weight: 600; 
            font-style: italic;
          }
        `,
        creatif: baseStyles + `
          body { 
            font-family: 'Poppins', 'Arial', sans-serif;
            color: white;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          .cv-preview-content {
            padding: 2.5rem;
            background: transparent;
          }
          .creatif-header {
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 1rem;
          }
          .creatif-photo {
            width: 100px;
            height: 100px;
            border-radius: 1rem;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          h1 { 
            color: white;
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .title-text {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.9);
          }
          .creatif-contact {
            background: white;
            padding: 1rem;
            border-radius: 0.75rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            font-size: 0.875rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 1rem;
          }
          .creatif-section {
            background: white;
            padding: 1.5rem;
            border-radius: 0.75rem;
            border-left: 4px solid #7c3aed;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 1rem;
          }
          h2 { 
            color: #7c3aed; 
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }
          h3 { 
            color: #2563eb; 
            font-size: 1.2rem; 
            font-weight: 700;
          }
          .skills-creative {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .skill-creative {
            padding: 0.5rem 1rem;
            background: rgba(37, 99, 235, 0.1);
            border: 2px solid #2563eb;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #2563eb;
            display: inline-block;
          }
        `,
        tech: baseStyles + `
          body { 
            font-family: 'Courier New', monospace;
            color: #c9d1d9;
            background: #0d1117;
          }
          .cv-preview-content {
            padding: 2.5rem;
            background: transparent;
          }
          .tech-header {
            background: #161b22;
            padding: 1.5rem;
            border: 1px solid #30363d;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 1rem;
          }
          .tech-photo {
            width: 80px;
            height: 80px;
            border-radius: 0.5rem;
            object-fit: cover;
            border: 2px solid #22c55e;
          }
          h1 { 
            color: #22c55e;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          h1::before { content: '> '; }
          .title-text {
            font-size: 1rem;
            color: #8b949e;
          }
          .tech-contact code {
            padding: 0.25rem 0.5rem;
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            color: #58a6ff;
            margin-right: 1rem;
          }
          .tech-section {
            background: #161b22;
            padding: 1.5rem;
            border: 1px solid #30363d;
            border-radius: 0.5rem;
            border-left: 3px solid #22c55e;
            margin-bottom: 1rem;
          }
          h2 { 
            color: #22c55e;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          h2::before { content: '## '; color: #4ade80; }
          h3 { 
            color: #c9d1d9;
            font-size: 1.1rem; 
            font-weight: 600;
          }
          h3::before { content: '### '; color: #86efac; font-size: 0.9rem; }
          .tech-entry {
            padding: 1rem;
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
          }
          .tech-entry .meta {
            color: #8b949e;
            font-style: italic;
          }
        `
      };
      return styles[templateId as keyof typeof styles] || styles.moderne;
    };

    // Helper to render experience/education arrays
    const renderArray = (arr: any[], type: 'experience' | 'education') => {
      if (!Array.isArray(arr)) return arr;
      
      return arr.map(item => {
        if (type === 'experience') {
          return `
            <div class="entry">
              <h3>${item.title || ''}</h3>
              <p class="meta">${item.company || ''} • ${item.years || ''}</p>
              <p>${item.description || ''}</p>
            </div>
          `;
        } else {
          return `
            <div class="entry">
              <h3>${item.degree || ''}</h3>
              <p class="meta">${item.university || ''} • ${item.years || ''}</p>
            </div>
          `;
        }
      }).join('');
    };

    const renderSkills = (skills: any) => {
      if (!Array.isArray(skills)) return skills;
      if (template === 'moderne') {
        return `<div class="skills-grid">${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>`;
      } else if (template === 'creatif') {
        return `<div class="skills-creative">${skills.map(s => `<span class="skill-creative">${s}</span>`).join('')}</div>`;
      } else if (template === 'classique') {
        return `<ul>${skills.map(s => `<li>${s}</li>`).join('')}</ul>`;
      } else {
        return skills.join(', ');
      }
    };

    // Generate template-specific HTML
    let bodyContent = '';
    
    if (template === 'moderne') {
      bodyContent = `
        <div class="moderne-layout">
          <div class="moderne-header">
            <div>
              <h1>${cvData.name || 'Votre Nom'}</h1>
              <p class="title-text">${cvData.title || 'Titre Professionnel'}</p>
              ${cvData.contact ? `
                <div class="contact-info">
                  ${cvData.contact.email ? `<span>${cvData.contact.email}</span>` : ''}
                  ${cvData.contact.phone ? `<span>${cvData.contact.phone}</span>` : ''}
                  ${cvData.contact.linkedin ? `<span>${cvData.contact.linkedin}</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          ${cvData.summary ? `<section><h2>Résumé</h2><p>${cvData.summary}</p></section>` : ''}
          ${cvData.experience ? `<section><h2>Expérience</h2>${renderArray(cvData.experience, 'experience')}</section>` : ''}
          ${cvData.education ? `<section><h2>Formation</h2>${renderArray(cvData.education, 'education')}</section>` : ''}
          ${cvData.skills ? `<section><h2>Compétences</h2>${renderSkills(cvData.skills)}</section>` : ''}
        </div>
      `;
    } else if (template === 'classique') {
      bodyContent = `
        <div class="classique-layout">
          <div class="classique-header">
            <h1>${cvData.name || 'Votre Nom'}</h1>
            <p class="title-text">${cvData.title || 'Titre Professionnel'}</p>
          </div>
          <div class="classique-grid">
            <aside class="classique-sidebar">
              ${cvData.contact ? `
                <section>
                  <h2>Contact</h2>
                  <div class="contact-list">
                    ${cvData.contact.email ? `<p>${cvData.contact.email}</p>` : ''}
                    ${cvData.contact.phone ? `<p>${cvData.contact.phone}</p>` : ''}
                    ${cvData.contact.linkedin ? `<p>${cvData.contact.linkedin}</p>` : ''}
                  </div>
                </section>
              ` : ''}
              ${cvData.skills ? `<section><h2>Compétences</h2>${renderSkills(cvData.skills)}</section>` : ''}
              ${cvData.languages ? `<section><h2>Langues</h2><p>${cvData.languages}</p></section>` : ''}
            </aside>
            <main>
              ${cvData.summary ? `<section><h2>Profil</h2><p>${cvData.summary}</p></section>` : ''}
              ${cvData.experience ? `<section><h2>Expérience Professionnelle</h2>${renderArray(cvData.experience, 'experience')}</section>` : ''}
              ${cvData.education ? `<section><h2>Formation</h2>${renderArray(cvData.education, 'education')}</section>` : ''}
            </main>
          </div>
        </div>
      `;
    } else if (template === 'creatif') {
      bodyContent = `
        <div class="creatif-layout">
          <div class="creatif-header">
            <div>
              <h1>${cvData.name || 'Votre Nom'}</h1>
              <p class="title-text">${cvData.title || 'Titre Professionnel'}</p>
            </div>
          </div>
          ${cvData.contact ? `
            <div class="creatif-contact">
              ${cvData.contact.email ? `<span>✉ ${cvData.contact.email}</span>` : ''}
              ${cvData.contact.phone ? `<span>📞 ${cvData.contact.phone}</span>` : ''}
              ${cvData.contact.linkedin ? `<span>💼 ${cvData.contact.linkedin}</span>` : ''}
            </div>
          ` : ''}
          ${cvData.summary ? `<section class="creatif-section"><h2>À Propos</h2><p>${cvData.summary}</p></section>` : ''}
          ${cvData.experience ? `<section class="creatif-section"><h2>Expérience</h2>${renderArray(cvData.experience, 'experience')}</section>` : ''}
          ${cvData.education ? `<section class="creatif-section"><h2>Formation</h2>${renderArray(cvData.education, 'education')}</section>` : ''}
          ${cvData.skills ? `<section class="creatif-section"><h2>Compétences</h2>${renderSkills(cvData.skills)}</section>` : ''}
        </div>
      `;
    } else if (template === 'tech') {
      bodyContent = `
        <div class="tech-layout">
          <div class="tech-header">
            <div>
              <h1>${cvData.name || 'Votre Nom'}</h1>
              <p class="title-text">${cvData.title || 'Titre Professionnel'}</p>
              ${cvData.contact ? `
                <div class="tech-contact">
                  ${cvData.contact.email ? `<code>${cvData.contact.email}</code>` : ''}
                  ${cvData.contact.phone ? `<code>${cvData.contact.phone}</code>` : ''}
                  ${cvData.contact.linkedin ? `<code>${cvData.contact.linkedin}</code>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          ${cvData.summary ? `<section class="tech-section"><h2>README.md</h2><p>${cvData.summary}</p></section>` : ''}
          ${cvData.experience ? `<section class="tech-section"><h2>work_experience/</h2>${renderArray(cvData.experience, 'experience')}</section>` : ''}
          ${cvData.education ? `<section class="tech-section"><h2>education/</h2>${renderArray(cvData.education, 'education')}</section>` : ''}
          ${cvData.skills ? `<section class="tech-section"><h2>skills: [</h2>${renderSkills(cvData.skills)}<p>]</p></section>` : ''}
        </div>
      `;
    } else {
      // Default to moderne
      bodyContent = `<h1>${cvData.name || 'Votre Nom'}</h1><p>${cvData.title || ''}</p>`;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${getTemplateStyles(template)}</style>
</head>
<body>
  ${bodyContent}
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
