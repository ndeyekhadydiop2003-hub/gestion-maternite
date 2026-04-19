import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SplashPage - Version Épurée
 * Suppression du footer et ajustement de la mise en page.
 */
export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f8 0%, #fce4ec 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      color: '#1a0a10',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@300;400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        
        @keyframes fadeUp { 
          from { opacity:0; transform:translateY(20px); } 
          to { opacity:1; transform:translateY(0); } 
        }
        .splash-anim { animation: fadeUp 0.8s ease forwards; opacity: 0; }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '2rem 5%',
        position: 'relative',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '4rem',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          alignItems: 'center'
        }}>
          <div className="splash-anim" style={{ animationDelay: '100ms' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              lineHeight: 1.05,
              fontWeight: 800,
              marginBottom: '2rem',
              color: '#1a0a10'
            }}>
              Prendre soin de la <span style={{ color:'#c2185b' }}>vie</span> dès le premier souffle
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#6b3a4e',
              lineHeight: 1.8,
              maxWidth: '550px',
              marginBottom: '3rem',
              fontWeight: 300
            }}>
              Une plateforme d'excellence pour la gestion des services de maternité. 
              Suivi des patientes, naissances et soins avec une technologie fluide et humaine.
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '20px 45px',
                  background: '#c2185b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '18px',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor:'pointer',
                  boxShadow: '0 10px 30px rgba(194,24,91,0.25)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = '#ad1457'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#c2185b'; }}
              >
                Accéder à l'application
              </button>
            </div>
          </div>
          
          <div className="splash-anim" style={{ animationDelay: '400ms', position: 'relative' }}>
            <img 
              src="/bg-maternite.png" 
              alt="Maternité" 
              style={{
                width: '100%',
                borderRadius: '50px',
                boxShadow: '0 30px 70px rgba(0,0,0,0.15)',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}