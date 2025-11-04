'use client'

import { useState } from 'react'
import Header from '@/components/homepage/Header'
import InsightsSection from '@/components/homepage/InsightsSection'
import CTASection from '@/components/homepage/CTASection'
import DemoRequestModal from '@/components/homepage/DemoRequestModal'
import Image from 'next/image'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDemoRequest = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <Header onDemoRequest={handleDemoRequest} />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">Digital Government, Human Touch</h1>
            <p className="hero-subheadline">
              Make it easy for residents to get answers, complete tasks, and stay connected—without the runaround
            </p>
            <button onClick={handleDemoRequest} className="btn btn-primary">Request a Demo</button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="value-props" id="solutions">
        <div className="container">
          <h2 className="section-title">How We Help Communities Connect</h2>
          <div className="value-grid">
            <article className="value-card">
              <div className="value-icon" style={{ backgroundColor: '#00B695' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3>Engaging, Accessible Websites</h3>
              <p>We build inclusive, mobile-first government websites that meet every resident where they are—ensuring information is clear, accessible, and available on any device.</p>
            </article>

            <article className="value-card">
              <div className="value-icon" style={{ backgroundColor: '#88DC7F' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="9" y1="14" x2="13" y2="14"></line>
                </svg>
              </div>
              <h3>AI-Powered Resident Q&A</h3>
              <p>Our RAG-driven AI chat is trained on your agency's documents, forms, and policies—providing instant, accurate answers to residents 24/7, reducing staff burden.</p>
            </article>

            <article className="value-card">
              <div className="value-icon" style={{ backgroundColor: '#008B9A' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3>Narrative CMS</h3>
              <p>Transform departmental updates into compelling public narratives. Our AI-enhanced CMS guides staff in crafting clear stories and instantly generates social media posts across all platforms.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="featured-work" id="work">
        <div className="container">
          <h2 className="section-title">Featured Work</h2>
          <p className="section-subtitle">Real impact for real communities</p>

          <div className="work-grid">
            <article className="work-card">
              <div className="work-image">
                <Image
                  src="/ECCS.png"
                  alt="Erie County Children Services"
                  className="work-photo"
                  width={600}
                  height={400}
                />
              </div>
              <div className="work-content">
                <h3>Erie County Children Services</h3>
                <p className="work-client">Erie County</p>
                <p className="work-description">
                  Developed a comprehensive web platform for Erie County Children Services, providing families, foster parents, and community partners with accessible information about child welfare programs, foster care resources, and support services through an intuitive, compassionate digital experience.
                </p>
                <a href="#" className="btn btn-secondary">View Details</a>
              </div>
            </article>

            <article className="work-card">
              <div className="work-image">
                <Image
                  src="/OMJEC.png"
                  alt="Ohio Means Jobs Erie County"
                  className="work-photo"
                  width={600}
                  height={400}
                />
              </div>
              <div className="work-content">
                <h3>Ohio Means Jobs</h3>
                <p className="work-client">Erie County</p>
                <p className="work-description">
                  Before: Job seekers struggled to navigate complex workforce services and find relevant resources. After: Streamlined, accessible website connecting residents to employment opportunities, training programs, and career support services with clear pathways and intuitive navigation.
                </p>
                <a href="#" className="btn btn-secondary">View Details</a>
              </div>
            </article>

            <article className="work-card">
              <div className="work-image">
                <Image
                  src="/michaelshouse.png"
                  alt="Michael's House Child Advocacy Center"
                  className="work-photo"
                  width={600}
                  height={400}
                />
              </div>
              <div className="work-content">
                <h3>Michael&apos;s House Child Advocacy Center</h3>
                <p className="work-client">Child Advocacy Center</p>
                <p className="work-description">
                  Redesigned the website for this child advocacy center, replacing an outdated interface with a modern, accessible platform. The new design creates a clean, professional experience that better serves families and community partners seeking child abuse prevention resources and support services.
                </p>
                <a href="#" className="btn btn-secondary">View Details</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* AI Communication Features */}
      <section className="ai-features" id="ai-tools">
        <div className="container">
          <h2 className="section-title">AI-Powered Communication Tools</h2>
          <p className="section-subtitle">Instant, intelligent engagement for every citizen channel</p>

          {/* Narrative CMS - Full Width */}
          <div className="feature-panel-full">
            <h3>Narrative CMS</h3>
            <p className="feature-intro">Transform department updates into compelling articles and instant social media content</p>

            {/* Step 1: Add Basic News */}
            <div className="cms-step-full">
              <label className="step-label">1. Add basic news or update information and use the Narrative CMS AI assistant to draft the full article.</label>
              <div className="cms-input-box">
                <label className="cms-field-label">Department Update</label>
                <div className="cms-display-text">New playground equipment installed at Riverside Park. Grand opening ceremony Saturday 10am. Ribbon cutting with Mayor.</div>
                <div className="cms-button-row">
                  <button className="cms-button primary">Draft Article</button>
                </div>
              </div>
            </div>

            {/* Step 2: Refine Article */}
            <div className="cms-step-full">
              <label className="step-label">2. Refine and publish the AI-drafted article, and generate social media posts.</label>
              <div className="cms-article-editor">
                <div className="cms-editor-header">
                  <span className="cms-status">Draft</span>
                </div>
                <label className="cms-field-label">Title</label>
                <div className="cms-display-title">Riverside Park Unveils New Playground Equipment</div>
                <label className="cms-field-label">Content</label>
                <div className="cms-rich-toolbar">
                  <button className="rte-btn">≡</button>
                  <button className="rte-btn">&quot;</button>
                  <button className="rte-btn">&lt;/&gt;</button>
                  <button className="rte-btn">🔗</button>
                  <button className="rte-btn">🖼</button>
                  <button className="rte-btn">🎬</button>
                  <span className="toolbar-divider"></span>
                  <button className="rte-btn"><strong>B</strong></button>
                  <button className="rte-btn"><em>I</em></button>
                  <button className="rte-btn"><u>U</u></button>
                  <button className="rte-btn"><s>S</s></button>
                  <button className="rte-btn">A</button>
                  <button className="rte-btn">⬛</button>
                </div>
                <div className="cms-display-content">
                  <p>The Parks Department is thrilled to announce the installation of new, state-of-the-art playground equipment at Riverside Park. This enhancement provides safer, more accessible play opportunities for children of all abilities.</p>
                  <p><strong>Grand Opening:</strong> Join us Saturday at 10 AM as Mayor Johnson cuts the ribbon on this exciting community upgrade...</p>
                </div>
                <div className="cms-button-row">
                  <button className="cms-button primary">Publish</button>
                  <button className="cms-button secondary">Draft Social Posts</button>
                </div>
              </div>
            </div>

            {/* Step 3: Social Media Posts */}
            <div className="cms-step-full">
              <label className="step-label">3. Publish, track, and respond to social media posts.</label>
              <div className="social-posts-grid">
                <div className="social-posts-left">
                  <div className="social-preview">
                    <div className="social-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </div>
                    <p className="social-text">🎉 New playground equipment is here! Join us Saturday at 10 AM for the grand opening of Riverside Park&apos;s upgraded play area. Mayor Johnson will cut the ribbon. Bring the family! #CommunityFirst #RiversidePark</p>
                  </div>

                  <div className="social-preview">
                    <div className="social-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>X</span>
                    </div>
                    <p className="social-text">New playground at Riverside Park opens Saturday! 🎈 Join us 10 AM for ribbon cutting with the Mayor. See you there! #RiversidePark</p>
                  </div>
                </div>

                <div className="social-posts-right">
                  <div className="social-preview">
                    <div className="social-header">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077b5">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </div>
                    <p className="social-text">We&apos;re excited to announce the grand opening of upgraded playground equipment at Riverside Park this Saturday at 10 AM. Mayor Johnson will officiate the ribbon-cutting ceremony. This investment reflects our commitment to safe, engaging community spaces for families. #CommunityDevelopment #PublicSpaces</p>
                  </div>
                </div>
              </div>
              <p className="powered-by">Powered by Buffer API</p>
            </div>

            {/* Benefits at Bottom */}
            <ul className="feature-benefits feature-benefits-two-col cms-benefits">
              <li><strong>AI Writing Guidance:</strong> Transform brief updates into compelling, public-facing narratives</li>
              <li><strong>Multi-Format Output:</strong> Website articles and platform-optimized social posts</li>
              <li><strong>One-Click Publishing:</strong> Publish articles and post to all social channels simultaneously</li>
              <li><strong>Brand Consistency:</strong> Maintains your agency&apos;s voice and messaging standards</li>
            </ul>
          </div>

          {/* Two Column Section Below */}
          <div className="features-grid">
            <div className="feature-panel">
              <h3>Resident AI Chat</h3>
              <p className="feature-intro">24/7 answers powered by your agency&apos;s knowledge base</p>

              <div className="chat-mockup">
                <div className="chat-header">
                  <div className="chat-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <span>Civic Assistant</span>
                </div>
                <div className="chat-messages">
                  <div className="chat-message user">
                    <div className="message-bubble">When is leaf pickup in my neighborhood?</div>
                  </div>
                  <div className="chat-message assistant">
                    <div className="message-bubble">Based on the Streets Department schedule, leaf pickup for Zone 3 (which includes your area) runs November 15-22. Leaves should be raked to the curb by 7 AM on November 15. Need the full zone map?</div>
                  </div>
                  <div className="chat-message user">
                    <div className="message-bubble">Yes please!</div>
                  </div>
                  <div className="chat-message assistant">
                    <div className="message-bubble">Here&apos;s the complete zone map and pickup schedule: [Link to PDF]. You can also sign up for text reminders at cityname.gov/alerts.</div>
                  </div>
                </div>
                <div className="chat-input-area">
                  <input type="text" placeholder="Ask a question..." disabled />
                </div>
              </div>

              <ul className="feature-benefits">
                <li><strong>RAG Knowledge Base:</strong> Trained on forms, policies, schedules, and FAQs</li>
                <li><strong>Reduces Staff Load:</strong> Handles 80%+ of routine inquiries</li>
                <li><strong>Always Accurate:</strong> Pulls from verified agency sources</li>
              </ul>
            </div>

            <div className="feature-panel">
              <h3>ChatGPT Integration</h3>
              <p className="feature-intro">Meet residents where they already search—directly in ChatGPT</p>

              <div className="chatgpt-mockup">
                <div className="chatgpt-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#10a37f" strokeWidth="2"/>
                    <path d="M8 12h8M12 8v8" stroke="#10a37f" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>ChatGPT with Municipal Plugin</span>
                </div>
                <div className="chatgpt-conversation">
                  <div className="chatgpt-message user-msg">
                    <p>How do I apply for a building permit in Erie County?</p>
                  </div>
                  <div className="chatgpt-message assistant-msg">
                    <div className="plugin-badge">🏛️ Erie County Official Data</div>
                    <p>I can help you with building permits in Erie County. Here&apos;s the current process:</p>
                    <div className="info-card">
                      <h5>Building Permit Application</h5>
                      <ul>
                        <li><strong>Online:</strong> Apply at eriecounty.gov/permits</li>
                        <li><strong>Required:</strong> Plans, property survey, contractor info</li>
                        <li><strong>Fee:</strong> $150-500 based on project scope</li>
                        <li><strong>Timeline:</strong> 2-3 weeks for approval</li>
                      </ul>
                      <a href="#" className="direct-link">→ Start Application Now</a>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="feature-benefits">
                <li><strong>Search Visibility:</strong> Residents get accurate municipal info when asking ChatGPT</li>
                <li><strong>Always Current:</strong> Real-time integration with your official data sources</li>
                <li><strong>Direct Service Access:</strong> Links to forms, applications, and online services</li>
                <li><strong>Trusted Source Badge:</strong> Clearly identified as official municipal information</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Insights & Learning */}
      <InsightsSection />

      {/* Call to Action */}
      <CTASection onDemoRequest={handleDemoRequest} />

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-container">
          <div className="footer-brand">
            <Image
              src="/CN-Logo-White.png"
              alt="Civic Narrative Logo"
              className="footer-logo"
              width={200}
              height={80}
            />
            <p className="footer-tagline">Empowering open government through clear communication and advanced AI.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Solutions</h4>
              <ul>
                <li><a href="#solutions">Website Design</a></li>
                <li><a href="#ai-tools">AI Chat</a></li>
                <li><a href="#ai-tools">Narrative CMS</a></li>
                <li><a href="#solutions">Accessibility</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#work">Case Studies</a></li>
                <li><a href="#about">Resources</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Connect</h4>
              <ul>
                <li><button onClick={handleDemoRequest} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', font: 'inherit' }}>Request a Demo</button></li>
                <li><a href="mailto:hello@civicnarrative.com">hello@civicnarrative.com</a></li>
                <li><a href="tel:+15551234567">(555) 123-4567</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-social">
            <a href="#" aria-label="LinkedIn" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" aria-label="X" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Civic Narrative. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
        </div>
      </footer>

      <DemoRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
