'use client'

import { useState } from 'react'

interface DemoRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DemoRequestModal({ isOpen, onClose }: DemoRequestModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call - replace with actual API endpoint
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Demo request submitted:', formData)
    setIsSubmitting(false)
    setSubmitSuccess(true)

    // Reset form after 2 seconds
    setTimeout(() => {
      setSubmitSuccess(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '',
        role: '',
        message: '',
      })
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {submitSuccess ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>We&apos;ve received your request and will be in touch shortly.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Request a Demo</h2>
              <p>Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="demo-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization *</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  placeholder="Your city, county, or organization name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Your Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="mayor">Mayor / City Manager</option>
                  <option value="department-head">Department Head</option>
                  <option value="communications">Communications Director</option>
                  <option value="it">IT Director</option>
                  <option value="staff">Staff Member</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">What are you interested in?</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about your needs and which solutions interest you..."
                />
              </div>

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Request Demo'}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(29, 53, 87, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          overflow-y: auto;
        }

        .modal-content {
          background-color: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #1D3557;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background-color: #F5F5F5;
        }

        .modal-header {
          margin-bottom: 2rem;
        }

        .modal-header h2 {
          color: #1D3557;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .modal-header p {
          color: #005F83;
          font-size: 1rem;
          margin: 0;
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          color: #1D3557;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #E5E5E5;
          border-radius: 6px;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #00B695;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .btn-submit {
          background-color: #88DC7F;
          color: #1D3557;
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #00B695;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 182, 149, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          text-align: center;
          padding: 3rem 2rem;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background-color: #88DC7F;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          margin: 0 auto 2rem;
          font-weight: bold;
        }

        .success-message h2 {
          color: #1D3557;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .success-message p {
          color: #005F83;
          font-size: 1.125rem;
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 2rem 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
