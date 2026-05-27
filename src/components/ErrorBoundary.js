import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      countdown: 5,
      isChunkError: false
    };
    this.countdownTimer = null;
  }

  static getDerivedStateFromError(error) {
    // Determine if this is a chunk load error
    const isChunkError = 
      error.name === 'ChunkLoadError' || 
      /loading\s+chunk\s+.*\s+failed/i.test(error.message) ||
      /failed\s+to\s+fetch/i.test(error.message);
      
    return { 
      hasError: true, 
      error,
      isChunkError
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console for developers
    console.error('ErrorBoundary caught an uncaught runtime error:', error, errorInfo);

    // If it's a chunk loading failure, initiate automatic reload countdown
    if (this.state.isChunkError) {
      this.startCountdown();
    }
  }

  componentWillUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  startCountdown = () => {
    this.countdownTimer = setInterval(() => {
      this.setState(prevState => {
        if (prevState.countdown <= 1) {
          clearInterval(this.countdownTimer);
          this.handleReload();
          return { countdown: 0 };
        }
        return { countdown: prevState.countdown - 1 };
      });
    }, 1000);
  };

  handleReload = () => {
    try {
      // Clear any retry flags so it starts fresh
      sessionStorage.removeItem('chunk-load-retry');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;
      
      return (
        <div style={styles.container}>
          {/* Custom style injection for premium animations */}
          <style>{`
            @keyframes pulseGlow {
              0% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
              50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.4); }
              100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes spinSlow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .error-card {
              animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              animation-play-state: running;
            }
            .glow-effect {
              animation: pulseGlow 3s infinite ease-in-out;
            }
            .rotate-slow {
              animation: spinSlow 8s infinite linear;
            }
            .hover-btn:hover {
              transform: translateY(-2px);
              background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%) !important;
              box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3) !important;
            }
            .hover-btn:active {
              transform: translateY(0);
            }
            .hover-outline-btn:hover {
              background: rgba(255, 255, 255, 0.05) !important;
              border-color: #cbd5e1 !important;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.15);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>

          <div className="error-card glow-effect" style={styles.card}>
            <div style={styles.header}>
              <div style={styles.iconContainer}>
                {isChunk ? (
                  // Nice modern puzzle pieces/refresh graphic represented using clean SVG
                  <svg className="rotate-slow" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                ) : (
                  // Alert triangle SVG
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                )}
              </div>
              <h1 style={styles.title}>
                {isChunk ? 'Application Update Available' : 'Something went wrong'}
              </h1>
              <p style={styles.subtitle}>
                {isChunk 
                  ? 'We have detected a newer version of the application or a connection interruption. We are reloading your page to get the latest updates.'
                  : 'An unexpected runtime error has occurred in the application. Please reload or contact support if the issue persists.'
                }
              </p>
            </div>

            {isChunk && (
              <div style={styles.badge}>
                <span style={styles.badgePulse}></span>
                Refreshing in <strong style={{ margin: '0 4px', fontSize: '1.1rem' }}>{this.state.countdown}</strong> seconds...
              </div>
            )}

            <div style={styles.actions}>
              <button 
                onClick={this.handleReload} 
                className="hover-btn" 
                style={styles.primaryButton}
              >
                Refresh Application
              </button>
              
              {!isChunk && (
                <button 
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })} 
                  className="hover-outline-btn"
                  style={styles.secondaryButton}
                >
                  {this.state.showDetails ? 'Hide Error Details' : 'Show Error Details'}
                </button>
              )}
            </div>

            {this.state.showDetails && !isChunk && (
              <div style={styles.detailsContainer} className="custom-scrollbar">
                <div style={styles.detailsHeading}>Error Trace</div>
                <div style={styles.errorText}>
                  {this.state.error && this.state.error.toString()}
                </div>
                <pre style={styles.stackText}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div style={styles.footer}>
              NBT HUB &bull; Seamless Recovery Active
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
    color: '#f8fafc',
  },
  card: {
    maxWidth: '540px',
    width: '100%',
    background: 'rgba(30, 41, 59, 0.45)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px',
    boxSizing: 'border-box',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  header: {
    marginBottom: '28px',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '440px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: '#a5b4fc',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '28px',
    fontWeight: '500',
  },
  badgePulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#818cf8',
    marginRight: '10px',
    display: 'inline-block',
    boxShadow: '0 0 8px #818cf8',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    justifyContent: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    border: 'none',
    color: '#ffffff',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  secondaryButton: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#e2e8f0',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '500',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  detailsContainer: {
    marginTop: '28px',
    width: '100%',
    maxHeight: '220px',
    overflowY: 'auto',
    textAlign: 'left',
    background: 'rgba(0, 0, 0, 0.25)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '16px',
    boxSizing: 'border-box',
  },
  detailsHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f8fafc',
    fontFamily: 'monospace',
    marginBottom: '8px',
    wordBreak: 'break-all',
  },
  stackText: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
  },
  footer: {
    marginTop: '32px',
    fontSize: '11px',
    color: '#475569',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontWeight: '600',
  }
};

export default ErrorBoundary;
