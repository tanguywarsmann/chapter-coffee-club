import { useAuth } from "@/contexts/AuthContext";

export default function AdminBadge() {
  const { user, isAdmin } = useAuth();
  
  if (!user) return null;

  return (
    <div className="text-xs text-muted-foreground">
      {user.email} · {isAdmin ? 'Admin ✅' : 'Admin ❌'}
    </div>
  );
}