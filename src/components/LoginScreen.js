import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye, LogIn, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import loginBg from '../assets/imagecopy.png';
import logo from '../assets/image.png';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [winWidth, setWinWidth] = useState(window.innerWidth);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request, 2 = Verify/Reset, 3 = Success
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,10}$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/password/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      if (res.ok) {
        setForgotSuccess('Security OTP has been dispatched to your email/terminal.');
        setForgotStep(2);
      } else {
        const errData = await res.json().catch(() => ({}));
        setForgotError(errData.message || 'OTP dispatch failed. Make sure email exists.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotOtp.trim().length !== 6) {
      setForgotError('OTP must be exactly 6 digits.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim()
        })
      });
      if (res.ok) {
        setForgotSuccess('OTP verified successfully!');
        setForgotStep(3); // Move to password update
      } else {
        const errData = await res.json().catch(() => ({}));
        setForgotError(errData.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/password/reset-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
          logoutAllDevices: true
        })
      });
      if (res.ok) {
        setForgotSuccess('Password reset successfully! You can now log in.');
        setForgotStep(4);
      } else {
        const errData = await res.json().catch(() => ({}));
        setForgotError(errData.message || 'Error updating password.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  React.useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // TLD must be 2–10 letters only (e.g. .com .net .in .yahoo .online)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,10}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  const s = {
    container: {
      height: '100vh',
      width: '100vw',
      backgroundImage: `url(${loginBg})`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: winWidth > 768 ? 'flex-end' : 'center',
      paddingRight: winWidth > 768 ? '10%' : '0',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: winWidth < 768 ? '30px' : '40px',
      padding: winWidth < 768 ? '25px 20px' : '40px',
      width: winWidth < 768 ? '88%' : '100%',
      maxWidth: '440px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    logo: {
      width: winWidth < 768 ? '140px' : '190px',
      height: winWidth < 768 ? '105px' : '145px',
      marginBottom: winWidth < 768 ? '5px' : '2px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '900',
      color: '#0B1E3F',
      marginBottom: '5px',
      marginTop: '-5px'
    },
    tagline: {
      fontSize: '11px',
      fontWeight: '800',
      color: '#315A9E',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: winWidth < 768 ? '20px' : '35px'
    },
    inputGroup: {
      width: '100%',
      marginBottom: winWidth < 768 ? '15px' : '20px'
    },
    label: {
      fontSize: '10px',
      fontWeight: '800',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px',
      display: 'block'
    },
    inputWrapper: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      padding: '12px 18px',
      border: '1.5px solid #f1f5f9',
      transition: 'border-color 0.2s'
    },
    input: {
      flex: 1,
      border: 'none',
      backgroundColor: 'transparent',
      padding: '5px 10px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      outline: 'none'
    },
    btn: {
      width: '100%',
      backgroundColor: '#0B1E3F',
      color: 'white',
      border: 'none',
      padding: '16px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '800',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '10px',
      boxShadow: '0 10px 25px -5px rgba(11, 30, 63, 0.4)',
      transition: 'transform 0.2s, opacity 0.2s'
    },
    tipBox: {
      marginTop: winWidth < 768 ? '20px' : '30px',
      backgroundColor: '#f0f9ff',
      padding: winWidth < 768 ? '12px' : '15px',
      borderRadius: '16px',
      border: '1px solid #e0f2fe',
      display: 'flex',
      gap: '12px'
    },
    tipText: {
      fontSize: '11px',
      color: '#0369a1',
      fontWeight: '600',
      lineHeight: '1.5'
    },
    error: {
      color: '#ef4444',
      fontSize: '12px',
      fontWeight: '700',
      marginBottom: '15px',
      textAlign: 'center'
    }
  };

  return (
    <div style={s.container}>
      <form style={s.card} onSubmit={handleSubmit}>
        <img src={logo} alt="NBT Hub Logo" style={s.logo} />
        <h1 style={s.title}>NBT HUB </h1>
        <div style={s.tagline}>Smarter Solutions for Better Future</div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.inputGroup}>
          <label style={s.label}>Official Identity (Email) <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{ ...s.inputWrapper, border: emailError ? '1.5px solid #ef4444' : '1.5px solid #f1f5f9' }}>
            <Mail size={18} color={emailError ? "#ef4444" : "#94a3b8"} />
            <input
              style={s.input}
              type="text"
              placeholder="Enter a Valid Email Adress"
              value={email}
              onChange={(e) => {
                // Strip spaces in real-time — don't allow space characters
                const sanitized = e.target.value.replace(/\s/g, '');
                setEmail(sanitized);
                if (emailError && /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,10}$/.test(sanitized)) {
                  setEmailError('');
                }
              }}
              onBlur={() => {
                // Validate format when user leaves the field
                if (email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,10}$/.test(email.trim())) {
                  setEmailError('Please enter a valid email address.');
                } else {
                  setEmailError('');
                }
              }}
              required
            />
          </div>
          {emailError && <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: '600', marginTop: '5px' }}>{emailError}</div>}
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Identity Passkey <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={s.inputWrapper}>
            <Lock size={18} color="#94a3b8" />
            <input
              style={s.input}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && (
              <div
                style={{ cursor: 'pointer', display: 'flex' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <span
              onClick={() => {
                setForgotEmail(email);
                setForgotStep(1);
                setForgotOtp('');
                setForgotNewPassword('');
                setForgotConfirmPassword('');
                setForgotError('');
                setForgotSuccess('');
                setShowForgotModal(true);
              }}
              style={{ fontSize: '11px', fontWeight: '850', color: '#315A9E', cursor: 'pointer', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0B1E3F'}
              onMouseLeave={e => e.currentTarget.style.color = '#315A9E'}
            >
              Forgot Password?
            </span>
          </div>
        </div>

        <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
          {loading ? 'Logging in...' : <><LogIn size={18} /> Login</>}
        </button>

        <div style={s.tipBox}>
          <Info size={24} color="#0ea5e9" />
          <div style={s.tipText}>
            <strong>Identity Tip:</strong> Login access is restricted to verified employees only. Roles are identified by authentication tokens.
          </div>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 30, 63, 0.4)', backdropFilter: 'blur(10px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '32px', padding: '35px',
            maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', position: 'relative'
          }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#f0f9ff', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔑</div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#0B1E3F', margin: 0, letterSpacing: '-0.5px' }}>Forgot Password</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0', fontWeight: '500' }}>
                  {forgotStep === 1 ? 'Request a security OTP via email' : forgotStep === 2 ? 'Enter the security OTP to verify' : forgotStep === 3 ? 'Set your new passkey' : 'Security credentials updated'}
                </p>
              </div>
            </div>

            {forgotError && (
              <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '750', marginBottom: '15px', textAlign: 'center' }}>
                {forgotError}
              </div>
            )}

            {forgotSuccess && forgotStep !== 4 && (
              <div style={{ color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '750', marginBottom: '15px', textAlign: 'center' }}>
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Official Identity (Email) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={s.inputWrapper}>
                    <Mail size={18} color="#94a3b8" />
                    <input
                      style={s.input}
                      type="text"
                      placeholder="Enter a Valid Email Address"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value.replace(/\s/g, ''))}
                      required
                    />
                  </div>
                </div>
                <button style={{ ...s.btn, opacity: forgotLoading ? 0.7 : 1 }} type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Requesting OTP...' : 'Get OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Security OTP (Terminal) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={s.inputWrapper}>
                    <Lock size={18} color="#94a3b8" />
                    <input
                      style={s.input}
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <button style={{ ...s.btn, opacity: forgotLoading ? 0.7 : 1 }} type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={s.inputGroup}>
                  <label style={s.label}>New Passkey <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={s.inputWrapper}>
                    <Lock size={18} color="#94a3b8" />
                    <input
                      style={s.input}
                      type={showForgotNewPass ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={forgotNewPassword}
                      onChange={e => setForgotNewPassword(e.target.value)}
                      required
                    />
                    {forgotNewPassword.length > 0 && (
                      <div style={{ cursor: 'pointer', display: 'flex' }} onClick={() => setShowForgotNewPass(!showForgotNewPass)}>
                        {showForgotNewPass ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
                      </div>
                    )}
                  </div>
                </div>

                <div style={s.inputGroup}>
                  <label style={s.label}>Confirm New Passkey <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={s.inputWrapper}>
                    <Lock size={18} color="#94a3b8" />
                    <input
                      style={s.input}
                      type={showForgotConfirmPass ? "text" : "password"}
                      placeholder="Repeat new passkey"
                      value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      required
                    />
                    {forgotConfirmPassword.length > 0 && (
                      <div style={{ cursor: 'pointer', display: 'flex' }} onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}>
                        {showForgotConfirmPass ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
                      </div>
                    )}
                  </div>
                </div>

                <button style={{ ...s.btn, opacity: forgotLoading ? 0.7 : 1 }} type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}

            {forgotStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>✓</div>
                <div style={{ color: '#16a34a', fontSize: '13px', fontWeight: '800', textAlign: 'center' }}>
                  {forgotSuccess}
                </div>
                <button
                  style={s.btn}
                  onClick={() => {
                    setShowForgotModal(false);
                    setPassword('');
                  }}
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

