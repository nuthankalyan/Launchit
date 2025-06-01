"use client";

import { useState, useEffect } from "react";
import { signInWithGoogle, getGoogleRedirectResult } from "../../utils/firebase";
import { apiClient, auth } from "../../utils/api";

export default function TestAuth() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const checkRedirectResult = async () => {
      addLog("Component mounted, checking for redirect result...");
      try {
        const result = await getGoogleRedirectResult();
        if (result) {
          addLog(`Got redirect result: ${JSON.stringify({
            hasIdToken: !!result.idToken,
            email: result.email,
            username: result.username
          })}`);
          
          if (result.idToken) {
            addLog("Attempting to authenticate with backend...");
            const response = await apiClient.googleAuth({
              idToken: result.idToken,
              email: result.email!,
              username: result.username!,
              avatar: result.avatar || undefined
            });              if (response.success && response.data) {
              addLog("Backend authentication successful!");
              auth.setTokens(response.data.token, response.data.refreshToken);
              addLog("Tokens stored successfully, redirecting to dashboard...");
              window.location.href = '/dashboard';
            } else {
              addLog(`Backend authentication failed: ${response.message}`);
            }
          } else {
            addLog("No ID token in result");
          }
        } else {
          addLog("No redirect result found");
        }
      } catch (error: any) {
        addLog(`Error: ${error.message}`);
      }
    };

    checkRedirectResult();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    addLog("Starting Google sign-in...");
    try {
      await signInWithGoogle();
      addLog("Google sign-in initiated (should redirect now)");
    } catch (error: any) {
      addLog(`Google sign-in error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Google Auth Test</h1>
      
      <button 
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{ 
          padding: "10px 20px", 
          marginBottom: "20px",
          backgroundColor: "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>

      <div>
        <h2>Auth Status</h2>
        <p>Is Authenticated: {auth.isAuthenticated() ? "Yes" : "No"}</p>
        <p>Has Token: {auth.getToken() ? "Yes" : "No"}</p>
      </div>

      <div>
        <h2>Logs</h2>
        <div style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "10px", 
          height: "300px", 
          overflowY: "scroll",
          fontSize: "12px"
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
