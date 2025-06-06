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
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
  html?: string;
  publishSlug?: string;
  isPublished?: boolean;
  colorPalette?: string;
  theme?: string;
  creatorName?: string; // Creator's username from joined users table
}

export default function Dashboard() {
  // Define color palettes and theme options
  const colorPalettes = [
    { name: "Modern Blue", colors: ["#1A73E8", "#4285F4", "#8AB4F8"] },
    { name: "Forest Green", colors: ["#0F9D58", "#34A853", "#7BCB98"] },
    { name: "Ruby Red", colors: ["#DB4437", "#EA4335", "#F28B82"] },
    { name: "Sunset Orange", colors: ["#FF5722", "#FF7043", "#FFAB91"] },
    { name: "Royal Purple", colors: ["#673AB7", "#7E57C2", "#B39DDB"] },
    { name: "Ocean Teal", colors: ["#009688", "#26A69A", "#80CBC4"] },
    { name: "Midnight", colors: ["#121212", "#212121", "#424242"] },
  ];
  
  const themeOptions = [
    "Pastel", "Vintage", "Retro", "Neon", "Gold", 
    "Light", "Dark", "Warm", "Cold"
  ];

  const [user, setUser] = useState<User | null>(null);
  const [launchPages, setLaunchPages] = useState<LaunchPage[]>([]);
  const [publishedPages, setPublishedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'myCreations' | 'explore'>('myCreations');
    // Modal state
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTagline, setProjectTagline] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [theme, setTheme] = useState("");
  const [showColorPaletteDropdown, setShowColorPaletteDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
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
  };  // Function to safely set HTML content to avoid XSS
  const createSafeHTML = (html: string) => {
    // Create a basic HTML structure with improved styles for better rendering
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body { 
              margin: 0; 
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            body {
              transform: scale(0.4);
              transform-origin: 0 0;
              width: 250%;
              height: 250%;
            }
            /* Ensure responsive design shows properly in small preview */
            * { 
              transition: none !important; 
              animation: none !important;
            }
            /* Make elements more visible in the preview */
            img, svg {
              min-height: 20px;
              min-width: 20px;
            }
            /* Ensure text is visible */
            p, h1, h2, h3, h4, h5, h6, span, a {
              color: inherit !important;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  };
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.isAuthenticated()) {
        window.location.href = "/login";
        return;
      }

      try {
        // Fetch user profile, user's launch pages, and all published pages
        const [profileResponse, pagesResponse, publishedResponse] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getUserLaunchPages(),
          apiClient.getAllPublishedPages()
        ]);

        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data.user);
        }

        if (pagesResponse.success && pagesResponse.data) {          // Get pages
          const pages = pagesResponse.data;
            // For each page with status 'generated', extract the HTML content
          const pagesWithHTML = pages.map(page => {
            // Process pages with 'generated' status to ensure HTML content is available
            if (page.status === 'generated') {
              // First try to use htmlContent, then fall back to html property
              const content = page.htmlContent || page.html || '';
              return {
                ...page,
                // Store the content in both properties to ensure compatibility
                html: content,
                htmlContent: content
              };
            }
            return page;
          });
          
          setLaunchPages(pagesWithHTML);
        }
        
        // Store published pages from all users
        if (publishedResponse.success && publishedResponse.data) {
          const publishedPages = publishedResponse.data.map(page => {
            // Process the HTML content similar to user's pages
            const content = page.htmlContent || page.html || '';
            // Check if we have all required fields for display
            if (!page.publishSlug) {
              console.warn('Published page missing publishSlug:', page.id);
            }
            return {
              ...page,
              html: content,
              htmlContent: content
            };
          });
          
          setPublishedPages(publishedPages);
          console.log(`Loaded ${publishedPages.length} published pages`);
        } else {
          console.error('Failed to fetch published pages:', publishedResponse.message);
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
          

          {/* Search */}
                  {/* My creations */}
          <div className={`${styles.sidebarItem} ${activeView === 'myCreations' ? styles.active : ''}`} onClick={() => setActiveView('myCreations')}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            {sidebarExpanded && <span className={styles.sidebarLabel}>My creations</span>}
          </div>

          {/* Explore */}
          <div className={`${styles.sidebarItem} ${activeView === 'explore' ? styles.active : ''}`} onClick={() => setActiveView('explore')}>
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
          </div>        </header>        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Create new page card - only show in My Creations view */}
          {activeView === 'myCreations' && (
            <div className={`${styles.card} ${styles.createCard}`} onClick={() => setShowFirstModal(true)}>
              <div className={styles.previewFrame}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DD88CF" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 className={styles.projectName}>Create New Page</h3>
            </div>
          )}
          {/* Display user's launch pages */}
          {activeView === 'myCreations' && launchPages.map((page) => (
            <div 
              key={page.id} 
              className={`${styles.card} ${styles.launchPageCard}`}
              onClick={() => window.location.href = `/dashboard/page/${page.id}`}
            >
              <div className={styles.previewFrame}>
                {(page.html || page.htmlContent) && page.status === 'generated' ? (
                  <>
                    <div className={styles.previewOverlay}></div>
                    <iframe 
                      className={styles.previewIframe}
                      srcDoc={createSafeHTML(page.html || page.htmlContent || '')}
                      title={`Preview of ${page.name}`}
                      sandbox="allow-scripts allow-same-origin"
                      loading="eager"
                      onLoad={(e) => {
                        // Mark the iframe as loaded to potentially apply additional styling
                        e.currentTarget.classList.add(styles.loaded);
                      }}
                    />
                  </>
                ) : (
                  <div className={styles.previewLoading}>
                    {page.status === 'generating' ? (
                      <>
                        <div className={styles.loadingSpinner}></div>
                        <span>Generating...</span>
                      </>
                    ) : page.status === 'error' ? (
                      'Generation Error'
                    ) : (
                      'Loading Preview'
                    )}
                  </div>
                )}
              </div>
              <h3 className={styles.projectName}>{page.name}</h3>
            </div>
          ))}

          {/* Show message if no pages */}
          {activeView === 'myCreations' && launchPages.length === 0 && (
            <div className={styles.noPagesMessage}>
              No pages found. Create a new page to get started.
            </div>
          )}          {/* Explore section - public pages */}
          {activeView === 'explore' && (
            <div className={styles.exploreSection} style={{ width: '100%' }}>
              <h2 className={styles.exploreTitle}>Explore Public Pages</h2>
                {/* Display published pages in a row layout */}
              <div className={styles.exploreGrid}>
                {publishedPages.length > 0 ? (
                  publishedPages.map((page) => (
                    <div 
                      key={page.id} 
                      className={`${styles.card} ${styles.launchPageCard}`}
                      onClick={() => {
                      // Use the publishSlug to navigate to the published page in a new tab
                      if (page.publishSlug) {
                        window.open(`/${page.publishSlug}`, '_blank', 'noopener,noreferrer');
                      } else {
                        // Fallback to the editor page if no publishSlug exists
                        window.location.href = `/dashboard/page/${page.id}`;
                        console.warn('Published page missing publishSlug:', page.id);
                      }
                      }}
                    >
                      <div className={styles.previewFrame}>
                      {(page.html || page.htmlContent) && page.status === 'generated' ? (
                        <>
                        <div className={styles.previewOverlay}></div>
                        <iframe 
                          className={styles.previewIframe}
                          srcDoc={createSafeHTML(page.html || page.htmlContent || '')}
                          title={`Preview of ${page.name}`}
                          sandbox="allow-scripts allow-same-origin"
                          loading="eager"
                          onLoad={(e) => {
                          // Mark the iframe as loaded to potentially apply additional styling
                          e.currentTarget.classList.add(styles.loaded);
                          }}
                        />
                        </>
                      ) : (
                        <div className={styles.previewLoading}>
                        {page.status === 'generating' ? (
                          <>
                          <div className={styles.loadingSpinner}></div>
                          <span>Generating...</span>
                          </>
                        ) : page.status === 'error' ? (
                          'Generation Error'
                        ) : (
                          'Loading Preview'
                        )}
                        </div>
                      )}
                      </div>
                      <div className={styles.cardInfo}>
                      <h3 className={styles.projectName}>{page.name}</h3>
                      {page.creatorName && (
                        <div className={styles.creatorInfo}>
                        <span className={styles.creatorLabel}>by </span>
                        <span className={styles.creatorName}>{page.creatorName}</span>
                        </div>
                      )}
                      </div>
                    </div>
                  ))                ) : (
                  <div className={styles.noPagesMessage}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 15h8M9 9h.01M15 9h.01"/>
                    </svg>
                    <p>No published pages found</p>
                    <p className={styles.noPagesSubtext}>Switch to "My Creations" to create and publish your own pages</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
                <div style={{ marginBottom: "24px" }}>
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
                {/* Color Palette Dropdown */}
                <div style={{ marginBottom: "24px", position: "relative" }}>
                  <label className={styles.label}>
                    Choose color palette
                  </label>
                  <button 
                    type="button"
                    className={styles.dropdownButton}
                    onClick={() => {
                      setShowColorPaletteDropdown(!showColorPaletteDropdown);
                      setShowThemeDropdown(false);
                    }}
                  >
                    {colorPalette || "Choose color palette"} 
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showColorPaletteDropdown && (
                    <div className={styles.dropdownMenu} style={{ position: 'absolute', zIndex: 2000 }}>
                      {colorPalettes.map((palette) => (
                        <div 
                          key={palette.name}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setColorPalette(palette.name);
                            setShowColorPaletteDropdown(false);
                          }}
                        >
                          <div>{palette.name}</div>
                          <div className={styles.colorPaletteSample}>
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className={styles.colorSample}
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Theme Dropdown */}
                <div style={{ marginBottom: "16px", position: "relative" }}>
                  <label className={styles.label} htmlFor="projectTheme">
                    Choose Theme
                  </label>
                  <button 
                    type="button"
                    className={styles.dropdownButton}
                    onClick={() => {
                      setShowThemeDropdown(!showThemeDropdown);
                      setShowColorPaletteDropdown(false);
                    }}
                  >
                    {theme || "Choose Theme"} 
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showThemeDropdown && (
                    <div className={styles.dropdownMenu} style={{ position: 'absolute', zIndex: 2000 }}>
                      {themeOptions.map((themeName) => (
                        <div 
                          key={themeName}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setTheme(themeName);
                            setShowThemeDropdown(false);
                          }}
                        >
                          {themeName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div><div className={`${styles.modalActions} ${
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
                    if (!projectDescription.trim()) return;                    // Store values before clearing form
                    const name = projectName;
                    const description = projectDescription;
                    const tagline = projectTagline;
                    const selectedColorPalette = colorPalette;
                    const selectedTheme = theme;
                    
                    // Close modal first for better UX
                    setShowSecondModal(false);
                    
                    // Reset fields immediately
                    setProjectName("");
                    setProjectDescription("");
                    setProjectTagline("");
                    setColorPalette("");
                    setTheme("");
                    
                    // Set a loading state if needed
                    setLoading(true);
                    
                    // This is blocking but very fast - just to get the page ID
                    (async () => {
                      try {                        const response = await apiClient.createLaunchPage({
                          name,
                          description,
                          tagline,
                          colorPalette,
                          theme
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
