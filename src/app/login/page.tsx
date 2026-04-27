"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signIn, signUp, signInWithGoogle, isAdmin } from "@/lib/auth";

type Mode = "login" | "signup" | "reset";

function parseFirebaseError(msg: string): string {
  if (
    msg.includes("user-not-found") ||
    msg.includes("wrong-password") ||
    msg.includes("invalid-credential") ||
    msg.includes("invalid-login-credentials")
  ) return "Email ou mot de passe incorrect.";
  if (msg.includes("email-already-in-use")) return "Un compte existe déjà avec cet email.";
  if (msg.includes("too-many-requests")) return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (msg.includes("network-request-failed")) return "Erreur réseau. Vérifiez votre connexion.";
  if (msg.includes("n'est pas configuré") || msg.includes("not configured")) return "Firebase non configuré.";
  return "Une erreur est survenue. Vérifiez vos identifiants.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "reset") {
        if (!auth) throw new Error("Firebase n'est pas configuré.");
        await sendPasswordResetEmail(auth, email);
        setSuccess("Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail (et vos spams).");
        setLoading(false);
        return;
      }

      let cred;
      if (mode === "login") {
        cred = await signIn(email, password);
      } else {
        cred = await signUp(email, password);
      }
      router.push(isAdmin(cred.user) ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (mode === "reset" && msg.includes("user-not-found")) {
        setError("Aucun compte trouvé avec cet email.");
      } else {
        setError(parseFirebaseError(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const gcred = await signInWithGoogle();
      router.push(isAdmin(gcred.user) ? "/admin" : "/dashboard");
    } catch {
      setError("Connexion Google échouée.");
    }
  };

  const title = mode === "login" ? "Connexion" : mode === "signup" ? "Créer un compte" : "Mot de passe oublié";
  const subtitle =
    mode === "login" ? "Accédez à votre espace GetAxe." :
    mode === "signup" ? "Rejoignez GetAxe en tant que client ou professionnel." :
    "Entrez votre email pour recevoir un lien de réinitialisation.";

  return (
    <div className="min-h-screen bg-axe-black flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-axe-white mb-2">{title}</h1>
          <p className="text-axe-muted text-sm">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm text-axe-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="vous@exemple.fr"
              required
              autoComplete="email"
            />
          </div>

          {/* Mot de passe (masqué en mode reset) */}
          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-axe-muted">Mot de passe</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-xs text-axe-muted hover:text-axe-white transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? "Chargement…" :
              mode === "login" ? "Se connecter" :
              mode === "signup" ? "Créer mon compte" :
              "Envoyer le lien de réinitialisation"}
          </button>
        </form>

        {/* Google — masqué en mode reset */}
        {mode !== "reset" && (
          <div className="mt-4">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-axe-muted">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <button
              onClick={handleGoogle}
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
          </div>
        )}

        {/* Liens bas de page */}
        <div className="text-center mt-6 space-y-2">
          {mode === "login" && (
            <p className="text-sm text-axe-muted">
              Pas encore de compte ?{" "}
              <button onClick={() => switchMode("signup")} className="text-axe-accent hover:underline">
                S&apos;inscrire
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-sm text-axe-muted">
              D&#233;j&#224; un compte ?{" "}
              <button onClick={() => switchMode("login")} className="text-axe-accent hover:underline">
                Se connecter
              </button>
            </p>
          )}
          {mode === "reset" && (
            <p className="text-sm text-axe-muted">
              <button onClick={() => switchMode("login")} className="text-axe-accent hover:underline">
                &#8592; Retour &#224; la connexion
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
