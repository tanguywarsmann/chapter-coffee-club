
import React from 'react';

const APP_VERSION = "v.021";

export const AppFooter = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/a-propos" className="hover:text-foreground transition-colors">
              À propos
            </a>
            <a href="/presse" className="hover:text-foreground transition-colors">
              Presse
            </a>
            <a href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </a>
          </div>
          <span className="text-caption text-muted-foreground italic">
            {APP_VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
