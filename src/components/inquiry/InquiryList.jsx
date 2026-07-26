import React from 'react';
import { Mail, Phone, Calendar, User, Building } from 'lucide-react';
import formatDate from '../../utils/formatDate';

export default function InquiryList({ inquiries = [], loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{
            height: '140px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            animation: 'pulse 1.5s infinite'
          }} />
        ))}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        color: 'var(--text-muted)'
      }}>
        <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
          No inquiries have been received yet for your active listings.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {inquiries.map((inquiry) => (
        <div 
          key={inquiry._id || inquiry.id} 
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Header Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-dark)' }}>
                {inquiry.property?.title || 'Unknown Property'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <Calendar size={13} />
              <span>{formatDate(inquiry.createdAt || new Date())}</span>
            </div>
          </div>

          {/* User Contact Info */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 500 }}>{inquiry.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} />
              <a href={`mailto:${inquiry.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                {inquiry.email}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} style={{ color: 'var(--text-muted)' }} />
              <a href={`tel:${inquiry.phone}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                {inquiry.phone}
              </a>
            </div>
          </div>

          {/* Message Content */}
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-dark)' }}>
            <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Message
            </p>
            <p style={{ margin: 0, fontStyle: 'italic', backgroundColor: 'var(--bg-offset)', padding: '10px 14px', borderRadius: '8px' }}>
              "{inquiry.message}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
