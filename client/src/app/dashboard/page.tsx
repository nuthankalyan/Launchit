"use client";

import { useState, useEffect } from "react";
import { auth, apiClient } from "../../utils/api";
import styles from "./dashboard.module.css";

interface User {
  id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface LaunchPage {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tagline?: string;
  status: 'generating' | 'generated' | 'error';
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [launchPages, setLaunchPages] = useState<LaunchPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
    // Modal state
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTagline, setProjectTagline] = useState("");
    // Animation states
  const [firstModalAnimating, setFirstModalAnimating] = useState(false);
  const [secondModalAnimating, setSecondModalAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  // Helper functions for modal transitions
  const goToSecondModal = () => {
    if (projectName.trim()) {
      setAnimationDirection('forward');
      setFirstModalAnimating(true);
      
      setTimeout(() => {
        setShowFirstModal(false);
        setShowSecondModal(true);
        setFirstModalAnimating(false);
        // Trigger slide-in animation for second modal
        setTimeout(() => {
          setSecondModalAnimating(false);
        }, 50);
      }, 400);
    }
  };

  const goBackToFirstModal = () => {
    setAnimationDirection('backward');
    setSecondModalAnimating(true);
    
    setTimeout(() => {
      setShowSecondModal(false);
      setShowFirstModal(true);
      setSecondModalAnimating(false);
      // Trigger slide-in animation for first modal
      setTimeout(() => {
        setFirstModalAnimating(false);
      }, 50);
    }, 400);
  };
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.isAuthenticated()) {
        window.location.href = "/login";
        return;
      }

      try {
        const [profileResponse, pagesResponse] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getUserLaunchPages()
        ]);

        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data.user);
        }

        if (pagesResponse.success && pagesResponse.data) {
          setLaunchPages(pagesResponse.data);
        }
      } catch (error: any) {
        setError("Failed to load profile");
        // If token is invalid, redirect to login
        if (error.message.includes("Token")) {
          auth.clearTokens();
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      auth.clearTokens();
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }
  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Menu Toggle */}
      <button 
        className={styles.mobileMenuToggle}
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${sidebarExpanded ? styles.sidebarExpanded : ''}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className={styles.sidebarContent}>
          {/* Light/Dark theme toggle */}
          <div className={styles.sidebarItem}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </div>
            {sidebarExpanded && <span className={styles.sidebarLabel}>Theme</span>}
          </div>

          {/* Search */}
          <div className={styles.sidebarItem}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            {sidebarExpanded && <span className={styles.sidebarLabel}>Search</span>}
          </div>          {/* My creations */}
          <div className={`${styles.sidebarItem} ${styles.active}`}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            {sidebarExpanded && <span className={styles.sidebarLabel}>My creations</span>}
          </div>

          {/* Explore */}
          <div className={styles.sidebarItem}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
              </svg>
            </div>
            {sidebarExpanded && <span className={styles.sidebarLabel}>Explore</span>}
          </div>

          {/* Logout */}
          <div className={styles.sidebarItem} onClick={handleLogout}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            {sidebarExpanded && <span className={styles.sidebarLabel}>Logout</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.greeting}>
            Hello, {user?.username || 'User'}
          </h1>
          <div className={styles.userAvatar}>
            <div className={styles.avatarCircle}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>        {/* Content Grid */}
        <div className={styles.contentGrid}>          {/* Create new page card */}
          <div className={`${styles.card} ${styles.createCard}`} onClick={() => setShowFirstModal(true)}>
            <div className={styles.cardContent}>
              <div className={styles.addIcon}>+</div>
              <h3>Create new page</h3>
            </div>
          </div>          {/* Display user's launch pages */}
          {launchPages.map((page) => (
            <div 
              key={page.id} 
              className={`${styles.card} ${styles.launchPageCard}`}
              onClick={() => window.location.href = `/dashboard/page/${page.id}`}
            >
              <div className={styles.cardContent}>
                <div className={styles.pageHeader}>
                  <h3>{page.name}</h3>
                 
                </div>
                {page.description && (
                  <p className={styles.pageDescription}>{page.description}</p>
                )}
                {page.tagline && (
                  <p className={styles.pageTagline}>"{page.tagline}"</p>
                )}
                <div className={styles.pageFooter}>
                  <small>Created {new Date(page.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}

          {/* Show message if no pages */}
          
        </div>{/* First Modal: Project Name */}
        {showFirstModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Create new launch page</h2>
                <button 
                  className={styles.closeButton} 
                  onClick={() => setShowFirstModal(false)}
                  aria-label="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>              <div className={`${styles.modalContent} ${
                firstModalAnimating && animationDirection === 'forward' 
                  ? styles.modalContentSlideOutToLeft 
                  : firstModalAnimating && animationDirection === 'backward'
                  ? styles.modalContentSlideInFromRight
                  : ''
              }`}>
                <label className={styles.label} htmlFor="projectName">
                  project name
                </label>
                <input
                  type="text"
                  id="projectName"
                  className={styles.input}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={`${styles.modalActions} ${
                firstModalAnimating && animationDirection === 'forward' 
                  ? styles.modalContentSlideOutToLeft 
                  : firstModalAnimating && animationDirection === 'backward'
                  ? styles.modalContentSlideInFromRight
                  : ''
              }`}>
                <button 
                  className={styles.nextButton}
                  onClick={goToSecondModal}
                  disabled={!projectName.trim()}
                >
                  
                  <svg className={styles.nextButtonIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Second Modal: Project Description */}
        {showSecondModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Create new launch page</h2>
                <button 
                  className={styles.closeButton} 
                  onClick={() => setShowSecondModal(false)}
                  aria-label="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>              <div className={`${styles.modalContent} ${
                secondModalAnimating && animationDirection === 'backward' 
                  ? styles.modalContentSlideOutToRight 
                  : !secondModalAnimating ? styles.modalContentSlideInFromRight
                  : ''
              }`}>
                <div style={{ marginBottom: "24px" }}>
                  <label className={styles.label} htmlFor="projectDescription">
                    Project Description
                  </label>
                  <input
                    type="text"
                    id="projectDescription"
                    className={styles.input}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={styles.label} htmlFor="projectTagline">
                    Project Tagline
                  </label>
                  <input
                    type="text"
                    id="projectTagline"
                    className={styles.input}
                    value={projectTagline}
                    onChange={(e) => setProjectTagline(e.target.value)}
                  />
                </div>
              </div>              <div className={`${styles.modalActions} ${
                secondModalAnimating && animationDirection === 'backward' 
                  ? styles.modalContentSlideOutToRight 
                  : !secondModalAnimating ? styles.modalContentSlideInFromRight
                  : ''
              }`}>
                <button 
                  className={styles.backButton}
                  onClick={goBackToFirstModal}
                >
                  Back
                </button>                <button 
                  className={styles.generateButton}                  onClick={() => {
                    if (!projectDescription.trim()) return;

                    // Store values before clearing form
                    const name = projectName;
                    const description = projectDescription;
                    const tagline = projectTagline;
                    
                    // Close modal first for better UX
                    setShowSecondModal(false);
                    
                    // Reset fields immediately
                    setProjectName("");
                    setProjectDescription("");
                    setProjectTagline("");
                    
                    // Set a loading state if needed
                    setLoading(true);
                    
                    // This is blocking but very fast - just to get the page ID
                    (async () => {
                      try {
                        const response = await apiClient.createLaunchPage({
                          name,
                          description,
                          tagline
                        });
                        
                        if (response.success && response.data) {
                          // Immediately redirect with the page ID
                          window.location.href = `/dashboard/page/${response.data.id}`;
                        } else {
                          console.error('Failed to create launch page:', response.message);
                          alert('Failed to create launch page. Please try again.');
                          setLoading(false);
                        }
                      } catch (error) {
                        console.error('Error creating launch page:', error);
                        alert('Failed to create launch page. Please try again.');
                        setLoading(false);
                      }
                    })();
                    
                    // Reset fields
                    setProjectName("");
                    setProjectDescription("");
                    setProjectTagline("");
                  }}
                  disabled={!projectDescription.trim()}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
