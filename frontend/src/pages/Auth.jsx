import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.02 10.02 0 001 12c0 1.61.39 3.14 1.07 4.5l3.77-2.41z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { user, login, signup, loginWithGoogle } = useAuth();
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Detect OAuth error from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error === 'google_failed') {
      setErrorMsg('Google sign-in failed. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        await login(email, password);
        setSuccessMsg('Welcome back!');
      } else {
        await signup(name, email, password);
        setSuccessMsg('Account created!');
      }
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: isDark
        ? 'radial-gradient(ellipse at 50% 0%, rgba(255,102,0,0.06), transparent 60%), var(--bg-dark)'
        : 'radial-gradient(ellipse at 50% 0%, rgba(255,102,0,0.04), transparent 60%), var(--bg-dark)',
    },
    card: {
      width: '100%',
      maxWidth: 440,
      background: isDark ? 'rgba(12,12,26,0.92)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 20,
      border: `1px solid ${isDark ? 'rgba(255,102,0,0.12)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: isDark
        ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset'
        : '0 24px 64px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset',
      overflow: 'hidden',
    },
    topStripe: {
      height: 4,
      background: 'linear-gradient(90deg, #FF9933 33.3%, #fff 33.3% 66.6%, #138808 66.6%)',
    },
    body: {
      padding: '2rem 2rem 1.5rem',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    logoText: {
      fontFamily: 'var(--font-display)',
      fontSize: 28,
      color: 'var(--saffron)',
      lineHeight: 1,
      margin: 0,
    },
    subtitle: {
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginTop: 4,
    },
    heading: {
      fontFamily: 'var(--font-ui)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text-primary)',
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    oauthSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: '1.25rem',
    },
    oauthBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '0.7rem 1rem',
      borderRadius: 12,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-ui)',
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '1.25rem 0',
      color: 'var(--text-muted)',
      fontSize: 12,
      fontFamily: 'var(--font-ui)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    dividerLine: {
      flex: 1,
      height: 1,
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    },
    inputGroup: {
      marginBottom: '0.9rem',
    },
    label: {
      display: 'block',
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      marginBottom: 6,
      letterSpacing: '0.05em',
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '0.7rem 1rem',
      borderRadius: 10,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
    },
    inputFocus: {
      borderColor: 'var(--saffron)',
      boxShadow: '0 0 0 3px rgba(255,102,0,0.12)',
    },
    eyeBtn: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      padding: 4,
    },
    submitBtn: {
      width: '100%',
      padding: '0.8rem',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #FF6600, #cc4400)',
      color: '#fff',
      fontFamily: 'var(--font-ui)',
      fontWeight: 700,
      fontSize: 15,
      letterSpacing: '0.05em',
      cursor: 'pointer',
      marginTop: '0.5rem',
      transition: 'all 0.2s',
      boxShadow: '0 4px 16px rgba(255,102,0,0.3)',
    },
    switchText: {
      textAlign: 'center',
      marginTop: '1.25rem',
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      color: 'var(--text-muted)',
    },
    switchLink: {
      color: 'var(--saffron)',
      cursor: 'pointer',
      fontWeight: 700,
      background: 'none',
      border: 'none',
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      textDecoration: 'underline',
      textUnderlineOffset: 2,
    },
    toast: (type) => ({
      padding: '0.6rem 1rem',
      borderRadius: 10,
      marginBottom: '1rem',
      fontSize: 13,
      fontFamily: 'var(--font-ui)',
      fontWeight: 600,
      textAlign: 'center',
      background: type === 'error'
        ? 'rgba(239,68,68,0.1)'
        : 'rgba(34,197,94,0.1)',
      color: type === 'error' ? '#f87171' : '#4ade80',
      border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={s.page}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={s.card}
      >
        {/* Tricolor stripe */}
        <div style={s.topStripe} />

        <div style={s.body}>
          {/* Logo */}
          <div style={s.logo}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 18 }}>
                <div style={{ height: 4, borderRadius: 3, background: '#FF9933' }} />
                <div style={{ height: 4, borderRadius: 3, background: isDark ? '#fff' : '#999' }} />
                <div style={{ height: 4, borderRadius: 3, background: '#138808' }} />
              </div>
              <h2 style={s.logoText}>Bharat Monitor</h2>
            </div>
            <p style={s.subtitle}>India's Live Intelligence Hub</p>
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.h3
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={s.heading}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </motion.h3>
          </AnimatePresence>

          {/* Toast Messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={s.toast('error')}
              >
                {errorMsg}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={s.toast('success')}
              >
                ✓ {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* OAuth Buttons */}
          <div style={s.oauthSection}>
            <motion.button
              whileHover={{ scale: 1.02, borderColor: 'rgba(66,133,244,0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={s.oauthBtn}
              onClick={loginWithGoogle}
              type="button"
              id="auth-google-btn"
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>
          </div>

          {/* Divider */}
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span>or continue with email</span>
            <div style={s.dividerLine} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={s.inputGroup}>
                    <label style={s.label} htmlFor="auth-name">Full Name</label>
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required={!isLogin}
                      style={s.input}
                      onFocus={(e) => Object.assign(e.target.style, s.inputFocus)}
                      onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={s.inputGroup}>
              <label style={s.label} htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={s.input}
                onFocus={(e) => Object.assign(e.target.style, s.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
            </div>

            <div style={s.inputGroup}>
              <label style={s.label} htmlFor="auth-password">Password</label>
              <div style={s.inputWrapper}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'}
                  required
                  minLength={isLogin ? undefined : 6}
                  style={{ ...s.input, paddingRight: 44 }}
                  onFocus={(e) => Object.assign(e.target.style, s.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                />
                <button
                  type="button"
                  style={s.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.02, boxShadow: '0 8px 24px rgba(255,102,0,0.45)' } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              style={{
                ...s.submitBtn,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
              id="auth-submit-btn"
            >
              {submitting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block' }}
                >
                  ⏳
                </motion.span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          {/* Switch mode */}
          <p style={s.switchText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              style={s.switchLink}
              id="auth-switch-mode"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
