import React, { useState, useRef, FormEvent, KeyboardEvent, PointerEvent } from 'react';
import { message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from './Login.module.css';
import { Link } from 'react-router-dom';
import AsciiStars from './AsciiStars';
import logo from '../../assets/neurelogo.png';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [shaking, setShaking] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const fail = (msg: string) => {
    message.error(msg);
    // Restart the shake even if a previous one is still running.
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
  };

  // Manual form submission handler to avoid any React Router or form issues
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Explicitly prevent default form behavior
    if (loading) return;

    if (!username || !password) {
      fail('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      // Direct API call without using the service
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/login`,
        {
          email: username,
          password,
          role_id: 1,
        }
      );

      const data = response.data;

      if (data.status) {
        const { accessToken, refreshToken, expiresAt, user } = data.data;

        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('expiresAt', expiresAt);
        localStorage.setItem('userData', JSON.stringify(user));

        // Check if this is the first login (last_login is null)
        localStorage.setItem('isFirstLogin', user && user.last_login === null ? 'true' : 'false');

        setSuccess(true);
        message.success('Login successful!');

        // Force a hard navigation
        window.location.href = '/home';
      } else {
        fail(data.message || 'Login failed');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error message
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please try again.';

      fail(errorMsg);
      setLoading(false);
    }
  };

  // Moves a soft highlight under the cursor — transform only, so it never triggers layout.
  const handleCardPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = spotlightRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate3d(${e.clientX - rect.left}px, ${e.clientY - rect.top}px, 0)`;
    el.style.opacity = '1';
  };
  const handleCardPointerLeave = () => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
  };

  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.aurora} aria-hidden="true">
        <span className={styles.blobA} />
        <span className={styles.blobB} />
        <span className={styles.blobC} />
      </div>
      <AsciiStars className={styles.stars} />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.cardWrap}>
        <div
          className={`${styles.card} ${shaking ? styles.shake : ''}`}
          onAnimationEnd={(e) => { if (e.target === e.currentTarget) setShaking(false); }}
          onPointerMove={handleCardPointerMove}
          onPointerLeave={handleCardPointerLeave}
        >
          <div ref={spotlightRef} className={styles.spotlight} aria-hidden="true" />

          <div className={styles.brand}>
            <span className={styles.logoRing}>
              <img src={logo} alt="" className={styles.logo} />
            </span>
            <span className={styles.brandName}>Neure</span>
            <span className={styles.brandTag}>Superadmin</span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to manage the Neure platform</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <label className={styles.field}>
              <UserOutlined className={styles.fieldIcon} />
              <input
                className={styles.input}
                type="email"
                autoComplete="username"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <span className={styles.floatLabel}>Email</span>
            </label>

            <label className={styles.field}>
              <LockOutlined className={styles.fieldIcon} />
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={checkCaps}
                onKeyUp={checkCaps}
                onBlur={() => setCapsLock(false)}
              />
              <span className={styles.floatLabel}>Password</span>
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span key={String(showPassword)} className={styles.eyeIcon}>
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              </button>
            </label>

            <div className={styles.row}>
              <span className={`${styles.caps} ${capsLock ? styles.capsOn : ''}`}>Caps Lock is on</span>
              <Link to="/forgot-password" className={styles.link}>Forgot password?</Link>
            </div>

            <button
              type="submit"
              className={`${styles.submit} ${loading ? styles.loading : ''} ${success ? styles.success : ''}`}
              disabled={loading}
            >
              <span className={styles.shine} aria-hidden="true" />
              <span className={styles.submitLabel}>
                {success ? 'Welcome' : 'Sign in'}
                <ArrowRightOutlined className={styles.arrow} />
              </span>
              <span className={styles.spinner} aria-hidden="true" />
            </button>
          </form>
        </div>

        <p className={styles.footer}>
          <span className={styles.footerStar}>✦</span> Secured superadmin access
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
