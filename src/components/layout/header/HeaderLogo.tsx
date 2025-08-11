
import { Link } from "react-router-dom";
import Image from "@/components/ui/image";

export const HeaderLogo = () => {
  return (
    <Link 
      to="/home"
      className="flex items-center gap-2 transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md"
      aria-label="VREAD - Retour à l'accueil"
    >
      <Image 
        src="/READ-logo.png"
        alt="VREAD logo"
        className="h-8 w-8"
        priority={true}
        sizes="32px"
      />
      <span className="text-xl font-medium text-logo-text">VREAD</span>
    </Link>
  );
};
