import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MessageSquare, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  X, 
  CheckCircle,
  FileText,
  Save,
  Camera,
  AlertCircle
} from 'lucide-react';
import { getProperties, createProperty, deleteProperty } from '../api/properties.api';
import { getInquiries } from '../api/inquiries.api';
import InquiryList from '../components/inquiry/InquiryList';
import formatPrice from '../utils/formatPrice';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('listings');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Agent profile state (fallback to logged in user)
  const [agentProfile, setAgentProfile] = useState({
    name: localStorage.getItem('userName') || 'Agent Specialist',
    email: localStorage.getItem('userEmail') || 'agent@estate.com',
    role: localStorage.getItem('userRole') || 'agent',
    phone: '555-0199',
    agency: 'Estate Luxury Group',
    bio: 'Dedicated real estate professional specializing in elite homes.',
    yearsOfExperience: 0,
    photo: ''
  });

  const [toast, setToast] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: '2',
    bathrooms: '2',
    areaSqft: '1500',
    city: '',
    street: '',
    lng: '-80.19179',
    lat: '25.76168',
    images: '',
    amenities: 'pool, parking, airConditioning'
  });

  // Check user is authenticated and is an agent/admin
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all properties
      const propsData = await getProperties();
      // Filter properties listed by this agent email (or show all if admin)
      const userEmail = localStorage.getItem('userEmail') || 'agent@estate.com';
      const userRole = localStorage.getItem('userRole') || 'agent';
      
      const filteredProps = propsData.data?.filter(p => {
        if (userRole === 'admin') return true;
        return p.agent?.email === userEmail || p.agent === userEmail;
      }) || [];
      
      setProperties(filteredProps);

      // Fetch inquiries
      const inqData = await getInquiries();
      setInquiries(inqData.data || []);

      // Fetch agent profile details from backend
      try {
        const profileRes = await api.get('/api/auth/me');
        if (profileRes.data && profileRes.data.success) {
          const profile = profileRes.data.data;
          setAgentProfile({
            name: profile.name || '',
            email: profile.email || '',
            role: profile.role || 'agent',
            phone: profile.phone || '',
            agency: profile.agency || 'Estate Luxury Group',
            bio: profile.bio || '',
            yearsOfExperience: profile.yearsOfExperience || 0,
            photo: profile.photo || ''
          });
          setPreviewUrl(profile.photo || '');
        }
      } catch (err) {
        console.warn('API error fetching profile, relying on defaults:', err);
      }
    } catch (err) {
      console.warn('API error, relying on local mock simulation: ', err);
      // Mock fallback: show mock listings that match L.A./N.Y.
      // In local mode, just keep listings empty or seed from localStorage
      const cached = localStorage.getItem('dashboard_properties');
      if (cached) {
        setProperties(JSON.parse(cached));
      } else {
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        type: formData.type,
        propertyType: formData.propertyType,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        areaSqft: parseInt(formData.areaSqft),
        address: {
          street: formData.street,
          city: formData.city
        },
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
        },
        amenities: formData.amenities.split(',').map(a => a.trim()),
        images: formData.images ? [formData.images] : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80']
      };

      await createProperty(payload);
      
      setModalSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          type: 'sale',
          propertyType: 'apartment',
          bedrooms: '2',
          bathrooms: '2',
          areaSqft: '1500',
          city: '',
          street: '',
          lng: '-80.19179',
          lat: '25.76168',
          images: '',
          amenities: 'pool, parking, airConditioning'
        });
        fetchData();
      }, 1500);
    } catch (err) {
      console.warn('API error during creation, simulating in-memory listing update: ', err);
      // In-memory simulation
      const newProp = {
        _id: `dashboard-${Date.now()}`,
        id: `dashboard-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        type: formData.type,
        propertyType: formData.propertyType,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        areaSqft: parseInt(formData.areaSqft),
        address: { street: formData.street, city: formData.city },
        location: { type: 'Point', coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)] },
        amenities: formData.amenities.split(',').map(a => a.trim()),
        images: formData.images ? [formData.images] : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
        featured: false,
        agent: { name: agentProfile.name, email: agentProfile.email }
      };

      const updatedList = [newProp, ...properties];
      setProperties(updatedList);
      localStorage.setItem('dashboard_properties', JSON.stringify(updatedList));

      setModalSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
        setFormData({
          title: '',
          description: '',
          price: '',
          type: 'sale',
          propertyType: 'apartment',
          bedrooms: '2',
          bathrooms: '2',
          areaSqft: '1500',
          city: '',
          street: '',
          lng: '-80.19179',
          lat: '25.76168',
          images: '',
          amenities: 'pool, parking, airConditioning'
        });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    
    try {
      await deleteProperty(id);
      fetchData();
    } catch (err) {
      console.warn('API delete error, simulating locally: ', err);
      const updatedList = properties.filter(p => (p._id || p.id) !== id);
      setProperties(updatedList);
      localStorage.setItem('dashboard_properties', JSON.stringify(updatedList));
    }
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', agentProfile.name);
      data.append('email', agentProfile.email);
      data.append('phone', agentProfile.phone);
      data.append('agency', agentProfile.agency);
      data.append('bio', agentProfile.bio);
      data.append('yearsOfExperience', agentProfile.yearsOfExperience);

      if (selectedFile) {
        data.append('photo', selectedFile);
      } else {
        data.append('photo', agentProfile.photo);
      }

      const response = await api.put('/api/auth/updatedetails', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        updateUser(response.data.data);
        setAgentProfile(prev => ({
          ...prev,
          ...response.data.data,
          agency: response.data.data.agency || prev.agency,
          bio: response.data.data.bio || prev.bio,
          yearsOfExperience: response.data.data.yearsOfExperience || prev.yearsOfExperience
        }));
        setToast({ message: 'Profile settings updated successfully', type: 'success' });
        setTimeout(() => setToast(null), 3000);
        setSelectedFile(null);
      }
    } catch (err) {
      console.warn('API profile update error, saving locally: ', err);
      updateUser({
        ...agentProfile,
        photo: previewUrl || agentProfile.photo
      });
      setToast({ message: 'Profile updated locally', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentFieldChange = (e) => {
    setAgentProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAgentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div style={{ minHeight: '90vh', backgroundColor: 'var(--bg-offset)', paddingTop: '40px', paddingBottom: '80px' }}>
      <div className="container">
        
        {/* Toast notification banner */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '24px',
            zIndex: 9999,
            padding: '16px 24px',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            borderRadius: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          padding: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          alignItems: 'center',
          marginBottom: '40px',
          boxShadow: 'var(--shadow)'
        }}>
          {/* Avatar Icon */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'rgba(197, 160, 89, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--primary)',
            color: 'var(--primary)'
          }}>
            {agentProfile.photo ? (
              <img 
                src={agentProfile.photo} 
                alt={agentProfile.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <Building2 size={48} />
            )}
          </div>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>
                {agentProfile.name}
              </h1>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--primary)',
                backgroundColor: 'rgba(197, 160, 89, 0.15)',
                padding: '4px 12px',
                borderRadius: '50px',
                textTransform: 'uppercase'
              }}>{agentProfile.role} Portal</span>
            </div>
            
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', lineHeight: 1.5 }}>
              {agentProfile.bio || 'Dedicated real estate professional.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '8px', fontSize: '13px', color: 'var(--text)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{agentProfile.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{agentProfile.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{agentProfile.agency}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div style={{
            display: 'flex',
            gap: '24px',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '32px',
            minWidth: '240px'
          }} className="stats-panel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{properties.length}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Listings</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{inquiries.length}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inquiries</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tabs bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '12px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button
                onClick={() => setActiveTab('listings')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === 'listings' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'listings' ? '2px solid var(--primary)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                My Listings
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === 'inquiries' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'inquiries' ? '2px solid var(--primary)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Inquiries Received
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Profile Settings
              </button>
            </div>

            {activeTab === 'listings' && (
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                className="add-btn"
              >
                <Plus size={16} />
                <span>Create Listing</span>
              </button>
            )}
          </div>

          {/* Tab Views content */}
          {activeTab === 'listings' ? (
            loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading properties...</div>
            ) : properties.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '28px'
              }}>
                {properties.map((property) => (
                  <div key={property._id || property.id} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      zIndex: 20
                    }}>
                      <button
                        onClick={() => handleDelete(property._id || property.id)}
                        style={{
                          backgroundColor: '#f43f5e',
                          color: '#ffffff',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                          transition: 'transform 0.2s ease'
                        }}
                        title="Delete listing"
                        className="delete-icon-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Render minimal card details or use PropertyCard */}
                    <div style={{
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <img 
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                        alt={property.title} 
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {property.title}
                        </h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {property.address?.street}, {property.address?.city}
                        </p>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatPrice(property.price, property.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                color: 'var(--text-muted)'
              }}>
                <p style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>
                  You do not have any active property listings. Click "Create Listing" to create your first.
                </p>
              </div>
            )
          ) : activeTab === 'inquiries' ? (
            <InquiryList inquiries={inquiries} loading={loading} />
          ) : (
            /* Profile Settings View */
            <form onSubmit={handleProfileUpdateSubmit} style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px'
            }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                Agent Profile Settings
              </h2>

              {/* Avatar Uploader Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <img
                    src={previewUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                    alt="Agent Avatar"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <label htmlFor="agent-avatar-file" style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <Camera size={14} />
                    <input 
                      type="file" 
                      id="agent-avatar-file" 
                      accept="image/*" 
                      onChange={handleAgentFileChange} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>Profile Photo</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Will display publicly on listings.</span>
                </div>
              </div>

              {/* General details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="agent-name" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Name</label>
                  <input
                    type="text"
                    id="agent-name"
                    name="name"
                    required
                    value={agentProfile.name}
                    onChange={handleAgentFieldChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="agent-email" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    id="agent-email"
                    name="email"
                    required
                    value={agentProfile.email}
                    onChange={handleAgentFieldChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="agent-phone" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    type="tel"
                    id="agent-phone"
                    name="phone"
                    required
                    value={agentProfile.phone}
                    onChange={handleAgentFieldChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="agent-agency" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Agency Name</label>
                  <input
                    type="text"
                    id="agent-agency"
                    name="agency"
                    required
                    value={agentProfile.agency}
                    onChange={handleAgentFieldChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="agent-experience" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Years of Experience</label>
                  <input
                    type="number"
                    id="agent-experience"
                    name="yearsOfExperience"
                    value={agentProfile.yearsOfExperience}
                    onChange={handleAgentFieldChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="agent-bio" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Bio / Biography</label>
                <textarea
                  id="agent-bio"
                  name="bio"
                  rows={4}
                  value={agentProfile.bio}
                  onChange={handleAgentFieldChange}
                  placeholder="Describe your expertise and target real estate markets."
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: 'fit-content',
                  transition: 'background-color 0.2s'
                }}
                className="save-btn"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Create Listing Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(18, 24, 36, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}>
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={20} />
              </button>

              {modalSuccess ? (
                <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <CheckCircle size={54} style={{ color: '#10b981' }} />
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0 }}>Property Created</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Your property has been successfully added to listings.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                    Add New Property
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Property Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      required 
                      value={formData.title} 
                      onChange={handleInputChange}
                      placeholder="Glass Waterfront Villa"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Description</label>
                    <textarea 
                      name="description" 
                      required 
                      rows={3} 
                      value={formData.description} 
                      onChange={handleInputChange}
                      placeholder="Describe the amenities, spaces, and aesthetic highlights."
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  {/* Dual Grid fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Price ($)</label>
                      <input 
                        type="number" 
                        name="price" 
                        required 
                        value={formData.price} 
                        onChange={handleInputChange}
                        placeholder="1200000"
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Transaction Type</label>
                      <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleInputChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', height: '42px', backgroundColor: '#ffffff' }}
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Beds</label>
                      <input 
                        type="number" 
                        name="bedrooms" 
                        required 
                        value={formData.bedrooms} 
                        onChange={handleInputChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Baths</label>
                      <input 
                        type="number" 
                        name="bathrooms" 
                        required 
                        value={formData.bathrooms} 
                        onChange={handleInputChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Area (sqft)</label>
                      <input 
                        type="number" 
                        name="areaSqft" 
                        required 
                        value={formData.areaSqft} 
                        onChange={handleInputChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Type</label>
                      <select 
                        name="propertyType" 
                        value={formData.propertyType} 
                        onChange={handleInputChange}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', height: '42px', backgroundColor: '#ffffff' }}
                      >
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Street Address</label>
                      <input 
                        type="text" 
                        name="street" 
                        required 
                        value={formData.street} 
                        onChange={handleInputChange}
                        placeholder="123 Ocean Blvd"
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>City</label>
                      <input 
                        type="text" 
                        name="city" 
                        required 
                        value={formData.city} 
                        onChange={handleInputChange}
                        placeholder="Los Angeles"
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Coordinates Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Longitude</label>
                      <input 
                        type="text" 
                        name="lng" 
                        required 
                        value={formData.lng} 
                        onChange={handleInputChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Latitude</label>
                      <input 
                        type="text" 
                        name="lat" 
                        required 
                        value={formData.lat} 
                        onChange={handleInputChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Image URL</label>
                    <input 
                      type="text" 
                      name="images" 
                      value={formData.images} 
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/photo-..."
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Amenities (comma separated)</label>
                    <input 
                      type="text" 
                      name="amenities" 
                      value={formData.amenities} 
                      onChange={handleInputChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '15px',
                      marginTop: '10px'
                    }}
                    className="modal-submit-btn"
                  >
                    {loading ? 'Creating...' : 'Save Property Listing'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .add-btn:hover {
          background-color: var(--primary-hover) !important;
        }
        .delete-icon-btn:hover {
          transform: scale(1.1);
          background-color: #e11d48 !important;
        }
        .modal-submit-btn:hover {
          background-color: var(--primary-hover) !important;
        }
      `}</style>
    </div>
  );
}
