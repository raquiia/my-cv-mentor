import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Sparkles, Save, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import '../styles/cv-templates.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function CVEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cvData, setCvData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("moderne");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [credits, setCredits] = useState(0);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.85);

  // Load user credits
  useEffect(() => {
    if (user) {
      loadCredits();
    }
  }, [user]);

  const loadCredits = async () => {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user?.id)
      .single();
    
    if (data) setCredits(data.balance);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|docx?)$/i)) {
      toast.error("Format non supporté. Utilisez PDF ou DOCX.");
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);
    setExtractionWarning(null);
    setOriginalPreviewUrl(null);
    setProfilePhotoUrl(null);
    
    try {
      let extractedText = '';
      const isPDF = file.type === 'application/pdf';
      
      if (isPDF) {
        // Extract text from PDF using pdfjs
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        // Generate high-resolution thumbnail from first page for photo extraction
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.5 }); // Higher resolution for better photo detection
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };
          await page.render(renderContext).promise;
          const highResImage = canvas.toDataURL('image/jpeg', 0.95);
          setOriginalPreviewUrl(highResImage);
          
          // Extract profile photo using AI vision
          try {
            const { data: photoData, error: photoError } = await supabase.functions.invoke('extract-photo', {
              body: { imageDataUrl: highResImage }
            });
            
            if (!photoError && photoData?.hasPhoto) {
              console.log('Profile photo detected:', photoData.description);
              // For now, use the full page as photo - in future, could crop to detected region
              setProfilePhotoUrl(highResImage);
            } else {
              console.log('No profile photo detected');
            }
          } catch (photoError) {
            console.warn('Photo extraction failed:', photoError);
            // Continue without photo
          }
        }
        
        // Extract text from all pages
        const textParts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          textParts.push(pageText);
        }
        extractedText = textParts.join('\n\n').trim();
        
      } else {
        // Extract text from DOCX using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value.trim();
      }

      // Check if extraction was successful
      if (!extractedText || extractedText.length < 100) {
        setExtractionWarning(
          "Le PDF semble scanné ou l'extraction a échoué. Essayez la version DOCX ou un PDF avec texte sélectionnable."
        );
        toast.error("Extraction de texte insuffisante");
        return;
      }

      // Send extracted text to parse-cv function
      const { data, error } = await supabase.functions.invoke("parse-cv", {
        body: { text: extractedText },
      });

      if (error) throw error;

      if (data?.cvData) {
        // Check if we got meaningful data
        const hasData = data.cvData.name || data.cvData.experience?.length || data.cvData.education?.length;
        if (!hasData) {
          setExtractionWarning("Les informations extraites semblent incomplètes. Vérifiez le fichier.");
        }
        setCvData(data.cvData);
        toast.success("CV analysé avec succès !");
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleImproveSection = async (section: string) => {
    if (credits < 10) {
      toast.error("Crédits insuffisants (10 requis)");
      navigate("/pricing");
      return;
    }

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-section", {
        body: { 
          section, 
          content: cvData[section],
          userId: user?.id 
        },
      });

      if (error) throw error;

      setCvData({ ...cvData, [section]: data.improved });
      setCredits(c => c - 10);
      toast.success("Section améliorée ! (-10 crédits)");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'amélioration");
    } finally {
      setIsImproving(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!cvData) {
      toast.error("Aucun CV à exporter");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("export-cv", {
        body: { 
          cvData, 
          template: selectedTemplate,
          format,
          userId: user?.id 
        },
      });

      if (error) throw error;

      // Download file
      const blob = new Blob([data], { 
        type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv.${format}`;
      a.click();

      toast.success(`CV exporté en ${format.toUpperCase()} !`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'export");
    }
  };

  const templates = [
    { id: "moderne", name: "Moderne", preview: "/templates/moderne.jpg" },
    { id: "classique", name: "Classique", preview: "/templates/classique.jpg" },
    { id: "creatif", name: "Créatif", preview: "/templates/creatif.jpg" },
    { id: "tech", name: "Tech", preview: "/templates/tech.jpg" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {isAnalyzing && <LoadingOverlay message="Analyse du CV en cours..." />}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Éditeur de CV</h1>
            <p className="text-muted-foreground">Créez un CV professionnel en quelques clics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Crédits: </span>
              <span className="font-bold text-primary">{credits}</span>
            </div>
            <Button variant="outline" onClick={() => navigate("/pricing")}>
              Ajouter des crédits
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Upload & Sections */}
          <Card className="lg:col-span-3 p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Upload CV</h3>
              <label className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? "Analyse en cours..." : "PDF ou DOCX"}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              
              {extractionWarning && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">{extractionWarning}</p>
                </div>
              )}
              
              {originalPreviewUrl && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">CV Original</p>
                  <img 
                    src={originalPreviewUrl} 
                    alt="Aperçu CV" 
                    className="w-full rounded border"
                  />
                </div>
              )}
            </div>

            {cvData && (
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Sections</h3>
                {["summary", "experience", "education", "skills"].map((section) => (
                  <div key={section} className="flex items-center justify-between p-2 hover:bg-accent rounded">
                    <span className="text-sm capitalize">{section}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleImproveSection(section)}
                      disabled={isImproving}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Center Panel - Preview */}
          <Card className="lg:col-span-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Aperçu</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport("docx")}>
                  <Download className="h-4 w-4 mr-2" />
                  DOCX
                </Button>
              </div>
            </div>
            
            {/* A4 Preview Container */}
            <div className="flex flex-col items-center gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}
                >
                  -
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))}
                >
                  +
                </Button>
              </div>

              {/* A4 Page */}
              <div 
                className={`cv-page-a4 cv-template-${selectedTemplate} shadow-xl`}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              >
                  {cvData ? (
                    <div className="cv-preview-content">
                  {/* Template Moderne - 1 colonne avec header */}
                  {selectedTemplate === "moderne" && (
                    <div className="moderne-layout">
                      <div className="moderne-header">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Photo" className="moderne-photo" />
                        ) : (
                          <div className="moderne-photo-placeholder">
                            <span>Photo</span>
                          </div>
                        )}
                        <div className="moderne-header-text">
                          <h1>{cvData.name || "Votre Nom"}</h1>
                          <p className="title-text">{cvData.title || "Titre Professionnel"}</p>
                          {cvData.contact && (
                            <div className="contact-info">
                              {cvData.contact.email && <span>{cvData.contact.email}</span>}
                              {cvData.contact.phone && <span>{cvData.contact.phone}</span>}
                              {cvData.contact.linkedin && <span>{cvData.contact.linkedin}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {cvData.summary && (
                        <section>
                          <h2>Résumé</h2>
                          <p>{cvData.summary}</p>
                        </section>
                      )}

                      {cvData.experience && (
                        <section>
                          <h2>Expérience</h2>
                          {Array.isArray(cvData.experience) ? (
                            cvData.experience.map((exp: any, idx: number) => (
                              <div key={idx} className="entry">
                                <h3>{exp.title}</h3>
                                <p className="meta">{exp.company} • {exp.years}</p>
                                <p>{exp.description}</p>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.experience}</div>
                          )}
                        </section>
                      )}

                      {cvData.education && (
                        <section>
                          <h2>Formation</h2>
                          {Array.isArray(cvData.education) ? (
                            cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="entry">
                                <h3>{edu.degree}</h3>
                                <p className="meta">{edu.university} • {edu.years}</p>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.education}</div>
                          )}
                        </section>
                      )}

                      {cvData.skills && (
                        <section>
                          <h2>Compétences</h2>
                          {Array.isArray(cvData.skills) ? (
                            <div className="skills-grid">
                              {cvData.skills.map((skill: string, idx: number) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.skills}</div>
                          )}
                        </section>
                      )}
                    </div>
                  )}

                  {/* Template Classique - 2 colonnes */}
                  {selectedTemplate === "classique" && (
                    <div className="classique-layout">
                      <div className="classique-header">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Photo" className="classique-photo" />
                        ) : (
                          <div className="classique-photo-placeholder">
                            <span>Photo</span>
                          </div>
                        )}
                        <h1>{cvData.name || "Votre Nom"}</h1>
                        <p className="title-text">{cvData.title || "Titre Professionnel"}</p>
                      </div>
                      
                      <div className="classique-grid">
                        <aside className="classique-sidebar">
                          {cvData.contact && (
                            <section>
                              <h2>Contact</h2>
                              <div className="contact-list">
                                {cvData.contact.email && <p>{cvData.contact.email}</p>}
                                {cvData.contact.phone && <p>{cvData.contact.phone}</p>}
                                {cvData.contact.linkedin && <p>{cvData.contact.linkedin}</p>}
                              </div>
                            </section>
                          )}
                          
                          {cvData.skills && (
                            <section>
                              <h2>Compétences</h2>
                              {Array.isArray(cvData.skills) ? (
                                <ul>
                                  {cvData.skills.map((skill: string, idx: number) => (
                                    <li key={idx}>{skill}</li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="whitespace-pre-wrap">{cvData.skills}</div>
                              )}
                            </section>
                          )}
                          
                          {cvData.languages && (
                            <section>
                              <h2>Langues</h2>
                              <p>{cvData.languages}</p>
                            </section>
                          )}
                        </aside>
                        
                        <main className="classique-main">
                          {cvData.summary && (
                            <section>
                              <h2>Profil</h2>
                              <p>{cvData.summary}</p>
                            </section>
                          )}

                          {cvData.experience && (
                            <section>
                              <h2>Expérience Professionnelle</h2>
                              {Array.isArray(cvData.experience) ? (
                                cvData.experience.map((exp: any, idx: number) => (
                                  <div key={idx} className="entry">
                                    <h3>{exp.title}</h3>
                                    <p className="meta">{exp.company} • {exp.years}</p>
                                    <p>{exp.description}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="whitespace-pre-wrap">{cvData.experience}</div>
                              )}
                            </section>
                          )}

                          {cvData.education && (
                            <section>
                              <h2>Formation</h2>
                              {Array.isArray(cvData.education) ? (
                                cvData.education.map((edu: any, idx: number) => (
                                  <div key={idx} className="entry">
                                    <h3>{edu.degree}</h3>
                                    <p className="meta">{edu.university} • {edu.years}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="whitespace-pre-wrap">{cvData.education}</div>
                              )}
                            </section>
                          )}
                        </main>
                      </div>
                    </div>
                  )}

                  {/* Template Créatif - avec fonds colorés */}
                  {selectedTemplate === "creatif" && (
                    <div className="creatif-layout">
                      <div className="creatif-header">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Photo" className="creatif-photo" />
                        ) : (
                          <div className="creatif-photo-placeholder">
                            <span>📷</span>
                          </div>
                        )}
                        <div>
                          <h1>{cvData.name || "Votre Nom"}</h1>
                          <p className="title-text">{cvData.title || "Titre Professionnel"}</p>
                        </div>
                      </div>
                      
                      {cvData.contact && (
                        <div className="creatif-contact">
                          {cvData.contact.email && <span>✉ {cvData.contact.email}</span>}
                          {cvData.contact.phone && <span>📞 {cvData.contact.phone}</span>}
                          {cvData.contact.linkedin && <span>💼 {cvData.contact.linkedin}</span>}
                        </div>
                      )}
                      
                      {cvData.summary && (
                        <section className="creatif-section">
                          <h2>À Propos</h2>
                          <p>{cvData.summary}</p>
                        </section>
                      )}

                      {cvData.experience && (
                        <section className="creatif-section">
                          <h2>Expérience</h2>
                          {Array.isArray(cvData.experience) ? (
                            cvData.experience.map((exp: any, idx: number) => (
                              <div key={idx} className="entry">
                                <h3>{exp.title}</h3>
                                <p className="meta">{exp.company} • {exp.years}</p>
                                <p>{exp.description}</p>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.experience}</div>
                          )}
                        </section>
                      )}

                      {cvData.education && (
                        <section className="creatif-section">
                          <h2>Formation</h2>
                          {Array.isArray(cvData.education) ? (
                            cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="entry">
                                <h3>{edu.degree}</h3>
                                <p className="meta">{edu.university} • {edu.years}</p>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.education}</div>
                          )}
                        </section>
                      )}

                      {cvData.skills && (
                        <section className="creatif-section">
                          <h2>Compétences</h2>
                          {Array.isArray(cvData.skills) ? (
                            <div className="skills-creative">
                              {cvData.skills.map((skill: string, idx: number) => (
                                <span key={idx} className="skill-creative">{skill}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.skills}</div>
                          )}
                        </section>
                      )}
                    </div>
                  )}

                  {/* Template Tech - style développeur */}
                  {selectedTemplate === "tech" && (
                    <div className="tech-layout">
                      <div className="tech-header">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Photo" className="tech-photo" />
                        ) : (
                          <div className="tech-photo-placeholder">
                            <span>{"<img/>"}</span>
                          </div>
                        )}
                        <div>
                          <h1>{cvData.name || "Votre Nom"}</h1>
                          <p className="title-text">{cvData.title || "Titre Professionnel"}</p>
                          {cvData.contact && (
                            <div className="tech-contact">
                              {cvData.contact.email && <code>{cvData.contact.email}</code>}
                              {cvData.contact.phone && <code>{cvData.contact.phone}</code>}
                              {cvData.contact.linkedin && <code>{cvData.contact.linkedin}</code>}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {cvData.summary && (
                        <section className="tech-section">
                          <h2>README.md</h2>
                          <p>{cvData.summary}</p>
                        </section>
                      )}

                      {cvData.experience && (
                        <section className="tech-section">
                          <h2>work_experience/</h2>
                          {Array.isArray(cvData.experience) ? (
                            cvData.experience.map((exp: any, idx: number) => (
                              <div key={idx} className="entry tech-entry">
                                <h3>{exp.title}</h3>
                                <p className="meta">// {exp.company} | {exp.years}</p>
                                <p>{exp.description}</p>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.experience}</div>
                          )}
                        </section>
                      )}

                      {cvData.education && (
                        <section className="tech-section">
                          <h2>education/</h2>
                          {Array.isArray(cvData.education) ? (
                            cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="entry tech-entry">
                                <h3>{edu.degree}</h3>
                                <p className="meta">// {edu.university} | {edu.years}</p>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.education}</div>
                          )}
                        </section>
                      )}

                      {cvData.skills && (
                        <section className="tech-section">
                          <h2>skills: [</h2>
                          {Array.isArray(cvData.skills) ? (
                            <div className="tech-skills">
                              {cvData.skills.map((skill: string, idx: number) => (
                                <code key={idx} className="tech-skill">"{skill}",</code>
                              ))}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{cvData.skills}</div>
                          )}
                          <p className="tech-close">]</p>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="cv-preview-content flex flex-col items-center justify-center h-full text-center">
                  <Eye className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun CV chargé</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploadez un CV pour commencer
                  </p>
                </div>
              )}
              </div>
            </div>
          </Card>

          {/* Right Panel - Templates & Settings */}
          <Card className="lg:col-span-3 p-6">
            <Tabs defaultValue="templates">
              <TabsList className="w-full">
                <TabsTrigger value="templates" className="flex-1">Thèmes</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1">IA</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4 mt-4">
                <h3 className="font-semibold mb-2">Modèles Premium</h3>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all hover:scale-105 ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <img 
                      src={template.preview} 
                      alt={template.name}
                      className="aspect-[3/4] w-full object-cover rounded mb-2"
                    />
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                        Sélectionné
                      </div>
                    )}
                    <p className="text-sm font-medium text-center">{template.name}</p>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold mb-2">Outils IA</h3>
                  <div className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      disabled={!cvData || isImproving}
                      onClick={() => handleImproveSection("summary")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Améliorer résumé (10 cr)
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      disabled={!cvData || isImproving}
                      onClick={() => handleImproveSection("experience")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Quantifier expérience (10 cr)
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      disabled={!cvData || isImproving}
                      onClick={() => handleImproveSection("skills")}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Optimiser compétences (10 cr)
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
