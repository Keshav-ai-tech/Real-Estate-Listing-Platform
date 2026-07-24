import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export default function Listings() {
  const [searchParams] = useSearchParams();
  
  // Extract parameters to display
  const city = searchParams.get('city');
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const bedrooms = searchParams.get('bedrooms');

  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', marginBottom: '24px' }}>
          Search Results
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
          This is a placeholder for the property listings page. Below are the filter parameters received from the Home page:
        </p>

        {/* Filter params display card */}
        <div style={{
          backgroundColor: 'var(--bg-offset)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'left',
          marginBottom: '40px',
          boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: 'var(--primary)' }} />
            Active Filters
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><strong>Keyword (Search):</strong> {search || 'None'}</li>
            <li><strong>City:</strong> {city || 'All Cities'}</li>
            <li><strong>Property Type:</strong> {type || 'Any'}</li>
            <li><strong>Price Range:</strong> {minPrice ? `$${Number(minPrice).toLocaleString()}` : '$0'} - {maxPrice ? `$${Number(maxPrice).toLocaleString()}` : 'No Limit'}</li>
            <li><strong>Bedrooms:</strong> {bedrooms || 'Any'}</li>
          </ul>
        </div>

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
