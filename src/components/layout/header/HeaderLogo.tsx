
import { Link } from "react-router-dom";
import Image from "@/components/ui/image";

export const HeaderLogo = () => {
  return (
    <Link 
      to="/home" 
      className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md"
      aria-label="READ - Retour à l'accueil"
    >
      <Image 
        src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
        alt="READ Logo" 
        className="h-8 w-8"
        priority={true}
        sizes="32px"
      />
      <span className="text-xl font-medium text-logo-text">READ</span>
    </Link>
  );
};
