import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="font-semibold">Not a Résumé</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered career platform for CV creation and interview preparation.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#features" className="hover:text-foreground transition-base">
                  Features
                </Link>
              </li>
              <li>
                <Link to="#pricing" className="hover:text-foreground transition-base">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  Templates
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-base">
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Not a Résumé. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-foreground transition-base">
              Twitter
            </Link>
            <Link to="#" className="hover:text-foreground transition-base">
              LinkedIn
            </Link>
            <Link to="#" className="hover:text-foreground transition-base">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
