import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <div className={styles.logo}>Launchit</div>
            <div className={styles.navLinks}>
              <a href="#about">About</a>
              <div className={styles.navButtons}>
                <a href="/login" className={styles.loginBtn}>Login</a>
                <a href="/signup" className={styles.signupBtn}>Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
     
      <main className={styles.main}>
        
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Launchit</h3>
              <p>Create stunning launch pages in minutes with just a simple form.</p>
            </div>
            
            <div className={styles.footerSection}>
              <h4>Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#login">Login</a></li>
                <li><a href="#signup">Sign Up</a></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h4>Contact</h4>
              <ul>
                <li>Email: hello@launchit.com</li>
                <li>Support: support@launchit.com</li>
              </ul>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Launchit. All rights reserved.</p>
            <div className={styles.footerLinks}>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
