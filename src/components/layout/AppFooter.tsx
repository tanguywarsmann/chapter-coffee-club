
import React from 'react';
import { Link } from "react-router-dom";

const APP_VERSION = "v.022";

export const AppFooter = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-muted-foreground">
            <Link to="/a-propos" className="hover:text-foreground transition-colors">
              À propos
            </Link>
            <Link to="/presse" className="hover:text-foreground transition-colors">
              Presse
            </Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link to="/duolingo" className="hover:text-foreground transition-colors">
              VREAD vs Duolingo
            </Link>
            <Link to="/strava" className="hover:text-foreground transition-colors">
              Le Strava de la lecture
            </Link>
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">
              CGU
            </Link>
          </div>
          <div className="flex items-center gap-2 text-caption text-muted-foreground italic">
            <span>{APP_VERSION}</span>
            <span data-build className="text-caption opacity-60">
              {__VREAD_BUILD__}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
