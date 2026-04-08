import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

export default function Profile() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user.name) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: newName.trim() });
      setMsg({ text: 'Name updated!', type: 'success' });
      setEditingName(false);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setMsg({ text: 'Password changed successfully!', type: 'success' });
      setShowPwSection(false);
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Auto-clear message
  React.useEffect(() => {
    if (msg.text) {
      const t = setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const providerLabel = {
    local: '📧 Email & Password',
    google: '🔵 Google Account',
  };

  const s = {
    page: {
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '3rem 1rem',
    },
    container: {
      width: '100%',
      maxWidth: 580,
    },
    card: {
      background: isDark ? 'rgba(12,12,26,0.92)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 20,
      border: `1px solid ${isDark ? 'rgba(255,102,0,0.12)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: isDark
        ? '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)'
        : '0 24px 64px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    },
    topStripe: {
      height: 4,
      background: 'linear-gradient(90deg, #FF9933 33.3%, #fff 33.3% 66.6%, #138808 66.6%)',
    },
    body: {
      padding: '2rem',
    },
    avatarArea: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      marginBottom: '2rem',
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-ui)',
      fontWeight: 700,
      fontSize: 26,
      color: '#fff',
      background: 'linear-gradient(135deg, #FF6600, #cc4400)',
      boxShadow: '0 4px 20px rgba(255,102,0,0.3)',
      flexShrink: 0,
      overflow: 'hidden',
    },
    userName: {
      fontFamily: 'var(--font-ui)',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text-primary)',
      margin: 0,
      lineHeight: 1.2,
    },
    userEmail: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text-secondary)',
      margin: '2px 0 0 0',
    },
    section: {
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--saffron)',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderRadius: 12,
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
      marginBottom: '0.5rem',
    },
    infoLabel: {
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-muted)',
    },
    infoValue: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text-primary)',
      fontWeight: 500,
    },
    btn: {
      padding: '0.55rem 1.2rem',
      borderRadius: 10,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-ui)',
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    btnPrimary: {
      padding: '0.55rem 1.2rem',
      borderRadius: 10,
      border: 'none',
      background: 'linear-gradient(135deg, #FF6600, #cc4400)',
      color: '#fff',
      fontFamily: 'var(--font-ui)',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(255,102,0,0.25)',
    },
    btnDanger: {
      padding: '0.65rem 1.4rem',
      borderRadius: 12,
      border: '1px solid rgba(239,68,68,0.25)',
      background: 'rgba(239,68,68,0.08)',
      color: '#f87171',
      fontFamily: 'var(--font-ui)',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.2s',
    },
    input: {
      padding: '0.6rem 0.9rem',
      borderRadius: 10,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
    },
    toast: (type) => ({
      padding: '0.6rem 1rem',
      borderRadius: 10,
      marginBottom: '1rem',
      fontSize: 13,
      fontFamily: 'var(--font-ui)',
      fontWeight: 600,
      textAlign: 'center',
      background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      color: type === 'error' ? '#f87171' : '#4ade80',
      border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={s.page}
    >
      <div style={s.container}>
        {/* Toast */}
        <AnimatePresence>
          {msg.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={s.toast(msg.type)}
            >
              {msg.type === 'success' ? '✓ ' : '⚠ '}{msg.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <div style={s.card}>
          <div style={s.topStripe} />
          <div style={s.body}>
            {/* Avatar + Name */}
            <div style={s.avatarArea}>
              <div style={s.avatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div>
                {editingName ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      style={{ ...s.input, width: 200 }}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveName} disabled={saving} style={s.btnPrimary}>
                      {saving ? '...' : 'Save'}
                    </motion.button>
                    <button onClick={() => { setEditingName(false); setNewName(user.name); }} style={s.btn}>✕</button>
                  </div>
                ) : (
                  <>
                    <h2 style={s.userName}>
                      {user.name}
                      <button
                        onClick={() => setEditingName(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, fontSize: 14, color: 'var(--text-muted)' }}
                        title="Edit name"
                      >
                        ✏️
                      </button>
                    </h2>
                    <p style={s.userEmail}>{user.email}</p>
                  </>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div style={s.section}>
              <div style={s.sectionTitle}>
                <span style={{ fontSize: 14 }}>🔐</span>
                Account Details
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>Email</span>
                <span style={s.infoValue}>{user.email}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>Login Method</span>
                <span style={s.infoValue}>{providerLabel[user.provider] || user.provider}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>Member Since</span>
                <span style={s.infoValue}>{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>Last Login</span>
                <span style={s.infoValue}>{new Date(user.lastLogin).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Change Password (only for local users) */}
            {user.provider === 'local' && (
              <div style={s.section}>
                <div style={s.sectionTitle}>
                  <span style={{ fontSize: 14 }}>🔑</span>
                  Security
                </div>
                {!showPwSection ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPwSection(true)}
                    style={s.btn}
                  >
                    Change Password
                  </motion.button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleChangePw}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      required
                      style={s.input}
                    />
                    <input
                      type="password"
                      placeholder="New password (min 6 characters)"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      required
                      minLength={6}
                      style={s.input}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.95 }} style={s.btnPrimary}>
                        {saving ? 'Saving...' : 'Update Password'}
                      </motion.button>
                      <button type="button" onClick={() => { setShowPwSection(false); setCurrentPw(''); setNewPw(''); }} style={s.btn}>
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02, borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          style={s.btnDanger}
          id="profile-logout-btn"
        >
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
}
