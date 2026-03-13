"use client";
import { BookOpen, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile with display name
      await updateProfile(user, { displayName: name });

      // 3. Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        createdAt: new Date().toISOString(),
        learningGoals: [],
        xp: 0,
        streak: 0
      });

      toast.success(`Welcome to FlexiStudy, ${name}!`);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || "New Learner",
          email: user.email,
          createdAt: new Date().toISOString(),
          learningGoals: [],
          xp: 0,
          streak: 0,
          photoURL: user.photoURL
        });
      }

      toast.success(`Welcome, ${user.displayName || "Learner"}!`);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-root {
          min-height: 100vh;
          background: var(--bg-page, #FAF8F4);
          display: flex;
          font-family: var(--font-body, 'Inter', sans-serif);
          overflow: hidden;
        }

        /* ── Left panel ── */
        .left-panel {
          display: none;
          width: 48%;
          position: relative;
          background: var(--bg-dark, #1C1F27);
          overflow: hidden;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }
        @media (min-width: 900px) { .left-panel { display: flex; } }

        .left-panel::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
        }
        .blob-1 { width: 380px; height: 380px; background: rgba(61,139,113,0.22); top: -60px; left: -60px; }
        .blob-2 { width: 260px; height: 260px; background: rgba(86,201,154,0.14); bottom: 60px; right: -40px; }
        .blob-3 { width: 160px; height: 160px; background: rgba(61,139,113,0.10); top: 50%; left: 55%; }

        .left-logo {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1;
        }
        .left-logo-icon {
          width: 38px; height: 38px;
          border-radius: var(--radius-sm, 8px);
          background: var(--brand-primary, #3D8B71);
          display: flex; align-items: center; justify-content: center;
        }
        .left-logo-text {
          font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
          font-size: 20px; font-weight: 700;
          color: #fff; letter-spacing: -0.3px;
        }

        .hero-copy { position: relative; z-index: 1; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--brand-primary, #3D8B71);
          margin-bottom: 20px;
        }
        .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-primary, #3D8B71); }

        .hero-copy h2 {
          font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 16px;
        }
        .hero-copy h2 span { color: var(--brand-primary, #3D8B71); }
        .hero-copy p {
          color: rgba(255,255,255,0.45);
          font-size: 15px; line-height: 1.7; max-width: 340px;
        }

        .stat-row { display: flex; gap: 36px; position: relative; z-index: 1; }
        .stat-num {
          font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
          font-size: 28px; font-weight: 800; color: #fff; line-height: 1;
        }
        .stat-num em { color: var(--brand-primary, #3D8B71); font-style: normal; }
        .stat-label {
          font-size: 11px; color: rgba(255,255,255,0.35);
          margin-top: 5px; font-weight: 600;
          letter-spacing: 0.5px; text-transform: uppercase;
        }

        /* ── Right panel ── */
        .right-panel {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 24px;
          background: var(--bg-page, #FAF8F4);
          position: relative;
          overflow: hidden;
        }

        .right-panel::before {
          content: '';
          position: absolute; top: -100px; right: -100px;
          width: 300px; height: 300px; border-radius: 50%;
          border: 48px solid var(--brand-primary-light, #EAF5F1);
          pointer-events: none;
        }
        .right-panel::after {
          content: '';
          position: absolute; bottom: -60px; left: -60px;
          width: 180px; height: 180px; border-radius: 50%;
          border: 28px solid var(--border-subtle, #F0EDE7);
          pointer-events: none;
        }

        .mobile-logo {
          display: flex; align-items: center; gap: 10px;
          position: absolute; top: 24px; left: 24px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo-icon {
          width: 32px; height: 32px;
          border-radius: var(--radius-sm, 8px);
          background: var(--brand-primary, #3D8B71);
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo-text {
          font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
          font-size: 17px; font-weight: 700;
          color: var(--text-primary, #1C1F27);
        }

        .form-card { width: 100%; max-width: 400px; position: relative; z-index: 1; }

        .form-header { margin-bottom: 32px; }
        .form-header h1 {
          font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
          font-size: 28px; font-weight: 800;
          color: var(--text-primary, #1C1F27);
          letter-spacing: -0.4px; line-height: 1.2;
          margin-bottom: 8px;
        }
        .form-header p { color: var(--text-secondary, #5C6070); font-size: 14px; line-height: 1.6; }

        .btn-google {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 20px;
          background: var(--bg-surface, #fff);
          border: 1.5px solid var(--border-strong, #C8C3BA);
          border-radius: var(--radius-md, 12px);
          color: var(--text-primary, #1C1F27);
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast, 150ms cubic-bezier(0.4,0,0.2,1));
          font-family: var(--font-body, 'Inter', sans-serif);
        }
        .btn-google:hover {
          border-color: var(--brand-primary, #3D8B71);
          color: var(--brand-primary, #3D8B71);
          background: var(--brand-primary-light, #EAF5F1);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .btn-google:active { transform: translateY(0); }

        .divider-row { display: flex; align-items: center; gap: 14px; margin: 22px 0; }
        .divider-line { flex: 1; height: 1px; background: var(--border-default, #E8E4DC); }
        .divider-text {
          font-size: 11px; font-weight: 700;
          color: var(--text-muted, #9DA3B0);
          text-transform: uppercase; letter-spacing: 1.2px;
        }

        .field { display: flex; flex-direction: column; gap: 7px; }
        .field + .field { margin-top: 16px; }
        .field-label {
          font-size: 12px; font-weight: 700;
          color: var(--text-primary, #1C1F27);
          letter-spacing: 0.2px;
          display: flex; justify-content: space-between; align-items: center;
        }

        .field-input {
          width: 100%; padding: 11px 14px;
          background: var(--bg-surface, #fff);
          border: 1.5px solid var(--border-default, #E8E4DC);
          border-radius: var(--radius-md, 12px);
          color: var(--text-primary, #1C1F27);
          font-size: 14px;
          font-family: var(--font-body, 'Inter', sans-serif);
          outline: none;
          transition: all var(--transition-fast, 150ms cubic-bezier(0.4,0,0.2,1));
          box-shadow: var(--shadow-sm);
        }
        .field-input::placeholder { color: var(--text-muted, #9DA3B0); }
        .field-input:hover { border-color: var(--border-strong, #C8C3BA); }
        .field-input:focus {
          border-color: var(--brand-primary, #3D8B71);
          box-shadow: 0 0 0 3px rgba(61,139,113,0.12);
        }

        .btn-submit {
          width: 100%; margin-top: 28px;
          padding: 13px 24px;
          background: var(--brand-primary, #3D8B71);
          border: none; border-radius: var(--radius-md, 12px);
          color: #fff;
          font-size: 15px; font-weight: 700;
          font-family: var(--font-body, 'Inter', sans-serif);
          cursor: pointer;
          box-shadow: var(--shadow-brand, 0 4px 16px rgba(61,139,113,0.25));
          transition: all var(--transition-fast, 150ms cubic-bezier(0.4,0,0.2,1));
          position: relative; overflow: hidden;
        }
        .btn-submit::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.10), transparent);
          pointer-events: none;
        }
        .btn-submit:hover:not(:disabled) {
          background: var(--brand-primary-dark, #2E6B57);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(61,139,113,0.35);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .signup-row {
          margin-top: 28px; text-align: center;
          font-size: 13px; color: var(--text-secondary, #5C6070);
        }
        .signup-row a { color: var(--brand-primary, #3D8B71); font-weight: 600; text-decoration: none; }
        .signup-row a:hover { color: var(--brand-primary-dark, #2E6B57); text-decoration: underline; }

        .trust-strip {
          display: flex; align-items: center; justify-content: center; gap: 20px;
          margin-top: 28px; padding-top: 24px;
          border-top: 1px solid var(--border-subtle, #F0EDE7);
        }
        .trust-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          color: var(--text-muted, #9DA3B0);
        }
        .trust-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--success, #2E9E6B); flex-shrink: 0; }
      `}</style>

      <div className="login-root">
        {/* ── Left panel ── */}
        <div className="left-panel">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />

          <div className="left-logo">
            <div className="left-logo-icon">
              <BookOpen size={18} color="#fff" />
            </div>
            <span className="left-logo-text">FlexiStudy</span>
          </div>

          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Adaptive Learning Platform
            </div>
            <h2>Start your<br /><span>journey here.</span></h2>
            <p>Join thousands of students mastering complex topics with ease. Your personal AI tutor is ready.</p>
          </div>

          <div className="stat-row">
            <div>
              <div className="stat-num">48<em>K+</em></div>
              <div className="stat-label">Learners</div>
            </div>
            <div>
              <div className="stat-num">200<em>+</em></div>
              <div className="stat-label">Courses</div>
            </div>
            <div>
              <div className="stat-num">94<em>%</em></div>
              <div className="stat-label">Pass Rate</div>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="right-panel">
          <div className="mobile-logo">
            <div className="mobile-logo-icon">
              <BookOpen size={16} color="#fff" />
            </div>
            <span className="mobile-logo-text">FlexiStudy</span>
          </div>

          <div className="form-card">
            <div className="form-header">
              <h1>Create an account ✨</h1>
              <p>Join FlexiStudy and start learning faster today.</p>
            </div>

            <button 
              type="button" 
              className="btn-google"
              onClick={handleGoogleLogin}
              disabled={isLoading || googleLoading}
            >
              {googleLoading ? <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--brand-primary)' }} /> : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27528 9.70498C6.21525 6.81002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.185 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                </svg>
              )}
              {googleLoading ? "Signing up..." : "Sign up with Google"}
            </button>

            <div className="divider-row">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSignup}>
              <div className="field">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Email address</label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="student@flexistudy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading
                  ? <><span className="spinner" />Creating account…</>
                  : "Create Account"}
              </button>
            </form>

            <p className="signup-row">
              Already have an account?{" "}
              <Link href="/login">Sign In</Link>
            </p>

            <div className="trust-strip">
              <div className="trust-item"><span className="trust-dot" />SSL Secured</div>
              <div className="trust-item"><span className="trust-dot" />Privacy focused</div>
              <div className="trust-item"><span className="trust-dot" />Free forever</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
