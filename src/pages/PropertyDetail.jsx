import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();

  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', marginBottom: '24px' }}>
          Property Detail
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
          This is a placeholder for property detailed view for ID: <strong>{id}</strong>.
        </p>

        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--primary)',
          fontWeight: 600
        }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
