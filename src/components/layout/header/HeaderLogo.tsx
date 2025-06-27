
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
        src="/READ-logo.png" 
        alt="READ Logo" 
        className="h-8 w-8"
      />
      <span className="text-xl font-medium text-logo-text">READ</span>
    </Link>
  );
};
