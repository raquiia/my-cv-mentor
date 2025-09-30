import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const packs = [
  {
    name: "Starter",
    price: "9",
    credits: "100",
    perCredit: "0.09",
    features: [
      "1-2 CV transformations",
      "5 interview minutes",
      "Basic AI improvements",
      "Standard templates",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "24",
    credits: "350",
    perCredit: "0.068",
    features: [
      "5-7 CV transformations",
      "17 interview minutes",
      "Advanced AI features",
      "Premium templates",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Power",
    price: "49",
    credits: "900",
    perCredit: "0.054",
    features: [
      "15+ CV transformations",
      "45 interview minutes",
      "All AI features",
      "Custom templates",
      "Priority support",
      "Career coaching access",
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              credit-based
            </span>{" "}
            pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. No subscriptions, no hidden fees. Credits never expire.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packs.map((pack, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                pack.popular
                  ? "border-primary shadow-glow scale-105"
                  : "border-border/50"
              } transition-smooth hover:shadow-lg`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold">€{pack.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pack.credits} credits • €{pack.perCredit}/credit
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {pack.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className={`w-full ${
                  pack.popular ? "gradient-accent" : ""
                }`}
                variant={pack.popular ? "default" : "outline"}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            🎁 New users get <span className="font-semibold text-foreground">free trial credits</span> to explore the platform
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
