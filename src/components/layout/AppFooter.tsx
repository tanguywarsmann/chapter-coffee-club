
import React from 'react';

const APP_VERSION = "v0.11"; // Version mise à jour suite aux améliorations UX

export const AppFooter = () => {
  return (
    <footer className="fixed bottom-0 right-0 z-10 pointer-events-none">
      <div className="px-4 py-2">
        <span className="text-xs text-muted-foreground italic">
          {APP_VERSION}
        </span>
      </div>
    </footer>
  );
};

export default AppFooter;
