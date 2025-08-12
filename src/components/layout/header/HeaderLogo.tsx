
import { Link } from "react-router-dom";
import LogoVread from "@/components/brand/LogoVread";

export const HeaderLogo = () => {
  return (
    <Link
      to="/home"
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md"
      aria-label="VREAD - Retour à l'accueil"
    >
      <LogoVread className="h-8 w-8" />
      <span className="text-xl font-medium text-logo-text">VREAD</span>
    </Link>
  );
};
