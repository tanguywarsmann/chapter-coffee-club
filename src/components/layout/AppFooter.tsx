
import React from 'react';
import { Link } from "react-router-dom";

const APP_VERSION = "v.021";

export const AppFooter = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/a-propos" className="hover:text-foreground transition-colors">
              À propos
            </Link>
            <Link to="/presse" className="hover:text-foreground transition-colors">
              Presse
            </Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-2 text-caption text-muted-foreground italic">
            <span>{APP_VERSION}</span>
            <span data-build className="text-xs opacity-60">
              {__VREAD_BUILD__}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
