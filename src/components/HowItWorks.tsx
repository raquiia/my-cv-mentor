import { Upload, Sparkles, Target, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your CV",
    description: "Start with your existing CV or create one from scratch with our guided questionnaire.",
    number: "01",
  },
  {
    icon: Sparkles,
    title: "AI Enhancement",
    description: "Our AI optimizes your CV, improving clarity, adding impact metrics, and ensuring ATS compatibility.",
    number: "02",
  },
  {
    icon: Target,
    title: "Tailor to Jobs",
    description: "Paste any job posting and get a perfectly adapted CV that highlights relevant experience.",
    number: "03",
  },
  {
    icon: TrendingUp,
    title: "Practice & Excel",
    description: "Rehearse with our AI interviewer, get scored feedback, and land more offers.",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How it{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From CV to interview success in four simple steps
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-full w-12 h-0.5 bg-border/50" />
                )}
                
                <div className="flex items-start gap-6">
                  {/* Number badge */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center group-hover:scale-110 transition-bounce">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <step.icon className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
