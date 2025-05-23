
// src/components/ui/lazy-icon.tsx
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

type IconType = (props: LucideProps) => JSX.Element;

interface Props extends Omit<LucideProps, "size"> {
  icon: IconType;
  size?: string | number;
}

/**
 * Wrapper universel pour charger une icône Lucide en lazy-loading
 * et propager correctement la ref vers le SVG.
 */
export const LazyIcon = forwardRef<SVGSVGElement, Props>(
  ({ icon: Icon, size = 20, ...rest }, ref) => (
    <Icon
      ref={ref}
      width={size}
      height={size}
      {...rest}
    />
  )
);

LazyIcon.displayName = "LazyIcon";
