import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  PlusCircle,
  Trash2,
  Check,
  Ban,
  Phone,
  Mail,
  FileCheck,
  ArrowLeft,
  Bed,
  Bath,
  Car,
  Sparkles,
  MessageSquare,
  Lock,
  Upload,
  Eye,
  Heart,
  Calendar,
  Send,
  BarChart3,
  Users,
  Home,
} from 'lucide-react';

const BASE_URL = 'https://urban-rentals-api.onrender.com/api/v1';

const API_AUTH = `${BASE_URL}/auth`;
const API_OWNERS = `${BASE_URL}/owners`;
const API_PROPERTIES = `${BASE_URL}/properties`;
const API_FAVORITES = `${BASE_URL}/favorites`;
const API_VIEWINGS = `${BASE_URL}/viewings`;
const API_MESSAGES = `${BASE_URL}/messages`;
const API_APPLICATIONS = `${BASE_URL}/applications`;
const API_ANALYTICS = `${BASE_URL}/analytics`;

export default function App() {
  const todayDateStr = new Date().toISOString().split('T')[0];

  const [authModal, setAuthModal] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('urban_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('urban_token'));

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Navigation Tab States
  const [renterNavTab, setRenterNavTab] = useState<'MARKETPLACE' | 'FAVORITES' | 'VIEWINGS' | 'APPLICATIONS' | 'MESSAGES'>('MARKETPLACE');
  const [ownerNavTab, setOwnerNavTab] = useState<'PROPERTIES' | 'VIEWINGS' | 'APPLICATIONS' | 'MESSAGES'>('PROPERTIES');

  // 💾 PERSISTENT VIEWED NOTIFICATION TABS
  const [viewedTabs, setViewedTabs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (currentUser?.id) {
      try {
        const saved = localStorage.getItem(`urban_seen_tabs_${currentUser.id}`);
        setViewedTabs(saved ? JSON.parse(saved) : {});
      } catch {
        setViewedTabs({});
      }
    } else {
      setViewedTabs({});
    }
  }, [currentUser?.id]);

  const markTabAsViewed = (tabKey: string) => {
    if (!currentUser?.id) return;
    setViewedTabs((prev) => {
      const updated = { ...prev, [tabKey]: true };
      localStorage.setItem(`urban_seen_tabs_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Registration Form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAccountType, setRegAccountType] = useState<'RENTER' | 'OWNER'>('RENTER');
  const [regIdNumber, setRegIdNumber] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regSuburb, setRegSuburb] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Reset (SMS OTP)
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneHint, setPhoneHint] = useState('');
  const [resetSessionId, setResetSessionId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Owner Dashboard & Listings
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  // Property Creation States (Native Upload, Max 10 Photos)
  const [propTitle, setPropTitle] = useState('');
  const [propDescription, setPropDescription] = useState('');
  const [propType, setPropType] = useState('APARTMENT');
  const [propPriceZar, setPropPriceZar] = useState('');
  const [propDepositZar, setPropDepositZar] = useState('');
  const [propBedrooms, setPropBedrooms] = useState('2');
  const [propBathrooms, setPropBathrooms] = useState('1');
  const [propParkingBays, setPropParkingBays] = useState('1');
  const [propAddress, setPropAddress] = useState('');
  const [propSuburb, setPropSuburb] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propPostalCode, setPropPostalCode] = useState('');
  const [propPhotoList, setPropPhotoList] = useState<string[]>([]);

  // Public Marketplace Properties & Detail View
  const [publicProperties, setPublicProperties] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('Any Type');
  const [selectedPublicProperty, setSelectedPublicProperty] = useState<any | null>(null);
  const [publicActivePhotoIndex, setPublicActivePhotoIndex] = useState(0);

  // Favourites, Viewings, Applications & Messages State
  const [myFavorites, setMyFavorites] = useState<any[]>([]);
  const [viewingRequests, setViewingRequests] = useState<any[]>([]);
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<{ conversationId: string; recipientName: string; propertyTitle: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Modals for Booking & Applying
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingDate, setViewingDate] = useState(todayDateStr);
  const [viewingTime, setViewingTime] = useState('14:00');
  const [viewingNote, setViewingNote] = useState('');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyEmployment, setApplyEmployment] = useState('Employed Full-Time');
  const [applyIncomeZar, setApplyIncomeZar] = useState('');
  const [applyOccupants, setApplyOccupants] = useState('1');
  const [applyMoveInDate, setApplyMoveInDate] = useState(todayDateStr);

  // Admin Dashboard States
  const [adminView, setAdminView] = useState(false);
  const [adminMainTab, setAdminMainTab] = useState<'OWNERS' | 'PROPERTIES'>('OWNERS');
  const [adminPropertyFilter, setAdminPropertyFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [ownersList, setOwnersList] = useState<any[]>([]);
  const [adminPropertiesList, setAdminPropertiesList] = useState<any[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [selectedOwnerDossier, setSelectedOwnerDossier] = useState<any | null>(null);
  const [selectedAdminProperty, setSelectedAdminProperty] = useState<any | null>(null);
  const [adminActivePhotoIndex, setAdminActivePhotoIndex] = useState(0);

  // Fetch Public Properties
  const fetchPublicListings = async () => {
    try {
      let url = `${API_PROPERTIES}?`;
      if (searchLocation.trim()) url += `city=${encodeURIComponent(searchLocation.trim())}&suburb=${encodeURIComponent(searchLocation.trim())}&`;
      if (searchType !== 'Any Type') url += `propertyType=${encodeURIComponent(searchType)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setPublicProperties(data.properties || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh All User / Admin Data
  const refreshUserData = async (authToken?: string) => {
    const activeToken = authToken || token || localStorage.getItem('urban_token');
    if (!activeToken) return;

    fetch(`${API_FAVORITES}/my-favorites`, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((r) => r.json())
      .then((d) => setMyFavorites(d.favorites || []))
      .catch(() => {});

    fetch(API_VIEWINGS, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((r) => r.json())
      .then((d) => setViewingRequests(d.viewingRequests || []))
      .catch(() => {});

    fetch(API_APPLICATIONS, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((r) => r.json())
      .then((d) => setApplicationsList(d.applications || []))
      .catch(() => {});

    fetch(`${API_MESSAGES}/conversations`, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((r) => r.json())
      .then((d) => setConversationsList(d.conversations || []))
      .catch(() => {});

    if (currentUser?.role === 'OWNER') {
      fetch(`${API_OWNERS}/me`, { headers: { Authorization: `Bearer ${activeToken}` } })
        .then((r) => r.json())
        .then((d) => { if (d.profile) setOwnerProfile(d.profile); })
        .catch(() => {});

      fetch(`${API_PROPERTIES}/owner/my-listings`, { headers: { Authorization: `Bearer ${activeToken}` } })
        .then((r) => r.json())
        .then((d) => setMyProperties(d.properties || []))
        .catch(() => {});
    }

    if (currentUser?.role === 'ADMIN') {
      fetch(`${API_OWNERS}/admin/pending`, { headers: { Authorization: `Bearer ${activeToken}` } })
        .then((r) => r.json())
        .then((d) => setOwnersList(d.pendingOwners || []))
        .catch(() => {});

      fetch(`${API_PROPERTIES}/admin/pending`, { headers: { Authorization: `Bearer ${activeToken}` } })
        .then((r) => r.json())
        .then((d) => setAdminPropertiesList(d.pendingProperties || []))
        .catch(() => {});

      fetch(`${API_ANALYTICS}/admin`, { headers: { Authorization: `Bearer ${activeToken}` } })
        .then((r) => r.json())
        .then((d) => setAdminAnalytics(d.analytics || null))
        .catch(() => {});

      fetch(`${API_OWNERS}/admin/users/all`, { headers: { Authorization: `Bearer ${activeToken}` } })
        .then((r) => r.json())
        .then((d) => setAllUsersList(d.users || []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchPublicListings();
    refreshUserData();
  }, [currentUser]);

  // LOGIN HANDLER (Properly Defined!)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('urban_token', data.token);
      localStorage.setItem('urban_user', JSON.stringify(data.user));
      setAuthModal(null);
      refreshUserData(data.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // REGISTER HANDLER (Properly Defined!)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (regPassword !== regConfirmPassword) return setErrorMsg('Passwords do not match.');
    if (regAccountType === 'OWNER' && (!regIdNumber || !regDob || !regAddress || !regSuburb || !regCity || !regPostalCode)) {
      return setErrorMsg('All owner verification fields are compulsory.');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          phoneNumber: regPhone,
          password: regPassword,
          accountType: regAccountType,
          idPassportNumber: regIdNumber,
          dateOfBirth: regDob,
          residentialAddress: regAddress,
          residentialSuburb: regSuburb,
          residentialCity: regCity,
          residentialPostalCode: regPostalCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('urban_token', data.token);
      localStorage.setItem('urban_user', JSON.stringify(data.user));
      setAuthModal(null);
      refreshUserData(data.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setOwnerProfile(null);
    setAdminView(false);
    setViewedTabs({});
    localStorage.removeItem('urban_token');
    localStorage.removeItem('urban_user');
  };

  // Toggle Favourite
  const handleToggleFavorite = async (propertyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setErrorMsg('🔒 Please log in or create a free account to save favourites.');
      setAuthModal('LOGIN');
      return;
    }
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_FAVORITES}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      if (res.ok) {
        refreshUserData(activeToken || undefined);
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Viewing Request
  const handleSendViewingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('🔒 Please log in to request a viewing.');
      setAuthModal('LOGIN');
      return;
    }
    if (viewingDate < todayDateStr) {
      alert('⚠️ Invalid Date: Viewing date cannot be in the past.');
      return;
    }
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(API_VIEWINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          propertyId: selectedPublicProperty.id,
          preferredDate: viewingDate,
          preferredTime: viewingTime,
          message: viewingNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      alert(data.message);
      setShowViewingModal(false);
      refreshUserData(activeToken || undefined);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateViewingStatus = async (viewingId: string, status: string) => {
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_VIEWINGS}/${viewingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert(`Viewing request marked as ${status}!`);
        refreshUserData(activeToken || undefined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Rental Application
  const handleSendApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('🔒 Please log in to apply for this property.');
      setAuthModal('LOGIN');
      return;
    }
    if (applyMoveInDate < todayDateStr) {
      alert('⚠️ Invalid Date: Move-in date cannot be in the past.');
      return;
    }
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(API_APPLICATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          propertyId: selectedPublicProperty.id,
          employmentStatus: applyEmployment,
          monthlyIncomeZar: applyIncomeZar,
          occupantsCount: applyOccupants,
          preferredMoveIn: applyMoveInDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      alert(data.message);
      setShowApplyModal(false);
      refreshUserData(activeToken || undefined);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_APPLICATIONS}/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert(`Application status updated to ${status}!`);
        refreshUserData(activeToken || undefined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Direct Messaging
  const handleStartChat = async (propertyId: string, recipientName: string, propertyTitle: string) => {
    if (!currentUser) {
      setErrorMsg('🔒 Please log in or create a free account to message this owner.');
      setAuthModal('LOGIN');
      return;
    }
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_MESSAGES}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        openChatWindow(data.conversationId, recipientName, propertyTitle);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openChatWindow = async (conversationId: string, recipientName: string, propertyTitle: string) => {
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_MESSAGES}/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages(data.messages || []);
        setActiveChat({ conversationId, recipientName, propertyTitle });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_MESSAGES}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ conversationId: activeChat.conversationId, content: messageInput.trim() }),
      });
      if (res.ok) {
        setMessageInput('');
        openChatWindow(activeChat.conversationId, activeChat.recipientName, activeChat.propertyTitle);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Native File Upload (Max 10)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 10 - propPhotoList.length;
    if (remaining <= 0) return alert('Maximum 10 photos allowed.');
    Array.from(files).slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 900;
          let w = img.width, h = img.height;
          if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          setPropPhotoList((prev) => (prev.length >= 10 ? prev : [...prev, canvas.toDataURL('image/jpeg', 0.7)]));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Create Property
  const handleCreateProperty = async (status: 'DRAFT' | 'PENDING_APPROVAL') => {
    const activeToken = token || localStorage.getItem('urban_token');
    if (!propTitle || !propDescription || !propPriceZar || !propAddress || !propSuburb || !propCity || !propPostalCode) {
      return alert('Please fill in all compulsory property fields.');
    }
    if (propPhotoList.length === 0) return alert('Please add at least 1 photo.');
    setLoading(true);
    try {
      const res = await fetch(API_PROPERTIES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          title: propTitle, description: propDescription, propertyType: propType,
          priceZar: propPriceZar, depositZar: propDepositZar, bedrooms: propBedrooms,
          bathrooms: propBathrooms, parkingBays: propParkingBays,
          availableFrom: todayDateStr,
          streetAddress: propAddress, suburb: propSuburb, city: propCity, postalCode: propPostalCode,
          images: propPhotoList, status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setShowAddPropertyModal(false);
      setPropPhotoList([]);
      refreshUserData(activeToken || undefined);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Decisions
  const handleAdminPropertyDecision = async (propertyId: string, status: 'APPROVED' | 'REJECTED') => {
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_PROPERTIES}/admin/${propertyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      alert(`Listing marked as ${status}!`);
      setSelectedAdminProperty(null);
      refreshUserData(activeToken || undefined);
      fetchPublicListings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminStatusChange = async (ownerProfileId: string, status: string) => {
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      const res = await fetch(`${API_OWNERS}/admin/${ownerProfileId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      alert(`Owner marked as ${status}!`);
      setSelectedOwnerDossier(null);
      refreshUserData(activeToken || undefined);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteOwner = async (ownerProfileId: string, ownerName: string) => {
    if (!window.confirm(`Permanently DELETE owner "${ownerName}"?`)) return;
    const activeToken = token || localStorage.getItem('urban_token');
    try {
      await fetch(`${API_OWNERS}/admin/${ownerProfileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      alert('Owner deleted.');
      refreshUserData(activeToken || undefined);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Password Reset Handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhoneHint(data.phoneHint || '');
      setSuccessMsg('OTP Code dispatched! Check your VS Code terminal.');
      setResetStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResetSessionId(data.resetSessionId);
      setSuccessMsg('Code verified! Create your new password.');
      setResetStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) return setErrorMsg('Passwords do not match.');
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetSessionId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Password updated! You can now log in.');
      setAuthModal('LOGIN');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFavorited = (propId: string) => myFavorites.some((f) => f.id === propId);

  const filteredAdminProps = adminPropertiesList.filter((p) => {
    if (adminPropertyFilter === 'ALL') return true;
    return p.status === adminPropertyFilter;
  });

  const pendingOwnerCount = ownersList.filter((o) => o.verification_status === 'PENDING').length;
  const pendingPropertyCount = adminPropertiesList.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const ownerViewingCount = viewingRequests.filter((v) => v.status === 'PENDING').length;
  const ownerAppCount = applicationsList.filter((a) => a.status === 'PENDING').length;
  const renterViewingNoticeCount = viewingRequests.length;
  const renterAppNoticeCount = applicationsList.length;
  const renterMessageCount = conversationsList.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 🌐 TOP NAVBAR */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between w-full">
          <div onClick={() => { setAdminView(false); setRenterNavTab('MARKETPLACE'); }} className="flex items-center gap-3 cursor-pointer">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight">Urban <span className="text-blue-600">Rentals</span></span>
              <p className="text-xs text-slate-500 font-medium">Accommodation Marketplace</p>
            </div>
          </div>

          {/* Renter Nav Links */}
          {currentUser && !adminView && currentUser.role === 'RENTER' && (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setRenterNavTab('MARKETPLACE')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${renterNavTab === 'MARKETPLACE' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Marketplace</button>
              <button onClick={() => setRenterNavTab('FAVORITES')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${renterNavTab === 'FAVORITES' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}><Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Favourites ({myFavorites.length})</button>
              <button onClick={() => { setRenterNavTab('VIEWINGS'); markTabAsViewed('RENTER_VIEWINGS'); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${renterNavTab === 'VIEWINGS' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}><Calendar className="w-3.5 h-3.5 text-blue-600" /> Viewings ({viewingRequests.length}) {!viewedTabs['RENTER_VIEWINGS'] && renterViewingNoticeCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{renterViewingNoticeCount}</span>}</button>
              <button onClick={() => { setRenterNavTab('APPLICATIONS'); markTabAsViewed('RENTER_APPLICATIONS'); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${renterNavTab === 'APPLICATIONS' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}><FileCheck className="w-3.5 h-3.5 text-green-600" /> Applications ({applicationsList.length}) {!viewedTabs['RENTER_APPLICATIONS'] && renterAppNoticeCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{renterAppNoticeCount}</span>}</button>
              <button onClick={() => { setRenterNavTab('MESSAGES'); markTabAsViewed('RENTER_MESSAGES'); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${renterNavTab === 'MESSAGES' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}><MessageSquare className="w-3.5 h-3.5 text-purple-600" /> Messages ({conversationsList.length}) {!viewedTabs['RENTER_MESSAGES'] && renterMessageCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{renterMessageCount}</span>}</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {currentUser?.role === 'ADMIN' && (
              <button onClick={() => setAdminView(!adminView)} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> {adminView ? 'View Marketplace' : 'Admin Control Center'}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">{currentUser.fullName}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {currentUser.role === 'ADMIN' ? '🛡️ ADMIN' : currentUser.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="text-xs text-red-600 font-bold hover:underline">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setErrorMsg(''); setAuthModal('LOGIN'); }} className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600">Login</button>
                <button onClick={() => { setErrorMsg(''); setAuthModal('REGISTER'); }} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm">Create Account</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 🛡️ ADMIN VIEW (WITH CLICKABLE ANALYTICS CARDS) ─── */}
      {currentUser?.role === 'ADMIN' && adminView ? (
        <div className="max-w-6xl mx-auto px-4 py-10 w-full">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-purple-600" /> Admin Control Center</h2>
              <p className="text-sm text-slate-500">Review owner profiles, inspect properties, and view marketplace analytics.</p>
            </div>
            <button onClick={() => refreshUserData()} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl">Refresh Data</button>
          </div>

          {/* 📊 CLICKABLE PLATFORM ANALYTICS SUMMARY CARDS */}
          {adminAnalytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div onClick={() => setShowAllUsersModal(true)} className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Users</span>
                  <h3 className="text-xl font-black text-slate-900">
                    {adminAnalytics.users.reduce((acc: number, u: any) => acc + u.count, 0)}
                  </h3>
                </div>
              </div>
              <div onClick={() => { setAdminMainTab('OWNERS'); setAdminFilter('APPROVED'); }} className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Approved Owners</span>
                  <h3 className="text-xl font-black text-slate-900">
                    {adminAnalytics.owners.find((o: any) => o.verification_status === 'APPROVED')?.count || 0}
                  </h3>
                </div>
              </div>
              <div onClick={() => { setAdminMainTab('PROPERTIES'); setAdminPropertyFilter('APPROVED'); }} className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Home className="w-6 h-6" /></div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Active Listings</span>
                  <h3 className="text-xl font-black text-slate-900">
                    {adminAnalytics.properties.find((p: any) => p.status === 'APPROVED')?.count || 0}
                  </h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><BarChart3 className="w-6 h-6" /></div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Inquiries & Apps</span>
                  <h3 className="text-xl font-black text-slate-900">
                    {adminAnalytics.totals.viewings + adminAnalytics.totals.applications}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-6 border-b">
            <button
              onClick={() => { setAdminMainTab('OWNERS'); markTabAsViewed('ADMIN_OWNERS'); }}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${adminMainTab === 'OWNERS' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}
            >
              Owner Profiles ({ownersList.length})
              {!viewedTabs['ADMIN_OWNERS'] && pendingOwnerCount > 0 && (
                <span className="bg-purple-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingOwnerCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setAdminMainTab('PROPERTIES'); markTabAsViewed('ADMIN_PROPERTIES'); }}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${adminMainTab === 'PROPERTIES' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}
            >
              Property Approvals ({adminPropertiesList.length})
              {!viewedTabs['ADMIN_PROPERTIES'] && pendingPropertyCount > 0 && (
                <span className="bg-purple-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingPropertyCount}
                </span>
              )}
            </button>
          </div>

          {adminMainTab === 'OWNERS' ? (
            <div className="grid gap-3">
              {ownersList.map((owner) => (
                <div key={owner.owner_profile_id} className="bg-white p-5 rounded-2xl border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base">{owner.full_legal_name} <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-bold ml-2">{owner.verification_status}</span></h4>
                    <p className="text-xs text-slate-500 mt-1">{owner.email} • {owner.phone_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOwnerDossier(owner)} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">View Full Profile</button>
                    <button onClick={() => handleDeleteOwner(owner.owner_profile_id, owner.full_legal_name)} className="p-2 text-red-600 border rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAdminPropertyFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${adminPropertyFilter === tab ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border text-slate-600'}`}
                  >
                    {tab === 'ALL' && `All Properties (${adminPropertiesList.length})`}
                    {tab === 'PENDING_APPROVAL' && `🟡 Pending Review (${adminPropertiesList.filter(p => p.status === 'PENDING_APPROVAL').length})`}
                    {tab === 'APPROVED' && `🟢 Approved Live (${adminPropertiesList.filter(p => p.status === 'APPROVED').length})`}
                    {tab === 'REJECTED' && `🔴 Rejected (${adminPropertiesList.filter(p => p.status === 'REJECTED').length})`}
                  </button>
                ))}
              </div>

              {filteredAdminProps.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border text-slate-500">No properties in this category.</div>
              ) : (
                <div className="grid gap-4">
                  {filteredAdminProps.map((prop) => {
                    const photos = prop.all_images ? prop.all_images.split('||') : [prop.primary_image];
                    return (
                      <div key={prop.id} className="bg-white p-6 rounded-3xl border flex gap-6 items-center">
                        <img src={photos[0]} alt={prop.title} className="w-32 h-24 object-cover rounded-xl shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{prop.title}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prop.status === 'APPROVED' ? 'bg-green-100 text-green-800' : prop.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{prop.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">R{(prop.price_cents / 100).toLocaleString()}/mo • {prop.suburb}, {prop.city} • Owner: <strong>{prop.owner_name}</strong></p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedAdminProperty(prop); setAdminActivePhotoIndex(0); }} className="px-3 py-2 bg-slate-100 text-xs font-bold rounded-xl">Inspect Photos</button>
                          {prop.status !== 'APPROVED' && <button onClick={() => handleAdminPropertyDecision(prop.id, 'APPROVED')} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl">Approve</button>}
                          {prop.status !== 'REJECTED' && <button onClick={() => handleAdminPropertyDecision(prop.id, 'REJECTED')} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Reject</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : currentUser?.role === 'OWNER' ? (
        /* ─── 🏠 OWNER VIEW ─── */
        <div className="max-w-6xl mx-auto px-4 py-10 w-full">
          <div className="p-6 rounded-3xl border mb-8 flex items-center justify-between bg-white shadow-sm">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>{ownerProfile?.verification_status === 'APPROVED' ? '🟢' : '🟡'}</span>
                {ownerProfile?.verification_status === 'APPROVED' ? 'Verified Owner Account' : 'Verification Pending'}
              </h2>
            </div>
            <button onClick={() => setShowAddPropertyModal(true)} disabled={ownerProfile?.verification_status !== 'APPROVED'} className="px-5 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white disabled:opacity-40 flex items-center gap-2 shadow-md">
              <PlusCircle className="w-5 h-5" /> Add Property
            </button>
          </div>

          <div className="flex gap-4 mb-6 border-b pb-2">
            <button onClick={() => setOwnerNavTab('PROPERTIES')} className={`text-sm font-bold pb-2 border-b-2 ${ownerNavTab === 'PROPERTIES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>My Listings ({myProperties.length})</button>
            <button onClick={() => { setOwnerNavTab('VIEWINGS'); markTabAsViewed('OWNER_VIEWINGS'); }} className={`text-sm font-bold pb-2 border-b-2 flex items-center gap-1.5 ${ownerNavTab === 'VIEWINGS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><Calendar className="w-4 h-4" /> Viewings ({viewingRequests.length}) {!viewedTabs['OWNER_VIEWINGS'] && ownerViewingCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{ownerViewingCount}</span>}</button>
            <button onClick={() => { setOwnerNavTab('APPLICATIONS'); markTabAsViewed('OWNER_APPLICATIONS'); }} className={`text-sm font-bold pb-2 border-b-2 flex items-center gap-1.5 ${ownerNavTab === 'APPLICATIONS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><FileCheck className="w-4 h-4" /> Applications ({applicationsList.length}) {!viewedTabs['OWNER_APPLICATIONS'] && ownerAppCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{ownerAppCount}</span>}</button>
            <button onClick={() => { setOwnerNavTab('MESSAGES'); markTabAsViewed('OWNER_MESSAGES'); }} className={`text-sm font-bold pb-2 border-b-2 flex items-center gap-1.5 ${ownerNavTab === 'MESSAGES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><MessageSquare className="w-4 h-4" /> Messages ({conversationsList.length}) {!viewedTabs['OWNER_MESSAGES'] && conversationsList.length > 0 && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{conversationsList.length}</span>}</button>
          </div>

          {ownerNavTab === 'PROPERTIES' && (
            <div className="bg-white rounded-3xl border p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProperties.map((prop) => {
                  const photos = prop.all_images ? prop.all_images.split('||') : [prop.primary_image];
                  return (
                    <div key={prop.id} className="border rounded-2xl p-4 flex gap-4">
                      <img src={photos[0]} alt={prop.title} className="w-24 h-24 object-cover rounded-xl shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100">{prop.status}</span>
                        <h4 className="font-bold text-sm mt-1">{prop.title}</h4>
                        <p className="text-xs font-bold text-blue-600">R{(prop.price_cents / 100).toLocaleString()}/mo</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ownerNavTab === 'VIEWINGS' && (
            <div className="bg-white rounded-3xl border p-6 space-y-3">
              {viewingRequests.map((v) => (
                <div key={v.id} className="p-4 border rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{v.property_title}</h4>
                    <p className="text-xs text-slate-600">Renter: <strong>{v.renter_name}</strong> ({v.renter_phone})</p>
                    <p className="text-xs text-blue-600 font-semibold mt-1">📅 {new Date(v.preferred_date).toLocaleDateString()} at {v.preferred_time}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100">{v.status}</span>
                    {v.status === 'PENDING' && <button onClick={() => handleUpdateViewingStatus(v.id, 'ACCEPTED')} className="px-3 py-1.5 bg-green-600 text-white font-bold text-xs rounded-xl">Accept</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ownerNavTab === 'APPLICATIONS' && (
            <div className="bg-white rounded-3xl border p-6 space-y-3">
              {applicationsList.map((a) => (
                <div key={a.id} className="p-4 border rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{a.property_title}</h4>
                    <p className="text-xs text-slate-600">Applicant: <strong>{a.applicant_name}</strong> ({a.applicant_phone})</p>
                    <p className="text-xs text-slate-500 mt-0.5">Income: R{(a.monthly_income_cents / 100).toLocaleString()}/mo • Move-in: {new Date(a.preferred_move_in).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100">{a.status}</span>
                    {a.status === 'PENDING' && <button onClick={() => handleUpdateAppStatus(a.id, 'APPROVED')} className="px-3 py-1.5 bg-green-600 text-white font-bold text-xs rounded-xl">Approve</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ownerNavTab === 'MESSAGES' && (
            <div className="bg-white rounded-3xl border p-6 space-y-2">
              {conversationsList.map((c) => (
                <div key={c.id} onClick={() => openChatWindow(c.id, c.renter_name, c.property_title)} className="p-4 border rounded-2xl hover:bg-slate-50 cursor-pointer flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.property_title}</h4>
                    <p className="text-xs text-slate-600">Chat with: <strong>{c.renter_name}</strong></p>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl">Open Chat</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── 👤 RENTER VIEW ─── */
        <main className="flex-1 w-full">
          {renterNavTab === 'FAVORITES' && (
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
              <h2 className="text-2xl font-black">My Saved Favourites ({myFavorites.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {myFavorites.map((p) => (
                  <div key={p.id} onClick={() => { setSelectedPublicProperty(p); setPublicActivePhotoIndex(0); }} className="bg-white rounded-2xl border overflow-hidden shadow-xs cursor-pointer">
                    <div className="h-44 bg-slate-100 relative">
                      <img src={p.primary_image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'} alt={p.title} className="w-full h-full object-cover" />
                      <button onClick={(e) => handleToggleFavorite(p.id, e)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500"><Heart className="w-4 h-4 fill-red-500" /></button>
                    </div>
                    <div className="p-4">
                      <span className="text-lg font-extrabold text-blue-600">R{(p.price_cents / 100).toLocaleString()}/mo</span>
                      <h4 className="font-bold text-sm mt-0.5">{p.title}</h4>
                      <p className="text-xs text-slate-400">📍 {p.suburb}, {p.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renterNavTab === 'VIEWINGS' && (
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
              <h2 className="text-2xl font-black">My Viewing Appointments ({viewingRequests.length})</h2>
              <div className="bg-white rounded-3xl border p-6 space-y-3">
                {viewingRequests.map((v) => (
                  <div key={v.id} className="p-4 border rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{v.property_title}</h4>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">📅 {new Date(v.preferred_date).toLocaleDateString()} at {v.preferred_time}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${v.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-slate-100'}`}>{v.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renterNavTab === 'APPLICATIONS' && (
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
              <h2 className="text-2xl font-black">My Rental Applications ({applicationsList.length})</h2>
              <div className="bg-white rounded-3xl border p-6 space-y-3">
                {applicationsList.map((a) => (
                  <div key={a.id} className="p-4 border rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{a.property_title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Move-in: {new Date(a.preferred_move_in).toLocaleDateString()} • Income: R{(a.monthly_income_cents / 100).toLocaleString()}/mo</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-slate-100'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renterNavTab === 'MESSAGES' && (
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
              <h2 className="text-2xl font-black">My Messages ({conversationsList.length})</h2>
              <div className="bg-white rounded-3xl border p-6 space-y-3">
                {conversationsList.map((c) => (
                  <div key={c.id} onClick={() => openChatWindow(c.id, c.owner_name, c.property_title)} className="p-4 border rounded-2xl hover:bg-slate-50 cursor-pointer flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm">{c.property_title}</h4>
                      <p className="text-xs text-slate-600">Landlord: <strong>{c.owner_name}</strong></p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl">Open Chat</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MARKETPLACE HERO */}
          {renterNavTab === 'MARKETPLACE' && (
            <div>
              <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 overflow-hidden w-full">
                <div className="absolute inset-0 bg-cover bg-center filter blur-xs scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')` }} />
                <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75" />
                <div className="relative max-w-4xl mx-auto text-center z-10 w-full py-16">
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg leading-tight">Find Your Next Home Anywhere</h1>
                  <p className="mt-4 text-lg text-slate-200 drop-shadow-md font-medium max-w-2xl mx-auto">Search verified apartments, houses, cottages, and rooms with trusted property owners.</p>
                  <div className="mt-10 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border flex flex-col md:flex-row gap-3 text-left">
                    <input type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="City or suburb..." className="flex-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm" />
                    <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="px-3 py-2.5 bg-slate-50 border rounded-xl text-sm">
                      <option>Any Type</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="HOUSE">House</option>
                      <option value="TOWNHOUSE">Townhouse</option>
                      <option value="ROOM">Room</option>
                    </select>
                    <button onClick={fetchPublicListings} className="py-3 px-8 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md">Search</button>
                  </div>
                </div>
              </div>

              {/* Property Grid */}
              <div className="max-w-7xl mx-auto px-4 py-16">
                <h3 className="font-bold text-xl mb-4">Available Rentals ({publicProperties.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {publicProperties.map((property) => {
                    const photos = property.all_images ? property.all_images.split('||') : [property.primary_image];
                    const fav = isFavorited(property.id);
                    return (
                      <div key={property.id} onClick={() => { setSelectedPublicProperty(property); setPublicActivePhotoIndex(0); }} className="bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl transition cursor-pointer flex flex-col">
                        <div className="h-48 bg-slate-100 relative">
                          <img src={photos[0]} alt={property.title} className="w-full h-full object-cover" />
                          <button onClick={(e) => handleToggleFavorite(property.id, e)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm"><Heart className={`w-4 h-4 ${fav ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} /></button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-xl font-extrabold text-blue-600">R{(property.price_cents / 100).toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></span>
                            <h4 className="font-bold text-slate-900 mt-1 line-clamp-1">{property.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">📍 {property.suburb}, {property.city}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t flex justify-between text-xs text-slate-600 font-semibold">
                            <span>🛏 {property.bedrooms} Beds</span>
                            <span>🚿 {property.bathrooms} Bath</span>
                            <span>🚗 {property.parking_bays} Parking</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ─── 👥 ADMIN: ALL USERS LIST MODAL (SECTION 23) ─── */}
      {showAllUsersModal && (
        <div onClick={() => setShowAllUsersModal(false)} className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-xl">All Platform Users ({allUsersList.length})</h3>
              </div>
              <button onClick={() => setShowAllUsersModal(false)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
              {allUsersList.map((u) => (
                <div key={u.id} className="p-4 border rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{u.full_name}</h4>
                    <p className="text-xs text-slate-500">{u.email} • {u.phone_number}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'OWNER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 🖼️ SECTION 9: PUBLIC PROPERTY DETAILS MODAL ─── */}
      {selectedPublicProperty && (
        <div onClick={() => setSelectedPublicProperty(null)} className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 max-h-[92vh] flex flex-col">
            <div className="p-6 border-b bg-white rounded-t-3xl sticky top-0 z-10 flex justify-between items-center">
              <button onClick={() => setSelectedPublicProperty(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back to Properties</button>
              <button onClick={() => setSelectedPublicProperty(null)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              {(() => {
                const photos = selectedPublicProperty.all_images ? selectedPublicProperty.all_images.split('||') : [selectedPublicProperty.primary_image];
                return (
                  <div>
                    <div className="h-80 w-full rounded-2xl overflow-hidden bg-black mb-3">
                      <img src={photos[publicActivePhotoIndex] || photos[0]} alt="Property" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photos.map((url: string, i: number) => (
                        <button key={i} onClick={() => setPublicActivePhotoIndex(i)} className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 ${publicActivePhotoIndex === i ? 'border-blue-600' : 'opacity-60'}`}>
                          <img src={url} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPublicProperty.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {selectedPublicProperty.street_address}, {selectedPublicProperty.suburb}, {selectedPublicProperty.city}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">R{(selectedPublicProperty.price_cents / 100).toLocaleString()}/mo</span>
                  <button onClick={() => handleToggleFavorite(selectedPublicProperty.id)} className="block text-xs font-bold text-red-600 hover:underline mt-1">{isFavorited(selectedPublicProperty.id) ? '❤️ Saved' : '♡ Save'}</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs font-bold">
                <span>🛏 {selectedPublicProperty.bedrooms} Beds</span>
                <span>🚿 {selectedPublicProperty.bathrooms} Baths</span>
                <span>🚗 {selectedPublicProperty.parking_bays} Parking</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{selectedPublicProperty.description}</p>

              {/* ACTION BUTTONS */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase text-blue-800">Verified Landlord</span>
                    <h4 className="font-bold text-base">{selectedPublicProperty.owner_name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowViewingModal(true)} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Request Viewing</button>
                    <button onClick={() => setShowApplyModal(true)} className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"><FileCheck className="w-4 h-4" /> Apply for Rental</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200">
                  <button onClick={() => { if (!currentUser) return setAuthModal('LOGIN'); alert(`📞 Owner Contact Number:\n${selectedPublicProperty.owner_phone || 'Available via platform chat'}`); }} className="py-2.5 bg-white text-blue-800 font-bold text-xs rounded-xl border flex items-center justify-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Call Owner</button>
                  <button onClick={() => { if (!currentUser) return setAuthModal('LOGIN'); alert(`✉️ Owner Email Address:\n${selectedPublicProperty.owner_email || 'Available via platform chat'}`); }} className="py-2.5 bg-white text-blue-800 font-bold text-xs rounded-xl border flex items-center justify-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Owner</button>
                  <button onClick={() => handleStartChat(selectedPublicProperty.id, selectedPublicProperty.owner_name, selectedPublicProperty.title)} className="py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Chat Message</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 📅 VIEWING REQUEST MODAL ─── */}
      {showViewingModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowViewingModal(false)} className="absolute right-5 top-5"><X className="w-5 h-5 text-slate-400" /></button>
            <h3 className="text-xl font-bold mb-1">Request a Viewing</h3>
            <form onSubmit={handleSendViewingRequest} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Date (Today or Future) *</label>
                <input type="date" required min={todayDateStr} value={viewingDate} onChange={(e) => setViewingDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Time *</label>
                <input type="time" required value={viewingTime} onChange={(e) => setViewingTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Optional Message</label>
                <textarea rows={2} value={viewingNote} onChange={(e) => setViewingNote(e.target.value)} placeholder="e.g. Can we view on Saturday?" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">Submit Viewing Request</button>
            </form>
          </div>
        </div>
      )}

      {/* ─── 📋 RENTAL APPLICATION MODAL ─── */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowApplyModal(false)} className="absolute right-5 top-5"><X className="w-5 h-5 text-slate-400" /></button>
            <h3 className="text-xl font-bold mb-1">Property Rental Application</h3>
            <form onSubmit={handleSendApplication} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Employment Status *</label>
                <select value={applyEmployment} onChange={(e) => setApplyEmployment(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm">
                  <option value="Employed Full-Time">Employed Full-Time</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Monthly Income (ZAR) *</label>
                <input type="number" required value={applyIncomeZar} onChange={(e) => setApplyIncomeZar(e.target.value)} placeholder="e.g. 25000" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Occupants *</label>
                  <input type="number" required min="1" value={applyOccupants} onChange={(e) => setApplyOccupants(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Move-in Date *</label>
                  <input type="date" required min={todayDateStr} value={applyMoveInDate} onChange={(e) => setApplyMoveInDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold text-xs rounded-xl shadow-md">Submit Rental Application</button>
            </form>
          </div>
        </div>
      )}

      {/* ─── 💬 DIRECT CHAT WINDOW ─── */}
      {activeChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-3xl shadow-2xl border z-50 flex flex-col overflow-hidden h-[480px]">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">{activeChat.recipientName}</h4>
              <p className="text-[11px] opacity-90 line-clamp-1">{activeChat.propertyTitle}</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="p-1 hover:bg-blue-700 rounded-full"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-slate-50">
            {chatMessages.length === 0 ? <p className="text-center text-xs text-slate-400 py-12">No messages yet. Say hello!</p> : (
              chatMessages.map((m) => {
                const isMe = m.sender_id === currentUser?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-0.5">{m.sender_name}</span>
                    <div className={`p-2.5 rounded-2xl max-w-[80%] text-xs ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-slate-900 rounded-bl-none shadow-xs'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
            <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type your message..." className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
            <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}

      {/* ─── ➕ ADD PROPERTY MODAL (OWNER) ─── */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddPropertyModal(false)} className="absolute right-5 top-5"><X className="w-6 h-6 text-slate-400" /></button>
            <h2 className="text-2xl font-black mb-4">Add New Property</h2>
            <div className="space-y-4">
              <input type="text" value={propTitle} onChange={(e) => setPropTitle(e.target.value)} placeholder="Title *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={propType} onChange={(e) => setPropType(e.target.value)} className="p-2.5 bg-slate-50 border rounded-xl text-sm">
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="ROOM">Room</option>
                </select>
                <input type="number" value={propPriceZar} onChange={(e) => setPropPriceZar(e.target.value)} placeholder="Monthly Rent ZAR *" className="p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <textarea rows={3} value={propDescription} onChange={(e) => setPropDescription(e.target.value)} placeholder="Description *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={propBedrooms} onChange={(e) => setPropBedrooms(e.target.value)} placeholder="Beds" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                <input type="number" value={propBathrooms} onChange={(e) => setPropBathrooms(e.target.value)} placeholder="Baths" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                <input type="number" value={propParkingBays} onChange={(e) => setPropParkingBays(e.target.value)} placeholder="Parking" className="p-2 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <input type="text" value={propAddress} onChange={(e) => setPropAddress(e.target.value)} placeholder="Street Address *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={propSuburb} onChange={(e) => setPropSuburb(e.target.value)} placeholder="Suburb *" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                <input type="text" value={propCity} onChange={(e) => setPropCity(e.target.value)} placeholder="City *" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                <input type="text" value={propPostalCode} onChange={(e) => setPropPostalCode(e.target.value)} placeholder="Postal Code *" className="p-2 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div className="border-t pt-3">
                <input type="file" id="prop-photos-upload" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                <label htmlFor="prop-photos-upload" className="w-full border-2 border-dashed border-blue-300 bg-blue-50 p-4 rounded-2xl flex flex-col items-center cursor-pointer text-xs font-bold text-blue-700">
                  <Upload className="w-6 h-6 mb-1" /> Choose Photos ({propPhotoList.length}/10 Max)
                </label>
                {propPhotoList.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {propPhotoList.map((url, i) => (
                      <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPropPhotoList(propPhotoList.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => handleCreateProperty('PENDING_APPROVAL')} className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                  Submit for Admin Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 👤 SECTION 16: ADMIN OWNER DOSSIER ─── */}
      {selectedOwnerDossier && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">Owner Profile: {selectedOwnerDossier.full_legal_name}</h3>
              <button onClick={() => setSelectedOwnerDossier(null)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>ID Number:</strong> {selectedOwnerDossier.id_passport_number}</p>
              <p><strong>Contact:</strong> {selectedOwnerDossier.phone_number} • {selectedOwnerDossier.email}</p>
              <p><strong>Residential Address:</strong> {selectedOwnerDossier.residential_address}, {selectedOwnerDossier.residential_suburb}, {selectedOwnerDossier.residential_city}</p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => handleAdminStatusChange(selectedOwnerDossier.owner_profile_id, 'APPROVED')} className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-xl">Approve Owner</button>
              <button onClick={() => handleAdminStatusChange(selectedOwnerDossier.owner_profile_id, 'REJECTED')} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 🔍 ADMIN PROPERTY INSPECTOR ─── */}
      {selectedAdminProperty && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{selectedAdminProperty.title}</h3>
              <button onClick={() => setSelectedAdminProperty(null)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {(() => {
                const photos = selectedAdminProperty.all_images ? selectedAdminProperty.all_images.split('||') : [selectedAdminProperty.primary_image];
                return (
                  <div>
                    <div className="h-80 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3">
                      <img src={photos[adminActivePhotoIndex] || photos[0]} alt="Full view" className="w-full h-full object-contain bg-black" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photos.map((url: string, i: number) => (
                        <button key={i} onClick={() => setAdminActivePhotoIndex(i)} className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 ${adminActivePhotoIndex === i ? 'border-purple-600' : 'opacity-60'}`}>
                          <img src={url} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => handleAdminPropertyDecision(selectedAdminProperty.id, 'APPROVED')} className="px-5 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl flex items-center gap-1">
                  <Check className="w-4 h-4" /> Approve Listing
                </button>
                <button onClick={() => handleAdminPropertyDecision(selectedAdminProperty.id, 'REJECTED')} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                  Reject Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 AUTH MODALS (LOGIN, REGISTER & FORGOT PASSWORD) */}
      {authModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAuthModal(null)} className="absolute right-5 top-5"><X className="w-5 h-5 text-slate-400" /></button>
            {errorMsg && <div className="mb-4 p-3 bg-amber-50 text-amber-900 text-xs font-bold rounded-xl">{errorMsg}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl">{successMsg}</div>}

            {authModal === 'REGISTER' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <h3 className="text-xl font-bold">Create Account</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRegAccountType('RENTER')} className={`p-2 rounded-xl text-xs font-bold border ${regAccountType === 'RENTER' ? 'border-blue-600 bg-blue-50 text-blue-700' : ''}`}>Renter</button>
                  <button type="button" onClick={() => setRegAccountType('OWNER')} className={`p-2 rounded-xl text-xs font-bold border ${regAccountType === 'OWNER' ? 'border-blue-600 bg-blue-50 text-blue-700' : ''}`}>Owner</button>
                </div>
                <input type="text" required value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Full Name *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Email *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="Phone *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                {regAccountType === 'OWNER' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" required value={regIdNumber} onChange={(e) => setRegIdNumber(e.target.value)} placeholder="ID Number *" className="p-2.5 bg-slate-50 border rounded-xl text-xs" />
                      <input type="date" required value={regDob} onChange={(e) => setRegDob(e.target.value)} className="p-2.5 bg-slate-50 border rounded-xl text-xs" />
                    </div>
                    <input type="text" required value={regAddress} onChange={(e) => setRegAddress(e.target.value)} placeholder="Address *" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" required value={regSuburb} onChange={(e) => setRegSuburb(e.target.value)} placeholder="Suburb *" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                      <input type="text" required value={regCity} onChange={(e) => setRegCity(e.target.value)} placeholder="City *" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                      <input type="text" required value={regPostalCode} onChange={(e) => setRegPostalCode(e.target.value)} placeholder="Code *" className="p-2 bg-slate-50 border rounded-xl text-xs" />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Password *" className="p-2.5 bg-slate-50 border rounded-xl text-xs" />
                  <input type="password" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Confirm Password *" className="p-2.5 bg-slate-50 border rounded-xl text-sm" />
                </div>
                <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white font-bold text-xs rounded-xl">Create Account</button>
              </form>
            )}

            {authModal === 'LOGIN' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <h3 className="text-xl font-bold">Login</h3>
                <input type="text" required value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="Email or Phone Number" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-semibold">Password</label>
                    <button type="button" onClick={() => setAuthModal('FORGOT_PASSWORD')} className="text-xs text-blue-600 hover:underline">Forgot Password?</button>
                  </div>
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                </div>
                <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white font-bold text-sm rounded-xl">Login</button>
              </form>
            )}

            {authModal === 'FORGOT_PASSWORD' && (
              <div>
                <h3 className="text-xl font-bold mb-2">Reset Password</h3>
                {resetStep === 1 && (
                  <form onSubmit={handleRequestOtp} className="space-y-3">
                    <p className="text-xs text-slate-500">Enter your registered Email or Phone Number to receive a 6-digit OTP code.</p>
                    <input type="text" required value={resetIdentifier} onChange={(e) => setResetIdentifier(e.target.value)} placeholder="Email or Phone Number" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                    <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white font-bold text-xs rounded-xl">Send Verification Code</button>
                  </form>
                )}
                {resetStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <p className="text-xs text-blue-600">Verification code sent to your registered phone ending in ...{phoneHint}</p>
                    <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" className="w-full p-2.5 bg-slate-50 border rounded-xl text-center text-lg font-bold tracking-widest" />
                    <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white font-bold text-xs rounded-xl">Verify Code</button>
                  </form>
                )}
                {resetStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <p className="text-xs text-slate-500">Create your new password.</p>
                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                    <input type="password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm New Password" className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
                    <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white font-bold text-xs rounded-xl">Reset Password</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}