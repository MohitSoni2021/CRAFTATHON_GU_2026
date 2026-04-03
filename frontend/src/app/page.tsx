"use client"
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Link from 'next/link';
import { Pill, Activity, ShieldCheck, ArrowRight, ActivitySquare, AlertCircle, HeartPulse, User, Clock, CheckCircle2 } from "lucide-react";
import styles from './page.module.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className={`${styles.container} ${jakarta.className}`}>
      
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Activity size={28} color="#fff" />
          MedTrack
        </div>
        <div className={styles.navLinks}>
          <a className={styles.navLink}>Home</a>
          <a href="#solutions" className={styles.navLink}>Solutions</a>
          <a href="#features" className={styles.navLink}>Features</a>
          <a className={styles.navLink}>Resources</a>
        </div>
        <Link href="/login" className={styles.navButton}>
          Login / Register
        </Link>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <User size={16} className={styles.heroTagIcon} />
            <span>Built for Gujarat Hackathon 2026</span>
          </div>
          <h1 className={styles.heroTitle}>
            Your Real-Time Medication Monitor
          </h1>
          <p className={styles.heroDescription}>
            MedTrack ensures patients take the right dose, at the right time. We empower caregivers with proactive alerts and personalized adherence scoring to prevent health crises.
          </p>
          <Link href="/login" className={styles.heroAction}>
            Get Started For Free
            <div className={styles.heroActionIcon}>
              <ArrowRight size={18} />
            </div>
          </Link>
        </div>

        {/* Glass Card Floating on Hero */}
        <div className={styles.heroGlassCard}>
          <div className={styles.glassAvatars}>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="User 1" />
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="User 2" />
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User 3" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User 4" />
          </div>
          <h2 className={styles.glassTitle}>
            30% <span>Improvement in Adherence</span>
          </h2>
          <div className={styles.glassTags}>
            <span className={styles.glassTag}>
              <span className={styles.glassTagIcon}><Activity size={12} /></span>
              Intelligent Scoring
            </span>
            <span className={styles.glassTag}>
               <span className={styles.glassTagIcon}><AlertCircle size={12} /></span>
               Caregiver Alerts
            </span>
            <span className={styles.glassTag}>
               <span className={styles.glassTagIcon}><Clock size={12} /></span>
               Smart Scheduling
            </span>
            <span className={styles.glassTag}>
               <span className={styles.glassTagIcon}><ShieldCheck size={12} /></span>
               Pattern Detection
            </span>
          </div>
        </div>
      </header>

      {/* Inline Text Statement Section */}
      <section className={styles.statementSection} id="solutions">
        <h2 className={styles.statementText}>
          Our platform 
          <span className={styles.inlinePill}>
            <Pill size={32} />
          </span> 
          reduces preventable hospitalizations 
          <span className={`${styles.inlinePill} ${styles.purple}`}>
            <HeartPulse size={32} />
          </span> 
          by ensuring real-time dose transparency 
          <div className={styles.inlineAvatars}>
            <img src="https://images.unsplash.com/photo-1582750433449-348eb71d2bcf?auto=format&fit=crop&w=100&q=80" alt="Caregiver 1" />
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80" alt="Caregiver 2" />
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" alt="Caregiver 3" />
          </div> 
          between patients and proactive caregivers.
        </h2>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.featuresHeader}>
          <div>
            <div className={styles.featuresSub}>
              <ActivitySquare size={16} /> Our Benefits
            </div>
            <h2 className={styles.featuresTitle}>The Smart Way To Monitor Adherence</h2>
          </div>
          <Link href="/login" className={styles.seeHowBtn}>
            See How It Works
            <div className={styles.seeHowBtnIcon}>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Card 1 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><ActivitySquare size={24} /></span>
              Intelligent Adherence Scoring
            </h3>
            <p className={styles.cardDesc}>
              MedTrack automatically calculates rolling adherence scores and classifies users into risk levels based on their logging streaks.
            </p>
            
            <div className={styles.mockupContainer}>
              <div className={styles.calendarCard}>
                <div className={styles.calendarHeader}>
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Patient" className={styles.calAvatar} />
                  <div className={styles.calInfo}>
                    <span>Patient</span>
                    <strong>Ravi Kumar</strong>
                  </div>
                  <span className={styles.calBadge}>+ Add Dose</span>
                </div>
                <div className={styles.calRow}>
                  <span className={styles.calTime}>08:00 AM</span>
                  <span className={styles.calMed}>Metformin / 500mg</span>
                  <CheckCircle2 color="#28a745" size={20} />
                </div>
                <div className={styles.calRow}>
                  <span className={styles.calTime}>10:00 AM</span>
                  <span className={styles.calMed}>Amlodipine / 5mg</span>
                  <AlertCircle color="#ff8a4c" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><ShieldCheck size={24} /></span>
              Proactive Caregiver Alerts
            </h3>
            <p className={styles.cardDesc}>
              When doses are consistently missed, caregivers receive immediate escalations to intervene before a health crisis occurs.
            </p>
            
            <div className={styles.mockupContainer}>
               <div className={styles.centralIcon}>
                 <Activity size={48} />
               </div>
               
               {/* Alert Nodes to mimic the circular design from Image 3 */}
               <div className={`${styles.alertNode} ${styles.alertNode1}`}>
                 <div className={`${styles.alertIcon} ${styles.success}`}>
                   <CheckCircle2 size={16} />
                 </div>
                 <div className={styles.alertText}>
                   <strong>Great job</strong>
                   <span>90% of doses taken this week</span>
                 </div>
               </div>

               <div className={`${styles.alertNode} ${styles.alertNode2}`}>
                 <div className={`${styles.alertIcon} ${styles.warning}`}>
                   <AlertCircle size={16} />
                 </div>
                 <div className={styles.alertText}>
                   <strong>Missed Dose</strong>
                   <span>Morning dose of Metformin</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
