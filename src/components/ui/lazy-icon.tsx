
import { forwardRef } from "react";
import type { Icon as LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  className?: string;
  size?: string | number;
};

export const LazyIcon = forwardRef<SVGSVGElement, Props>(
  ({ icon: Icon, className, size = 20, ...rest }, ref) => (
    <Icon ref={ref} className={className} width={size} height={size} {...rest} />
  )
);

LazyIcon.displayName = "LazyIcon";
