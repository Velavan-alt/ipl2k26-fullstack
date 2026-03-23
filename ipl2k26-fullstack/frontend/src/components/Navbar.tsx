import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const close    = () => setMenuOpen(false);

  return (
    <nav className="glass-card border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <Trophy className="text-primary" size={24} />
          <span className="font-display text-lg sm:text-xl font-bold text-gradient-gold tracking-wider">IPL2K26</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <Link to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-display text-sm tracking-wider transition-all ${isActive("/") ? "gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Trophy size={15} />HOME
          </Link>

          {/* USER link — shown to guests and regular users, hidden from admin */}
          {!isAdmin && (
            <Link to={isAuthenticated ? "/user" : "/auth/user"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-display text-sm tracking-wider transition-all ${isActive("/user") || isActive("/auth/user") ? "gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <User size={15} />
              {isAuthenticated ? (user?.username ? `@${user.username}` : "MY PANEL") : "USER"}
            </Link>
          )}

          {/* ADMIN dashboard link — ONLY shown when logged in as admin */}
          {isAdmin && (
            <Link to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-display text-sm tracking-wider transition-all ${isActive("/admin") ? "gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              DASHBOARD
            </Link>
          )}

          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={logout}
              className="text-muted-foreground hover:text-foreground font-display text-sm tracking-wider ml-1">
              <LogOut size={15} className="mr-1" />LOGOUT
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 space-y-1">
          <Link to="/" onClick={close}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md font-display text-sm tracking-wider ${isActive("/") ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}>
            <Trophy size={15} />HOME
          </Link>

          {!isAdmin && (
            <Link to={isAuthenticated ? "/user" : "/auth/user"} onClick={close}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md font-display text-sm tracking-wider ${isActive("/user") || isActive("/auth/user") ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}>
              <User size={15} />
              {isAuthenticated ? (user?.username ? `@${user.username}` : "MY PANEL") : "USER"}
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={close}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md font-display text-sm tracking-wider ${isActive("/admin") ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}>
              DASHBOARD
            </Link>
          )}

          {isAuthenticated && (
            <button onClick={() => { logout(); close(); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md font-display text-sm tracking-wider text-muted-foreground w-full">
              <LogOut size={15} />LOGOUT
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
