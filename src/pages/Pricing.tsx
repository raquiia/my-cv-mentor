import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const packs = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    credits: 100,
    perCredit: 0.09,
    features: [
      "100 crédits",
      "1-2 transformations de CV",
      "2-3 améliorations IA",
      "~20 minutes d'entretien",
      "Support email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 24,
    credits: 350,
    perCredit: 0.068,
    popular: true,
    features: [
      "350 crédits",
      "5-7 transformations de CV",
      "~17 améliorations IA",
      "~70 minutes d'entretien",
      "Support prioritaire",
      "Économie de 24%",
    ],
  },
  {
    id: "power",
    name: "Power",
    price: 49,
    credits: 900,
    perCredit: 0.054,
    features: [
      "900 crédits",
      "15-20 transformations de CV",
      "~45 améliorations IA",
      "~180 minutes d'entretien",
      "Support VIP",
      "Économie de 40%",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectPack = async (packId: string) => {
    if (!user) {
      navigate("/auth?redirect=/pricing");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { packId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Packs de crédits</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez le pack qui correspond à vos besoins. Plus de crédits, plus d'économies.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            🎁 <strong>Offre de lancement :</strong> 3 crédits gratuits pour tester la plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packs.map((pack) => (
            <Card
              key={pack.name}
              className={`relative ${
                pack.popular ? "border-primary border-2 shadow-lg scale-105" : ""
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    Le plus populaire
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl">{pack.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">{pack.price}€</span>
                </div>
                <CardDescription className="mt-2">
                  {pack.credits} crédits ({pack.perCredit.toFixed(3)}€/crédit)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  onClick={() => handleSelectPack(pack.id)}
                >
                  Obtenir {pack.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Les crédits n'expirent pas. Remboursement pro-rata pour les crédits non utilisés.
            Paiement sécurisé par Stripe avec Apple Pay et Google Pay.
          </p>
        </div>
      </div>
    </div>
  );
}