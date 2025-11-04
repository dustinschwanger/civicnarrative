'use client'

interface CTASectionProps {
  onDemoRequest: () => void
}

export default function CTASection({ onDemoRequest }: CTASectionProps) {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Civic Communication?</h2>
          <p className="cta-subtitle">Join forward-thinking municipalities using AI-powered tools to engage residents, increase transparency, and reduce staff workload.</p>
          <div className="cta-stats">
            <div className="cta-stat">
              <span className="stat-number">80%</span>
              <span className="stat-label">Fewer routine inquiries</span>
            </div>
            <div className="cta-stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Resident support</span>
            </div>
            <div className="cta-stat">
              <span className="stat-number">5 min</span>
              <span className="stat-label">Idea → article → social post</span>
            </div>
          </div>
          <div className="cta-buttons">
            <button className="btn btn-primary-large" onClick={onDemoRequest}>
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
