
import React, { memo } from 'react';

/**
 * Composant de base mémorisé pour éviter les re-rendus inutiles
 */
interface MemoizedComponentProps {
  children: React.ReactNode;
  deps?: any[];
}

export const MemoizedComponent = memo<MemoizedComponentProps>(
  ({ children }) => {
    return <>{children}</>;
  },
  (prevProps, nextProps) => {
    // Comparaison shallow des deps si fournies
    if (prevProps.deps && nextProps.deps) {
      return prevProps.deps.every((dep, index) => dep === nextProps.deps![index]);
    }
    
    // Sinon comparaison par défaut
    return prevProps.children === nextProps.children;
  }
);

MemoizedComponent.displayName = 'MemoizedComponent';
