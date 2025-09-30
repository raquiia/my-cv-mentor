import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Briefcase, Mic, MessageSquare, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setCredits(data.balance);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos crédits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenue {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card>
              <CardContent className="flex items-center gap-2 py-3 px-4">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-semibold">{credits ?? 0} crédits</span>
              </CardContent>
            </Card>
            <Button onClick={() => navigate("/pricing")}>
              Acheter des crédits
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>CV</CardTitle>
              <CardDescription>
                Créer ou optimiser votre CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => toast({ title: "Bientôt disponible" })}>
                Commencer
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Briefcase className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Adaptation offre</CardTitle>
              <CardDescription>
                Adapter votre CV à une offre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => toast({ title: "Bientôt disponible" })}>
                Adapter
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Mic className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Entretien IA</CardTitle>
              <CardDescription>
                S'entraîner à l'oral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => toast({ title: "Bientôt disponible" })}>
                Démarrer
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Coaching</CardTitle>
              <CardDescription>
                Conseils personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => toast({ title: "Bientôt disponible" })}>
                Discuter
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Historique récent</CardTitle>
            <CardDescription>
              Vos dernières activités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Aucune activité pour le moment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}