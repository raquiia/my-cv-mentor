import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Sparkles, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function CVEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cvData, setCvData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("moderne");
  const [isUploading, setIsUploading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [credits, setCredits] = useState(0);

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
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data, error } = await supabase.functions.invoke("parse-cv", {
        body: formData,
      });

      if (error) throw error;

      setCvData(data.cvData);
      toast.success("CV analysé avec succès !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
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
            
            <div className="border rounded-lg bg-white min-h-[800px] shadow-lg p-8">
              {cvData ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{cvData.name || "Votre Nom"}</h2>
                    <p className="text-gray-600">{cvData.title || "Titre Professionnel"}</p>
                  </div>
                  
                  {cvData.summary && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Résumé</h3>
                      <p className="text-gray-700">{cvData.summary}</p>
                    </div>
                  )}

                  {cvData.experience && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Expérience</h3>
                      <div className="text-gray-700 space-y-3">
                        {Array.isArray(cvData.experience) ? (
                          cvData.experience.map((exp: any, idx: number) => (
                            <div key={idx} className="mb-3">
                              <div className="font-semibold">{exp.title}</div>
                              <div className="text-sm text-gray-600">{exp.company} • {exp.years}</div>
                              <div className="mt-1">{exp.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="whitespace-pre-wrap">{cvData.experience}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {cvData.education && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Formation</h3>
                      <div className="text-gray-700 space-y-3">
                        {Array.isArray(cvData.education) ? (
                          cvData.education.map((edu: any, idx: number) => (
                            <div key={idx} className="mb-3">
                              <div className="font-semibold">{edu.degree}</div>
                              <div className="text-sm text-gray-600">{edu.university} • {edu.years}</div>
                            </div>
                          ))
                        ) : (
                          <div className="whitespace-pre-wrap">{cvData.education}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {cvData.skills && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Compétences</h3>
                      <div className="text-gray-700">
                        {Array.isArray(cvData.skills) ? (
                          <div className="flex flex-wrap gap-2">
                            {cvData.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{cvData.skills}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Eye className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun CV chargé</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploadez un CV pour commencer
                  </p>
                </div>
              )}
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
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <img 
                      src={template.preview} 
                      alt={template.name}
                      className="aspect-[3/4] w-full object-cover rounded mb-2"
                    />
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
