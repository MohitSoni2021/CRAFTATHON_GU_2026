"use client"
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";
import Link from 'next/link';
import { 
  Activity, ArrowRight, Play, ShieldCheck, BadgeCheck, Users, Star, 
  Pill, Clock, BrainCircuit, HeartPulse, UserCircle
} from "lucide-react";
import styles from './page.module.css';

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className={`${styles.container} ${jakarta.className}`}>
      
      {/* Ceila-inspired Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Activity size={24} className={styles.logoIcon} />
          <span>MedTrack</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#" className={styles.navLink}>Smart Tracking</a>
          <a href="#" className={styles.navLink}>Caregiver Network</a>
          <a href="#" className={styles.navLink}>AI Insights</a>
          <a href="#" className={styles.navLink}>About</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.consultantBtn}>
            Get Free Trial
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Ceila-inspired Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.availableBadge}>
            <div className={styles.dot}></div>
            PROACTIVE MONITORING 24/7
          </div>
          <h1 className={`${styles.heroTitle} ${merriweather.className}`}>
            Modern Medication <br />
            Monitoring — <span>Anytime, <br /> Anywhere</span>
          </h1>
          <p className={styles.heroDescription}>
            Get professional adherence tracking, proactive alerts, and AI-driven health insights through your digital dashboard. No more missed doses. No more anxiety.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.primaryBtn}>
              Join MedTrack Now
              <ArrowRight size={18} />
            </Link>
            <button className={styles.secondaryBtn}>
              <div className={styles.playIcon}><Play size={14} fill="currentColor" /></div>
              See How it Works
            </button>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.mainIllustration}>
             {/* Floating Labels */}
             <div className={`${styles.floatingLabel} ${styles.label1}`}>
               <BadgeCheck size={14} color="#0d4d2e" />
               98.4% Adherence Rate
             </div>
             <div className={`${styles.floatingLabel} ${styles.label2}`}>
               <Clock size={14} color="#0d4d2e" />
               Instant Alerts Sent
             </div>
             
             {/* Hero Image / Figure */}
             <div className={styles.figureWrap}>
               <img src="/hero-visual.png" alt="Care Monitoring" />
               <div className={styles.socialProof}>
                  <div className={styles.avatars}>
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=40&q=80" alt="u1" />
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=40&q=80" alt="u2" />
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80" alt="u3" />
                  </div>
                  <div className={styles.proofText}>
                    <strong>10k +</strong>
                    <span>Satisfied Users</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* Feature Highlighting Bar (Ceila Style) */}
      <div className={styles.featureBar}>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}><ShieldCheck size={20} /></div>
          <div>
            <strong>GDPR-ready &</strong>
            <span>Encrypted Data</span>
          </div>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}><BadgeCheck size={20} /></div>
          <div>
            <strong>Verified Caregiver</strong>
            <span>Network Support</span>
          </div>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}><Users size={20} /></div>
          <div>
            <strong>Used by 1,000+</strong>
            <span>Families in India</span>
          </div>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}><Star size={20} /></div>
          <div>
            <strong>4.9/5 Average</strong>
            <span>Adherence Rating</span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
         <div className={styles.footerText}>
            © 2026 MedTrack • Health and Wellness Perfected
         </div>
      </footer>
    </div>
  );
}
