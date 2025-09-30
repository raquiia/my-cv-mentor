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
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body { 
          line-height: 1.6;
          font-size: 11pt;
        }
        .cv-preview-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        section { margin-bottom: 1.25rem; }
        .entry { margin-bottom: 1rem; }
        .meta {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }
        p { margin-bottom: 0.5rem; line-height: 1.7; }
      `;
      
      const styles = {
        moderne: baseStyles + `
          body { 
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #1a1a1a;
            background: linear-gradient(180deg, #5DADE2 0%, #3498DB 50%, #2E86C1 100%);
          }
          .moderne-layout {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .moderne-header {
            background: white;
            padding: 2rem 2.5rem;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .moderne-photo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #3498DB;
          }
          .moderne-header h1 { 
            color: #2C3E50; 
            font-size: 2rem; 
            font-weight: 800; 
            margin: 0 0 0.25rem 0;
          }
          .title-text {
            font-size: 1.125rem;
            color: #5DADE2;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.875rem;
            color: #7F8C8D;
          }
          section {
            padding: 1.5rem 2.5rem;
          }
          section:nth-child(even) {
            background: rgba(255, 255, 255, 0.95);
            color: #2C3E50;
          }
          section:nth-child(odd) {
            background: rgba(52, 152, 219, 0.15);
            color: white;
          }
          h2 { 
            font-size: 1.35rem; 
            font-weight: 700; 
            margin: 0 0 1rem 0;
            text-transform: uppercase;
          }
          section:nth-child(even) h2 { color: #3498DB; }
          section:nth-child(odd) h2 { color: white; }
          h3 { 
            font-size: 1.05rem; 
            font-weight: 700; 
            margin-bottom: 0.25rem;
          }
          .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .skill-tag {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 20px;
            font-size: 0.875rem;
            display: inline-block;
          }
        `,
        classique: baseStyles + `
          body { 
            font-family: Georgia, 'Times New Roman', serif;
            color: #2C3E50;
            background: #FDFEFE;
          }
          .cv-preview-content {
            padding: 3rem 2.5rem 2.5rem 2.5rem;
          }
          .classique-header { 
            text-align: center; 
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #2C3E50;
            margin-bottom: 2rem;
          }
          .classique-photo {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #2C3E50;
            margin: 0 auto 1.25rem;
            display: block;
          }
          h1 { 
            font-size: 2.5rem; 
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            text-transform: uppercase;
          }
          .title-text {
            font-size: 1.25rem;
            font-style: italic;
            color: #7F8C8D;
          }
          .classique-grid {
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 2.5rem;
          }
          .classique-sidebar { 
            border-right: 2px solid #ECF0F1; 
            padding-right: 2rem;
          }
          .classique-sidebar .contact-list {
            font-size: 0.9rem;
            line-height: 1.8;
          }
          .classique-sidebar ul {
            list-style: none;
            padding: 0;
          }
          .classique-sidebar li {
            margin-bottom: 0.65rem;
            padding-left: 1.25rem;
            position: relative;
          }
          .classique-sidebar li::before {
            content: "▪";
            position: absolute;
            left: 0;
            font-size: 1.1rem;
          }
          h2 {
            font-size: 1.15rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 1px solid #BDC3C7;
            padding-bottom: 0.4rem;
            margin-top: 0;
            margin-bottom: 0.75rem;
          }
          h3 { 
            font-size: 1.1rem; 
            font-weight: 700;
          }
        `,
        creatif: baseStyles + `
          body { 
            font-family: 'Poppins', 'Arial', sans-serif;
            color: #2C3E50;
            background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%);
          }
          .cv-preview-content {
            padding: 0;
            display: grid;
            grid-template-columns: 280px 1fr;
            height: 100%;
          }
          .creatif-sidebar {
            background: linear-gradient(180deg, #58D68D 0%, #27AE60 100%);
            padding: 2.5rem 1.75rem;
            color: white;
          }
          .creatif-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid white;
            margin: 0 auto 1.5rem;
            display: block;
          }
          .creatif-sidebar h1 {
            font-size: 1.75rem;
            font-weight: 800;
            color: white;
            text-align: center;
            margin: 0 0 0.5rem 0;
          }
          .creatif-sidebar .title-text {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.95);
            text-align: center;
            margin-bottom: 1.5rem;
          }
          .creatif-sidebar section {
            background: rgba(255, 255, 255, 0.15);
            padding: 1.25rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
          }
          .creatif-sidebar h2 {
            font-size: 1.1rem;
            font-weight: 700;
            color: white;
            margin: 0 0 0.75rem 0;
            text-transform: uppercase;
          }
          .creatif-sidebar .contact-list p {
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
          }
          .creatif-sidebar ul {
            list-style: none;
            padding: 0;
          }
          .creatif-sidebar li {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            padding-left: 1rem;
            position: relative;
          }
          .creatif-sidebar li::before {
            content: "●";
            position: absolute;
            left: 0;
          }
          .creatif-main {
            background: white;
            padding: 2.5rem;
          }
          .creatif-main section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #F093FB;
          }
          .creatif-main h2 { 
            color: #F5576C; 
            font-size: 1.5rem;
            font-weight: 800;
            margin: 0 0 1rem 0;
            text-transform: uppercase;
          }
          .creatif-main h3 { 
            color: #2C3E50; 
            font-size: 1.15rem; 
            font-weight: 700;
          }
          .skills-creative {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .skill-creative {
            padding: 0.5rem 1rem;
            background: rgba(240, 147, 251, 0.2);
            border: 2px solid #F5576C;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #F5576C;
            display: inline-block;
          }
        `,
        tech: baseStyles + `
          body { 
            font-family: 'Roboto', 'Arial', sans-serif;
            color: #2C3E50;
            background: #F8F9FA;
            position: relative;
          }
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 280px;
            background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 50%, #BB8FCE 100%);
            clip-path: polygon(0 0, 100% 0, 100% 180px, 0 240px);
            z-index: 0;
          }
          .cv-preview-content {
            padding: 2.5rem;
            position: relative;
            z-index: 1;
          }
          .tech-header {
            display: flex;
            align-items: center;
            gap: 2rem;
            padding-bottom: 1.5rem;
            position: relative;
            z-index: 2;
          }
          .tech-photo {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            object-fit: cover;
            border: 4px solid white;
          }
          .tech-header h1 { 
            color: white;
            font-size: 2.25rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          }
          .tech-header .title-text {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 0.75rem;
          }
          .tech-contact code {
            padding: 0.35rem 0.75rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            font-size: 0.875rem;
            color: white;
            margin-right: 0.75rem;
          }
          section {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border-left: 4px solid #8E44AD;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 1.5rem;
          }
          h2 { 
            color: #8E44AD;
            font-size: 1.35rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            text-transform: uppercase;
          }
          h3 { 
            color: #2C3E50;
            font-size: 1.1rem; 
            font-weight: 700;
          }
          .tech-entry {
            padding: 1rem;
            background: #F8F9FA;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #E9ECEF;
          }
          .tech-entry .meta {
            color: #7F8C8D;
            font-style: italic;
          }
          .tech-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .tech-skill {
            padding: 0.5rem 0.875rem;
            background: rgba(142, 68, 173, 0.1);
            border: 2px solid #8E44AD;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #8E44AD;
            display: inline-block;
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
            <div class="entry ${template === 'tech' ? 'tech-entry' : ''}">
              <h3>${item.title || ''}</h3>
              <p class="meta">${item.company || ''} • ${item.years || ''}</p>
              <p>${item.description || ''}</p>
            </div>
          `;
        } else {
          return `
            <div class="entry ${template === 'tech' ? 'tech-entry' : ''}">
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
      } else if (template === 'tech') {
        return `<div class="tech-skills">${skills.map(s => `<span class="tech-skill">${s}</span>`).join('')}</div>`;
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
                  ${cvData.contact.address ? `<span>${cvData.contact.address}</span>` : ''}
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
                    ${cvData.contact.address ? `<p>${cvData.contact.address}</p>` : ''}
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
        <aside class="creatif-sidebar">
          <h1>${cvData.name || 'Votre Nom'}</h1>
          <p class="title-text">${cvData.title || 'Titre Professionnel'}</p>
          ${cvData.contact ? `
            <section>
              <h2>Contact</h2>
              <div class="contact-list">
                ${cvData.contact.email ? `<p>✉ ${cvData.contact.email}</p>` : ''}
                ${cvData.contact.phone ? `<p>📞 ${cvData.contact.phone}</p>` : ''}
                ${cvData.contact.address ? `<p>📍 ${cvData.contact.address}</p>` : ''}
                ${cvData.contact.linkedin ? `<p>💼 ${cvData.contact.linkedin}</p>` : ''}
              </div>
            </section>
          ` : ''}
          ${cvData.skills ? `<section><h2>Compétences</h2>${renderSkills(cvData.skills)}</section>` : ''}
        </aside>
        <main class="creatif-main">
          ${cvData.summary ? `<section><h2>À Propos</h2><p>${cvData.summary}</p></section>` : ''}
          ${cvData.experience ? `<section><h2>Expérience</h2>${renderArray(cvData.experience, 'experience')}</section>` : ''}
          ${cvData.education ? `<section><h2>Formation</h2>${renderArray(cvData.education, 'education')}</section>` : ''}
        </main>
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
                  ${cvData.contact.address ? `<code>${cvData.contact.address}</code>` : ''}
                  ${cvData.contact.linkedin ? `<code>${cvData.contact.linkedin}</code>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          ${cvData.summary ? `<section><h2>Profil</h2><p>${cvData.summary}</p></section>` : ''}
          ${cvData.experience ? `<section><h2>Expérience</h2>${renderArray(cvData.experience, 'experience')}</section>` : ''}
          ${cvData.education ? `<section><h2>Formation</h2>${renderArray(cvData.education, 'education')}</section>` : ''}
          ${cvData.skills ? `<section><h2>Compétences</h2>${renderSkills(cvData.skills)}</section>` : ''}
        </div>
      `;
    }

    if (format === 'pdf') {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>${getTemplateStyles(template || 'moderne')}</style>
          </head>
          <body>
            <div class="cv-preview-content">
              ${bodyContent}
            </div>
          </body>
        </html>
      `;

      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': 'attachment; filename="cv.html"',
        },
      });
    } else if (format === 'docx') {
      throw new Error('DOCX export not yet implemented');
    }

    throw new Error('Invalid format');
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
