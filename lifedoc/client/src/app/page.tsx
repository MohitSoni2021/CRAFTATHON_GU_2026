"use client"
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Link from 'next/link';
import { FaHeartbeat, FaFileMedicalAlt, FaBookMedical, FaShieldAlt, FaArrowRight, FaChartLine, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import styles from './page.module.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className={`${styles.container} ${jakarta.className}`}>
      
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <FaBookMedical size={28} color="#fff" />
          LifeDoc
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
            <FaShieldAlt size={16} className={styles.heroTagIcon} />
            <span>Built for Gujarat Hackathon 2026</span>
          </div>
          <h1 className={styles.heroTitle}>
            Your Health Journey, Simply Documented
          </h1>
          <p className={styles.heroDescription}>
            LifeDoc empowers you to take control of your well-being. Securely store medical records, track vital trends, and maintain a personal health diary — all in one accessible place.
          </p>
          <Link href="/signup" className={styles.heroAction}>
            Get Started For Free
            <div className={styles.heroActionIcon}>
              <FaArrowRight size={16} />
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
            100% <span>Secure & Private</span>
          </h2>
          <div className={styles.glassTags}>
            <span className={styles.glassTag}>
              <span className={styles.glassTagIcon}><FaBookMedical size={10} /></span>
              Health Diary
            </span>
            <span className={styles.glassTag}>
               <span className={styles.glassTagIcon}><FaFileMedicalAlt size={10} /></span>
               Digital Records
            </span>
            <span className={styles.glassTag}>
               <span className={styles.glassTagIcon}><FaHeartbeat size={10} /></span>
               Vitals Tracking
            </span>
            <span className={styles.glassTag}>
               <span className={styles.glassTagIcon}><FaChartLine size={10} /></span>
               Actionable Insights
            </span>
          </div>
        </div>
      </header>

      {/* Inline Text Statement Section */}
      <section className={styles.statementSection} id="solutions">
        <h2 className={styles.statementText}>
          Our platform 
          <span className={styles.inlinePill}>
            <FaBookMedical size={28} />
          </span> 
          simplifies health management 
          <span className={`${styles.inlinePill} ${styles.purple}`}>
            <FaHeartbeat size={28} />
          </span> 
          by ensuring secure data access 
          <div className={styles.inlineAvatars}>
            <img src="https://images.unsplash.com/photo-1582750433449-348eb71d2bcf?auto=format&fit=crop&w=100&q=80" alt="Caregiver 1" />
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80" alt="Caregiver 2" />
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" alt="Caregiver 3" />
          </div> 
          between patients and trusted physicians.
        </h2>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.featuresHeader}>
          <div>
            <div className={styles.featuresSub}>
              <FaFileMedicalAlt size={14} /> Comprehensive Tools
            </div>
            <h2 className={styles.featuresTitle}>Everything You Need For Healthy Living</h2>
          </div>
          <Link href="/signup" className={styles.seeHowBtn}>
            See How It Works
            <div className={styles.seeHowBtnIcon}>
              <FaArrowRight size={14} />
            </div>
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Card 1 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><FaBookMedical size={20} /></span>
              Smart Health Diary
            </h3>
            <p className={styles.cardDesc}>
              Log symptoms, medications, and daily feelings. Detect patterns in your health over time with our intuitive interface.
            </p>
            
            <div className={styles.mockupContainer}>
              <div className={styles.calendarCard}>
                <div className={styles.calendarHeader}>
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Patient" className={styles.calAvatar} />
                  <div className={styles.calInfo}>
                    <span>Patient Diary</span>
                    <strong>Sanjay Gupta</strong>
                  </div>
                  <span className={styles.calBadge}>+ Add Log</span>
                </div>
                <div className={styles.calRow}>
                  <span className={styles.calTime}>09:00 AM</span>
                  <span className={styles.calMed}>Blood Pressure Logging</span>
                  <FaCheckCircle color="#28a745" size={18} />
                </div>
                <div className={styles.calRow}>
                  <span className={styles.calTime}>02:00 PM</span>
                  <span className={styles.calMed}>Symptom Check-in</span>
                  <FaExclamationCircle color="#ff8a4c" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><FaFileMedicalAlt size={20} /></span>
              Digital Medical Records
            </h3>
            <p className={styles.cardDesc}>
              Never lose a prescription or lab report again. Upload, categorize, and search your medical documents instantly.
            </p>
            
            <div className={styles.mockupContainer}>
               <div className={styles.centralIcon}>
                 <FaHeartbeat size={40} />
               </div>
               
               {/* Alert Nodes to mimic the circular design */}
               <div className={`${styles.alertNode} ${styles.alertNode1}`}>
                 <div className={`${styles.alertIcon} ${styles.success}`}>
                   <FaCheckCircle size={14} />
                 </div>
                 <div className={styles.alertText}>
                   <strong>Report Uploaded</strong>
                   <span>Recent Blood Work Info</span>
                 </div>
               </div>

               <div className={`${styles.alertNode} ${styles.alertNode2}`}>
                 <div className={`${styles.alertIcon} ${styles.warning}`}>
                   <FaExclamationCircle size={14} />
                 </div>
                 <div className={styles.alertText}>
                   <strong>Record Alert</strong>
                   <span>Update Required</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
