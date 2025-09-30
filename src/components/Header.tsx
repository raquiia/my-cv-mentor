import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="font-semibold text-lg">Not a Résumé</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-base">
              Features
            </Link>
            <Link to="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-base">
              Pricing
            </Link>
            <Link to="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-base">
              How it works
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm" className="gradient-accent">
              Try free
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
