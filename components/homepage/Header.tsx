'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  onDemoRequest: () => void
}

export default function Header({ onDemoRequest }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Force refresh for hero image fix

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  const handleDemoClick = () => {
    setIsMobileMenuOpen(false)
    onDemoRequest()
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`} id="header">
      <div className="header-container">
        <div className="header-logo">
          <Link href="/" aria-label="Civic Narrative Home">
            <Image
              src="/CN-Logo.png"
              alt="Civic Narrative Logo"
              className="logo"
              width={200}
              height={80}
              priority
            />
          </Link>
        </div>

        <nav
          className={`header-nav ${isMobileMenuOpen ? 'active' : ''}`}
          id="mainNav"
          aria-label="Main Navigation"
        >
          <ul className="nav-list">
            <li><a href="#solutions" className="nav-link" onClick={handleNavClick}>Solutions</a></li>
            <li><a href="#work" className="nav-link" onClick={handleNavClick}>Work</a></li>
            <li><a href="#ai-tools" className="nav-link" onClick={handleNavClick}>AI Tools</a></li>
            <li><a href="#about" className="nav-link" onClick={handleNavClick}>About</a></li>
            <li><a href="#contact" className="nav-link" onClick={handleNavClick}>Contact</a></li>
            <li><button onClick={handleDemoClick} className="nav-link nav-cta">Request a Demo</button></li>
          </ul>
        </nav>

        <div className="header-controls">
          <button
            className="mobile-menu-toggle"
            aria-label="Toggle Mobile Menu"
            id="mobileMenuToggle"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}
