"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { apiClient, auth } from "../../utils/api";
import { signInWithGoogle, signInWithGooglePopup, getGoogleRedirectResult } from "../../utils/firebase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.login({
        email,
        password
      });      if (response.success && response.data) {
        // Store tokens
        auth.setTokens(response.data.token, response.data.refreshToken);
        
        // Redirect to dashboard using Next.js router
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Try popup method first (more reliable for development)
      console.log('Attempting Google popup sign-in...');
      const result = await signInWithGooglePopup();
      
      if (result && result.idToken) {
        console.log('Popup sign-in successful, calling backend...', {
          idTokenLength: result.idToken ? result.idToken.length : 0,
          email: result.email,
          username: result.username
        });
        
        try {
          const response = await apiClient.googleAuth({
            idToken: result.idToken,
            email: result.email || '',
            username: result.username || '',
            avatar: result.avatar || undefined
          });

          if (response.success && response.data) {
            console.log('Backend auth successful, storing tokens...');
            auth.setTokens(response.data.token, response.data.refreshToken);
            console.log('Redirecting to dashboard...');
            
            // Force a hard redirect to dashboard instead of using the Next.js router
            window.location.href = '/dashboard';
            return; // Exit early
          } else {
            console.error('Authentication failed:', response);
            setError(`Authentication failed: ${response.message || 'Unknown error'}`);
          }
        } catch (apiError: any) {
          console.error('API call failed:', apiError);
          setError(`API error: ${apiError.message || 'Failed to connect to server'}`);
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // If popup fails (e.g., popup blocked), fall back to redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log('Popup failed, trying redirect method...');
        try {
          await signInWithGoogle();
          // Don't set loading to false here as redirect will reload the page
          return;
        } catch (redirectError) {
          console.error('Redirect method also failed:', redirectError);
          setError("Error signing in with Google. Please try again.");
        }
      } else {
        setError(`Error signing in with Google: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Login page: Checking redirect result');
        setLoading(true);
        const result = await getGoogleRedirectResult();
        console.log('Login page: Got result:', result ? 'success' : 'no result');
          if (result && result.idToken) {
          console.log('Login page: Calling googleAuth API');
          const response = await apiClient.googleAuth({
            idToken: result.idToken,
            email: result.email || '',
            username: result.username || '',
            avatar: result.avatar || undefined
          });          if (response.success && response.data) {
            console.log('Login page: Auth successful, storing tokens');
            auth.setTokens(response.data.token, response.data.refreshToken);
            console.log('Login page: Redirecting to dashboard');
            // Force a hard redirect to dashboard instead of using the Next.js router
            window.location.href = '/dashboard';
            return; // Exit early to avoid setting loading to false
          }else {
            setError("Authentication failed. Please try again.");
          }
        }
      } catch (error) {
        console.error('Login page: Google auth error:', error);
        setError("Error authenticating with Google. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <h1 className={styles.logo}>Launchit</h1>
          </Link>
          <h2 className={styles.title}>Log in to your account</h2>
          <p className={styles.subtitle}>Welcome back! Please enter your details.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <div className={styles.options}>
            <div className={styles.rememberMe}>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>OR</span>
        </div>
        
        <button 
          type="button" 
          className={styles.googleButton}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          <span>Sign in with Google</span>
        </button>
        
        <div className={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link href="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
