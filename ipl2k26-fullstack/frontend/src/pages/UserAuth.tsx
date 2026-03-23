import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Trophy, Mail, Lock, User, AtSign, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const UserAuth = () => {
  const [isLogin, setIsLogin]           = useState(true);
  const [name, setName]                 = useState("");
  const [username, setUsername]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [identifier, setIdentifier]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const reset = () => {
    setName(""); setUsername(""); setEmail("");
    setPassword(""); setIdentifier(""); setError(""); setShowPassword(false);
  };

  const validate = (): string => {
    if (isLogin) {
      if (!identifier.trim()) return "Please enter your username or email";
      if (!password)          return "Please enter your password";
    } else {
      if (!name.trim())          return "Please enter your full name";
      if (!username.trim())      return "Please choose a username";
      if (username.includes(" ")) return "Username cannot contain spaces";
      if (!email.trim())         return "Please enter your email";
      if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address";
      if (!password)             return "Please enter a password";
      if (password.length < 6)   return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const ok = await login(identifier.trim(), password);
        if (ok) navigate("/user");
      } else {
        const ok = await signup(name.trim(), username.trim(), email.trim(), password);
        if (ok) navigate("/user");
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      // Always reset loading — no more infinite spinner
      setLoading(false);
    }
  };

  const Field = ({ label, icon: Icon, value, onChange, type = "text", placeholder, extra }: any) => (
    <div className="space-y-1">
      <Label className="text-muted-foreground font-display text-xs tracking-wider">{label}</Label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-9 h-11 bg-secondary border-border focus:border-primary text-sm"
          autoCapitalize="none"
          autoCorrect="off"
          {...extra}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="glass-card rounded-2xl w-full max-w-sm sm:max-w-md p-5 sm:p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <Trophy className="text-primary" size={28} />
              <span className="font-display text-2xl font-bold text-gradient-gold tracking-wider">IPL2K26</span>
            </div>
            <h1 className="font-display text-lg font-bold text-foreground tracking-wider">
              {isLogin ? "USER LOGIN" : "CREATE ACCOUNT"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {isLogin ? "Sign in to place your bets" : "Join IPL2K26 and start winning"}
            </p>
          </div>

          {/* Error box */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-lg px-3 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            {/* Signup-only fields */}
            {!isLogin && (
              <>
                <Field label="FULL NAME" icon={User}
                  value={name} onChange={(e: any) => setName(e.target.value)}
                  placeholder="Your full name"
                  extra={{ maxLength: 100, autoComplete: "name" }} />
                <Field label="USERNAME" icon={AtSign}
                  value={username}
                  onChange={(e: any) => setUsername(e.target.value.replace(/\s/g, ""))}
                  placeholder="No spaces — used to log in"
                  extra={{ maxLength: 30, autoComplete: "username" }} />
                <Field label="EMAIL" icon={Mail} type="email"
                  value={email} onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  extra={{ maxLength: 255, autoComplete: "email", inputMode: "email" }} />
              </>
            )}

            {/* Login identifier */}
            {isLogin && (
              <Field label="USERNAME OR EMAIL" icon={AtSign}
                value={identifier} onChange={(e: any) => setIdentifier(e.target.value)}
                placeholder="Enter username or email"
                extra={{ maxLength: 255, autoComplete: "username" }} />
            )}

            {/* Password with show/hide */}
            <div className="space-y-1">
              <Label className="text-muted-foreground font-display text-xs tracking-wider">PASSWORD</Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSubmit(); }}
                  placeholder={isLogin ? "Enter password" : "Min 6 characters"}
                  className="pl-9 pr-11 h-11 bg-secondary border-border focus:border-primary text-sm"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 touch-manipulation">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 gradient-gold text-primary-foreground font-display font-bold tracking-wider text-sm touch-manipulation disabled:opacity-60">
              {loading
                ? <><Loader2 size={16} className="animate-spin mr-2" />{isLogin ? "SIGNING IN..." : "CREATING ACCOUNT..."}</>
                : <>{isLogin ? "LOGIN" : "CREATE ACCOUNT"}<ArrowRight size={16} className="ml-2" /></>
              }
            </Button>
          </div>

          {/* Toggle */}
          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); reset(); }}
              disabled={loading}
              className="text-sm text-primary hover:underline font-medium py-2 touch-manipulation">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
