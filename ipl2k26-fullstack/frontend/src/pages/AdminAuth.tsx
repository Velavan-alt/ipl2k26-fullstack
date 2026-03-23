import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const success = adminLogin(email.trim(), password);
    if (success) navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="glass-card rounded-lg p-8 w-full max-w-md border-primary/20 glow-gold">
          <div className="text-center mb-8">
            <div className="gradient-gold rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground tracking-wider">ADMIN LOGIN</h1>
            <p className="text-sm text-muted-foreground mt-1">Authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display text-xs tracking-wider">ADMIN EMAIL</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="velavanv77@gmail.com"
                  className="pl-10 bg-secondary border-border focus:border-primary"
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground font-display text-xs tracking-wider">PASSWORD</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-10 bg-secondary border-border focus:border-primary"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-gold text-primary-foreground font-display font-bold tracking-wider py-5">
              ACCESS DASHBOARD <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
