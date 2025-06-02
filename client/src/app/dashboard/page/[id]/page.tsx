"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, apiClient } from "../../../../utils/api";
import styles from "./page.module.css";

interface LaunchPage {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tagline?: string;
  htmlContent: string;
  status: 'generating' | 'generated' | 'error';
  publishSlug?: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LaunchPageView() {
  const params = useParams();
  const router = useRouter();
  const [launchPage, setLaunchPage] = useState<LaunchPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState("");
  const [publishError, setPublishError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Animation for generating messages
  const generatingMessages = [
    "Creating",
    "Crafting",
    "Optimizing",
    "Setting up"
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pageId = params.id as string;

  useEffect(() => {
    const fetchLaunchPage = async () => {
      if (!auth.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const response = await apiClient.getLaunchPage(pageId);
        if (response.success && response.data) {
          setLaunchPage(response.data);
          
          // If page is still generating, poll for updates
          if (response.data.status === 'generating') {
            setIsGenerating(true);
            pollForUpdates();
          }
        } else {
          setError("Launch page not found");
        }
      } catch (error: any) {
        setError("Failed to load launch page");
        console.error("Error fetching launch page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchPage();
  }, [pageId, router]);
  useEffect(() => {
    // Setup message animation when generating
    if (isGenerating || (launchPage && launchPage.status === 'generating')) {
      // Clear any existing interval
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
      
      // Set up new animation interval
      messageIntervalRef.current = setInterval(() => {
        setMessageVisible(false); // Fade out current message
        
        setTimeout(() => {
          // Change message and fade in
          setCurrentMessageIndex(prevIndex => 
            prevIndex === generatingMessages.length - 1 ? 0 : prevIndex + 1
          );
          setMessageVisible(true);
        }, 500); // After fade out completes
        
      }, 3000); // Change message every 3 seconds
    } else {
      // Clear interval when not generating
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }
    
    // Cleanup interval on component unmount
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [isGenerating, launchPage?.status]);

  const pollForUpdates = async () => {
    const maxAttempts = 30; // 30 attempts = 1.5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await apiClient.getLaunchPage(pageId);
        if (response.success && response.data) {
          setLaunchPage(response.data);
          
          if (response.data.status !== 'generating') {
            setIsGenerating(false);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000); // Poll every 3 seconds
          } else {
            setIsGenerating(false);
            setError("Generation is taking longer than expected. Please refresh the page.");
          }
        }
      } catch (error) {
        console.error("Error polling for updates:", error);
        setIsGenerating(false);
      }
    };

    poll();
  };

  const handleRegenerate = async () => {
    if (!launchPage) return;

    try {
      setIsGenerating(true);
      const response = await apiClient.regenerateLaunchPage(launchPage.id);
      
      if (response.success) {
        setLaunchPage(response.data);
        pollForUpdates();
      } else {
        setError("Failed to regenerate launch page");
        setIsGenerating(false);
      }
    } catch (error: any) {
      setError("Failed to regenerate launch page");
      setIsGenerating(false);
      console.error("Error regenerating launch page:", error);
    }
  };

  const handlePublish = async () => {
    if (!launchPage || !publishSlug.trim()) return;
    
    try {
      setIsPublishing(true);
      setPublishError("");
      
      const response = await apiClient.publishLaunchPage(launchPage.id, publishSlug.trim());
      
      if (response.success && response.data) {
        // Update the launch page data with the published info
        setLaunchPage(response.data);
        setShowPublishModal(false);
        
        // Optional: Show a success message
        alert(`Your page has been published! You can access it at: ${apiClient.getPublishedPageUrl(response.data.publishSlug)}`);
      } else {
        setPublishError(response.message || "Failed to publish page");
      }
    } catch (error: any) {
      console.error("Error publishing page:", error);
      setPublishError(error.message || "Failed to publish page");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  const getPreviewUrl = () => {
    if (!launchPage) return "";
    return apiClient.getLaunchPagePreviewUrl(launchPage.id);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your launch page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={handleGoBack} className={styles.backButton}>
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!launchPage) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Page Not Found</h1>
          <p>The launch page you're looking for doesn't exist.</p>
          <button onClick={handleGoBack} className={styles.backButton}>
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>      <header className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          back to dashboard
        </button>        <h1 className={styles.pageTitle}>{launchPage.name || "Title"}</h1>
        {launchPage.status === 'generated' && (
          <div className={styles.headerActions}>
            <a 
              href={getPreviewUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.openTabButton}
            >
              open in new tab
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon}>
                <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            
            {!launchPage.isPublished ? (
              <button
                onClick={() => {
                  // Create a default slug from the page name
                  setPublishSlug(launchPage.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                  setShowPublishModal(true);
                }}
                className={styles.publishButton}
              >
                Publish
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon}>
                  <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7H16.5C17.4283 7 18.3185 6.63125 18.9749 5.97487C19.6313 5.3185 20 4.42826 20 3.5C20 2.57174 19.6313 1.6815 18.9749 1.02513C18.3185 0.368749 17.4283 0 16.5 0C12 0 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>            ) : (
                <a 
                  href={apiClient.getPublishedPageUrl(launchPage.publishSlug || '')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.viewPublishedButton}
                >
                  View Published
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon}>
                    <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
            )}
          </div>
        )}
      </header>      <main className={styles.main}>
        {isGenerating || launchPage.status === 'generating' ? (
          <div className={styles.previewContainer}>
            <div className={styles.generatingMessage}>
              <div className={`${styles.message} ${messageVisible ? styles.visible : styles.hidden}`}>
                {generatingMessages[currentMessageIndex]}
              </div>
            </div>
          </div>
        ) : launchPage.status === 'error' ? (
          <div className={styles.errorState}>
            <h2>Generation Failed</h2>
            <p>Sorry, we couldn't generate your launch page. Please try regenerating it.</p>
            <button onClick={handleRegenerate} className={styles.regenerateButton}>
              Try Again
            </button>
          </div>        ) : (
          <div className={styles.previewContainer}>
            <iframe
              src={getPreviewUrl()}
              title={`Preview of ${launchPage.name}`}
              className={styles.previewFrame}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </main>
      
      {/* Publish Modal */}
      {showPublishModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Publish Your Page</h2>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowPublishModal(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Choose a unique URL path for your published page:</p>              <div className={styles.urlPreview}>
                <span className={styles.urlBase}>localhost:3000/</span>
                <input
                  type="text"
                  value={publishSlug}
                  onChange={(e) => setPublishSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'))}
                  placeholder="your-site-name"
                  className={styles.slugInput}
                />
              </div>
              {publishError && (
                <div className={styles.errorMessage}>
                  {publishError}
                </div>
              )}
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowPublishModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.publishConfirmButton} 
                  onClick={handlePublish}
                  disabled={isPublishing || !publishSlug.trim()}
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
