import { FileText, Target, Mic, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Professional CV Builder",
    description: "Create stunning CVs with AI-powered optimization. Choose from premium templates and let AI enhance your experience.",
    color: "from-primary to-primary-light",
  },
  {
    icon: Target,
    title: "Job-Tailored CVs",
    description: "Paste any job posting and watch AI adapt your CV to match. Highlight relevant skills without ever lying.",
    color: "from-accent to-accent-light",
  },
  {
    icon: Mic,
    title: "AI Interview Practice",
    description: "Practice with our AI recruiter. Get real-time feedback, scoring, and personalized tips to nail your next interview.",
    color: "from-primary-light to-accent",
  },
  {
    icon: MessageSquare,
    title: "Career Coaching",
    description: "Get instant career advice, negotiation tips, and strategic guidance from our AI coach, available 24/7.",
    color: "from-accent-light to-primary",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              stand out
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete platform to prepare, practice, and perfect your job application journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-lg transition-smooth border-border/50 group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-bounce`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-base">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
