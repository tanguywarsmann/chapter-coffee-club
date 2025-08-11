
import { Link } from "react-router-dom";
import Image from "@/components/ui/image";

export const HeaderLogo = () => {
  return (
    <Link
      to="/home"
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md"
      aria-label="VREAD - Retour à l'accueil"
    >
      <Image
        src="/branding/vread-logo.svg"
        alt="VREAD logo"
        width={32}
        height={32}
        className="h-8 w-8"
        decoding="async"
        loading="eager"
        priority
      />
      <span className="text-xl font-medium text-logo-text">VREAD</span>
    </Link>
  );
};
