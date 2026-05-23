import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationLinkProps {
  to: string;
  children: React.ReactNode;
  active?: boolean;
  isRTL?: boolean;
}

const NavigationLink = ({ to, children, active, isRTL }: NavigationLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "px-4 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground font-semibold"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;
