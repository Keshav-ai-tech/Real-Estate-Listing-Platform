import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';

// Hook to run intersection observer on sections
function useScrollAnimation() {
  const elementsRef = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const currentElements = elementsRef.current;
    currentElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      currentElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return addToRefs;
}

export default function Home() {
  const navigate = useNavigate();
  const addToAnimateRefs = useScrollAnimation();

  // Search States
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('Any');
  const [searchMinPrice, setSearchMinPrice] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');

  // Fetch States
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [cityCounts, setCityCounts] = useState({
    'India': 0,
    'New York': 14,
    'Los Angeles': 8,
    'Dubai': 12,
    'Paris': 6,
    'London': 10,
    'Miami': 9
  });

  // References for scrolling rows
  const citiesScrollRef = useRef(null);
  const agentsScrollRef = useRef(null);

  // Static Cities List
  const cities = [
    { name: 'India', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80', isCountry: true },
    { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80' },
    { name: 'Los Angeles', image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' },
    { name: 'London', image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80' },
    { name: 'Miami', image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=600&q=80' },
  ];

  // Mock Fallbacks
  const mockProperties = [
    {
      id: 'prop-1',
      title: 'The Glass Pavilion',
      price: 12450000,
      type: 'sale',
      propertyType: 'villa',
      bedrooms: 5,
      bathrooms: 6,
      areaSqft: 6800,
      address: { street: '9420 Wilshire Blvd', city: 'Los Angeles', state: 'CA' },
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
      featured: true
    },
    {
      id: 'prop-2',
      title: 'Skyline Penthouse',
      price: 8600000,
      type: 'sale',
      propertyType: 'apartment',
      bedrooms: 3,
      bathrooms: 3.5,
      areaSqft: 4100,
      address: { street: '432 Park Avenue', city: 'New York', state: 'NY' },
      images: ['https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=80'],
      featured: true
    },
    {
      id: 'prop-3',
      title: 'Azure Oasis Villa',
      price: 15200000,
      type: 'sale',
      propertyType: 'villa',
      bedrooms: 6,
      bathrooms: 7,
      areaSqft: 8500,
      address: { street: 'Palm Jumeirah', city: 'Dubai', state: 'UAE' },
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
      featured: true
    },
    {
      id: 'prop-4',
      title: 'Seine River Duplex',
      price: 4800000,
      type: 'sale',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 2200,
      address: { street: 'Quai de la Mégisserie', city: 'Paris', state: 'France' },
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
      featured: true
    },
    {
      id: 'prop-5',
      title: 'Mayfair Townhouse',
      price: 9500000,
      type: 'sale',
      propertyType: 'house',
      bedrooms: 4,
      bathrooms: 4.5,
      areaSqft: 4600,
      address: { street: 'Chesterfield Hill', city: 'London', state: 'UK' },
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
      featured: true
    },
    {
      id: 'prop-6',
      title: 'Biscayne Bay Mansion',
      price: 11200000,
      type: 'sale',
      propertyType: 'villa',
      bedrooms: 5,
      bathrooms: 5.5,
      areaSqft: 6100,
      address: { street: 'Hibiscus Island', city: 'Miami', state: 'FL' },
      images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
      featured: true
    }
  ];

  const mockAgents = [
    { id: 'agent-1', name: 'Alexandra Vance', agency: 'Senior Broker', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { id: 'agent-2', name: 'Marcus Sterling', agency: 'Partner', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
    { id: 'agent-3', name: 'Julienne Brooks', agency: 'Head of Sales', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
    { id: 'agent-4', name: 'David Chen', agency: 'Investment Partner', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
    { id: 'agent-5', name: 'Sophia Martinez', agency: 'Luxury Specialist', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { id: 'agent-6', name: 'Raymond Shaw', agency: 'Commercial Director', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }
  ];

  // Fetch Data on mount
  useEffect(() => {
    // 1. Fetch Featured Properties (relative path to utilize Vite proxy)
    fetch('/api/properties?featured=true&limit=6')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        setFeaturedProperties(data.data || data);
        setPropertiesLoading(false);
      })
      .catch(() => {
        // Fallback to mock
        setFeaturedProperties(mockProperties);
        setPropertiesLoading(false);
      });

    // 2. Fetch Agents (relative path to utilize Vite proxy)
    fetch('/api/agents?limit=6')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        setAgents(data.data || data);
        setAgentsLoading(false);
      })
      .catch(() => {
        // Fallback to mock
        setAgents(mockAgents);
        setAgentsLoading(false);
      });

    // 3. Fetch all listings to calculate dynamic city/country counts
    fetch('/api/properties?limit=200')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        const list = data.data || data.properties || [];
        const counts = {
          'India': 0,
          'New York': 0,
          'Los Angeles': 0,
          'Dubai': 0,
          'Paris': 0,
          'London': 0,
          'Miami': 0
        };
        list.forEach((prop) => {
          if (prop.address?.country?.toLowerCase() === 'india') {
            counts['India'] += 1;
          }
          const cityName = prop.address?.city;
          if (cityName) {
            const matchedKey = Object.keys(counts).find(
              (k) => k.toLowerCase() === cityName.toLowerCase()
            );
            if (matchedKey) {
              counts[matchedKey] += 1;
            }
          }
        });
        setCityCounts(counts);
      })
      .catch(() => {
        // Fallback: calculate from mockProperties
        const counts = {
          'India': 0,
          'New York': 0,
          'Los Angeles': 0,
          'Dubai': 0,
          'Paris': 0,
          'London': 0,
          'Miami': 0
        };
        mockProperties.forEach((prop) => {
          if (prop.address?.country?.toLowerCase() === 'india') {
            counts['India'] += 1;
          }
          const cityName = prop.address?.city;
          if (cityName) {
            const matchedKey = Object.keys(counts).find(
              (k) => k.toLowerCase() === cityName.toLowerCase()
            );
            if (matchedKey) {
              counts[matchedKey] += 1;
            }
          }
        });
        setCityCounts(counts);
      });
  }, []);

  // Handle cross-page hash scrolls (e.g. /#agents)
  useEffect(() => {
    if (window.location.hash === '#agents') {
      setTimeout(() => {
        const el = document.getElementById('agents');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  // Search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append('search', searchLocation);
    if (searchType !== 'Any') params.append('type', searchType.toLowerCase());
    if (searchMinPrice) params.append('minPrice', searchMinPrice);
    if (searchMaxPrice) params.append('maxPrice', searchMaxPrice);
    
    navigate(`/listings?${params.toString()}`);
  };

  // Row scroll controls
  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      
      {/* 1. Hero Section */}
      <section style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(18, 24, 36, 0.45), rgba(18, 24, 36, 0.65)), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '680px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px'
      }}>
        <div className="container" style={{
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <h1 className="font-serif" style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '16px',
            maxWidth: '800px',
            lineHeight: '1.15',
            letterSpacing: '-1.5px'
          }}>
            Find Your Next Address
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#e2e8f0',
            maxWidth: '540px',
            marginBottom: '40px',
            lineHeight: '1.6',
            fontWeight: 300
          }}>
            Discover exceptional properties in your favorite neighborhoods with our certified advisory team.
          </p>
        </div>

        {/* Floating Search Bar (overlaps hero by 40px) */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 24px',
          zIndex: 10
        }}>
          <form onSubmit={handleSearchSubmit} style={{
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '16px',
            padding: '20px 24px',
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            border: '1px solid var(--border)'
          }}>
            {/* Field 1: Location */}
            <div style={{ flex: '2 1 220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--border)', paddingRight: '12px' }} className="search-field-wrapper">
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input 
                  type="text" 
                  placeholder="Where do you want to live?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%',
                    fontWeight: 500,
                    color: 'var(--text-dark)'
                  }}
                />
              </div>
            </div>

            {/* Field 2: Property Type */}
            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Property Type</label>
              <div style={{ borderRight: '1px solid var(--border)', paddingRight: '12px' }} className="search-field-wrapper">
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    color: 'var(--text-dark)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Any">Any Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            {/* Field 3: Price Range */}
            <div style={{ flex: '1.5 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="number"
                  placeholder="Min"
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    width: '50%',
                    fontWeight: 500,
                    color: 'var(--text-dark)'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input 
                  type="number"
                  placeholder="Max"
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    width: '50%',
                    fontWeight: 500,
                    color: 'var(--text-dark)'
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <button type="submit" style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'background-color 0.2s ease, transform 0.1s ease',
              marginLeft: 'auto'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              <Search size={18} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Spacer to push content down past floating search bar */}
      <div style={{ height: '100px' }}></div>

      {/* 2. Browse by City Section */}
      <section ref={addToAnimateRefs} className="fade-up" style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px'
          }}>
            <div>
              <span style={{
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px'
              }}>Our Locations</span>
              <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-dark)' }}>
                Browse by City
              </h2>
            </div>
            {/* Scroll buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => scrollContainer(citiesScrollRef, 'left')}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid var(--border)', backgroundColor: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollContainer(citiesScrollRef, 'right')}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid var(--border)', backgroundColor: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Cities horizontal scroll list */}
          <div 
            ref={citiesScrollRef} 
            className="scroll-container hide-scrollbar"
          >
            {cities.map((city, idx) => (
              <div 
                key={idx} 
                className="scroll-item" 
                style={{ width: '280px' }}
              >
                <Link to={city.isCountry ? `/listings?country=${encodeURIComponent(city.name)}` : `/listings?city=${encodeURIComponent(city.name)}`} style={{
                  display: 'block',
                  position: 'relative',
                  height: '380px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
                className="city-card"
                >
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    className="city-image"
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(18, 24, 36, 0.8) 0%, rgba(18, 24, 36, 0.1) 60%)',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    color: '#ffffff',
                    zIndex: 2
                  }}>
                    <h3 className="font-serif" style={{ fontSize: '24px', color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>
                      {city.name}
                    </h3>
                    <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 300 }}>
                      {`${cityCounts[city.name] || 0} ${cityCounts[city.name] === 1 ? 'Listing' : 'Listings'}`}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Listings Section */}
      <section ref={addToAnimateRefs} className="fade-up" style={{ padding: '80px 0', backgroundColor: 'var(--bg-offset)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px'
            }}>Online Registry</span>
            <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px' }}>
              Featured Listings
            </h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--primary)', margin: '0 auto' }}></div>
          </div>

          {/* Listings Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px',
            marginBottom: '48px'
          }}>
            {propertiesLoading ? (
              // 6 Skeletons
              Array(6).fill(0).map((_, i) => (
                <div key={i} style={{
                  height: '420px',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div className="skeleton" style={{ height: '240px', width: '100%' }}></div>
                  <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="skeleton" style={{ height: '24px', width: '60%' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
                    <div className="skeleton" style={{ height: '30px', width: '100%', marginTop: '10px' }}></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProperties.map((prop) => (
                <PropertyCard key={prop._id || prop.id} property={prop} />
              ))
            )}
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/listings" style={{
              display: 'inline-block',
              padding: '14px 36px',
              border: '1px solid var(--primary)',
              borderRadius: '50px',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              backgroundColor: '#ffffff'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = 'var(--primary)'; }}
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Experience a Seamless Journey (How It Works) */}
      <section ref={addToAnimateRefs} className="fade-up" style={{ padding: '100px 0' }}>
        <div className="container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Left: Closing ceremony Image Frame */}
          <div style={{
            flex: '1 1 450px',
            position: 'relative',
            padding: '20px 0 0 20px'
          }}>
            {/* Warm gold offset background frame */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '20px',
              left: 0,
              top: '40px',
              backgroundColor: '#fbeedb',
              borderRadius: '20px',
              zIndex: 1
            }} />
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" 
              alt="Closing a house deal" 
              style={{
                width: '100%',
                maxHeight: '520px',
                objectFit: 'cover',
                borderRadius: '20px',
                position: 'relative',
                zIndex: 2,
                boxShadow: 'var(--shadow)'
              }}
            />
          </div>

          {/* Right: Steps */}
          <div style={{ flex: '1.2 1 450px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <span style={{
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px'
              }}>Our Process</span>
              <h2 className="font-serif" style={{ fontSize: '42px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.2' }}>
                Experience a Seamless Journey
              </h2>
            </div>

            {/* List of Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: '#121824', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px', flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                    Search Properties
                  </h3>
                  <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.5' }}>
                    Find your dream home with our high-fidelity, advanced search tools. Filter by price, type, location boundaries, and amenities easily.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: '#121824', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px', flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                    Book a Tour
                  </h3>
                  <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.5' }}>
                    Schedule physical or interactive virtual viewings with our certified local agents, tailored to fit into your busy calendar.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: '#121824', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px', flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                    Move In
                  </h3>
                  <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.5' }}>
                    Finalize documentation with escrow, lock in details, and secure your key. Transition smoothly into your new, carefully-curated address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Meet Our Advisory Team (Agents) */}
      <section id="agents" ref={addToAnimateRefs} className="fade-up" style={{ padding: '80px 0', backgroundColor: 'var(--dark)', color: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '48px'
          }}>
            <div>
              <span style={{
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px'
              }}>Our Agents</span>
              <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>
                Meet Our Advisory Team
              </h2>
            </div>
            {/* Scroll buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => scrollContainer(agentsScrollRef, 'left')}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid var(--border-dark)', backgroundColor: 'var(--dark-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', color: '#ffffff'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.color = '#ffffff'; }}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollContainer(agentsScrollRef, 'right')}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid var(--border-dark)', backgroundColor: 'var(--dark-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', color: '#ffffff'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.color = '#ffffff'; }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Agents List (scrollable row) */}
          <div 
            ref={agentsScrollRef} 
            className="scroll-container hide-scrollbar"
          >
            {agentsLoading ? (
              // 4 Skeletons
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="scroll-item" style={{ width: '260px', height: '360px', backgroundColor: 'var(--dark-accent)', borderRadius: '12px' }}>
                  <div className="skeleton" style={{ height: '280px', width: '100%', borderRadius: '12px 12px 0 0' }}></div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '18px', width: '70%' }}></div>
                    <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
                  </div>
                </div>
              ))
            ) : (
              agents.map((agent) => (
                <div 
                  key={agent._id || agent.id} 
                  className="scroll-item agent-card"
                  style={{ width: '260px', textAlign: 'left' }}
                >
                  <div style={{
                    position: 'relative',
                    height: '320px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    backgroundColor: 'var(--dark-accent)'
                  }}>
                    <img 
                      src={agent.photo} 
                      alt={agent.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(100%)',
                        transition: 'all 0.4s ease'
                      }}
                      className="agent-photo"
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(11, 15, 23, 0.4) 0%, rgba(11, 15, 23, 0) 40%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }} className="agent-overlay" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                    {agent.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {agent.agency || 'Executive Broker'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. Testimonial Section */}
      <section ref={addToAnimateRefs} className="fade-up" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '32px'
          }}>
            <Quote size={28} style={{ fill: 'currentColor', strokeWidth: 1.5 }} />
          </div>

          <p className="font-serif" style={{
            fontSize: '32px',
            lineHeight: '1.45',
            color: 'var(--text-dark)',
            marginBottom: '36px',
            fontWeight: 500,
            letterSpacing: '-0.5px'
          }}>
            "Estate redefined our expectations of what a real estate partner should be. Their attention to detail and market insight made our international move entirely stress-free."
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?auto=format&fit=crop&w=150&q=80" 
              alt="The Hamilton Family" 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)'
              }}
            />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>The Hamilton Family</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Relocated from London to NYC</p>
            </div>
          </div>
          
          {/* Slider Dots */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '40px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', cursor: 'pointer' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--border)', cursor: 'pointer' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--border)', cursor: 'pointer' }}></span>
          </div>
        </div>
      </section>

      {/* Global Section Styles for Hover States */}
      <style>{`
        .city-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg) !important;
        }
        .city-card:hover .city-image {
          transform: scale(1.06);
        }
        .agent-card:hover .agent-photo {
          filter: grayscale(0%) !important;
          transform: scale(1.03);
        }
        .agent-card:hover .agent-overlay {
          opacity: 1 !important;
        }
        .search-field-wrapper:focus-within {
          border-color: var(--primary) !important;
        }
      `}</style>

    </div>
  );
}
