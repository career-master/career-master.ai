'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

type ProfileTab = 'personal' | 'contact' | 'address' | 'academic' | 'courses';

export default function DashboardProfilePage() {
  const { user, loading, refreshUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [courseSearch, setCourseSearch] = useState('');

  const [form, setForm] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    guardianName: '',
    guardianRelation: '',
    profilePicture: '',
    
    // Contact Details
    email: '',
    phone: '',
    alternateMobile: '',
    whatsappNumber: '',
    whatsappSameAsMobile: false,
    
    // Present Address
    presentHouseNo: '',
    presentStreet: '',
    presentArea: '',
    presentCity: '',
    presentDistrict: '',
    presentState: '',
    presentPinCode: '',
    presentCountry: '',
    
    // Permanent Address
    permanentHouseNo: '',
    permanentStreet: '',
    permanentArea: '',
    permanentCity: '',
    permanentDistrict: '',
    permanentState: '',
    permanentPinCode: '',
    permanentCountry: '',
    sameAsPresentAddress: false,
    
    // Academic Details
    currentQualification: '',
    institutionName: '',
    university: '',
    yearOfStudy: '',
    expectedPassingYear: '',
    percentage: '',
    cgpa: '',
    gradeType: 'percentage',
    
    // Course Preferences
    selectedCourses: [] as string[],
    
    // Legacy fields
    name: '',
    college: '',
    school: '',
    jobTitle: '',
    currentStatus: '',
    interests: '',
    learningGoals: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      const profile = user.profile || {};
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        guardianName: profile.guardianName || '',
        guardianRelation: profile.guardianRelation || '',
        profilePicture: user.profilePicture || '',
        
        email: user.email || '',
        phone: user.phone || '',
        alternateMobile: profile.alternateMobile || '',
        whatsappNumber: profile.whatsappNumber || '',
        whatsappSameAsMobile: profile.whatsappSameAsMobile || false,
        
        presentHouseNo: profile.presentAddress?.houseNo || '',
        presentStreet: profile.presentAddress?.street || '',
        presentArea: profile.presentAddress?.area || '',
        presentCity: profile.presentAddress?.city || '',
        presentDistrict: profile.presentAddress?.district || '',
        presentState: profile.presentAddress?.state || '',
        presentPinCode: profile.presentAddress?.pinCode || '',
        presentCountry: profile.presentAddress?.country || '',
        
        permanentHouseNo: profile.permanentAddress?.houseNo || '',
        permanentStreet: profile.permanentAddress?.street || '',
        permanentArea: profile.permanentAddress?.area || '',
        permanentCity: profile.permanentAddress?.city || '',
        permanentDistrict: profile.permanentAddress?.district || '',
        permanentState: profile.permanentAddress?.state || '',
        permanentPinCode: profile.permanentAddress?.pinCode || '',
        permanentCountry: profile.permanentAddress?.country || '',
        sameAsPresentAddress: profile.sameAsPresentAddress || false,
        
        currentQualification: profile.currentQualification || '',
        institutionName: profile.institutionName || '',
        university: profile.university || '',
        yearOfStudy: profile.yearOfStudy?.toString() || '',
        expectedPassingYear: profile.expectedPassingYear?.toString() || '',
        percentage: profile.percentage?.toString() || '',
        cgpa: profile.cgpa?.toString() || '',
        gradeType: profile.gradeType || 'percentage',
        
        selectedCourses: profile.selectedCourses || [],
        
        name: user.name || '',
        college: profile.college || '',
        school: profile.school || '',
        jobTitle: profile.jobTitle || '',
        currentStatus: profile.currentStatus || '',
        interests: (profile.interests || []).join(', '),
        learningGoals: profile.learningGoals || '',
        city: profile.city || '',
        country: profile.country || '',
      });
    }
  }, [user]);

  // Copy present address to permanent when checkbox is checked
  useEffect(() => {
    if (form.sameAsPresentAddress) {
      setForm(prev => ({
        ...prev,
        permanentHouseNo: prev.presentHouseNo,
        permanentStreet: prev.presentStreet,
        permanentArea: prev.presentArea,
        permanentCity: prev.presentCity,
        permanentDistrict: prev.presentDistrict,
        permanentState: prev.presentState,
        permanentPinCode: prev.presentPinCode,
        permanentCountry: prev.presentCountry,
      }));
    }
  }, [form.sameAsPresentAddress, form.presentHouseNo, form.presentStreet, form.presentArea, form.presentCity, form.presentDistrict, form.presentState, form.presentPinCode, form.presentCountry]);

  // Copy mobile to WhatsApp when checkbox is checked
  useEffect(() => {
    if (form.whatsappSameAsMobile) {
      setForm(prev => ({ ...prev, whatsappNumber: prev.phone }));
    }
  }, [form.whatsappSameAsMobile, form.phone]);

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    try {
      setUploadingPicture(true);
      setError('');
      const res = await apiService.uploadImage(file, 'career-master/profile-pictures');
      if (res.success && res.data?.url) {
        setForm((prev) => ({ ...prev, profilePicture: res.data.url }));
        toast.success('Profile picture uploaded');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      toast.error(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const payload: any = {
        name: form.firstName && form.lastName ? `${form.firstName} ${form.lastName}`.trim() : form.name || user?.name,
        phone: form.phone.trim() || undefined,
        profilePicture: form.profilePicture.trim() || undefined,
        profile: {
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
          gender: form.gender || undefined,
          guardianName: form.guardianName.trim() || undefined,
          guardianRelation: form.guardianRelation || undefined,
          
          alternateMobile: form.alternateMobile.trim() || undefined,
          whatsappNumber: form.whatsappNumber.trim() || undefined,
          whatsappSameAsMobile: form.whatsappSameAsMobile,
          
          presentAddress: {
            houseNo: form.presentHouseNo.trim() || undefined,
            street: form.presentStreet.trim() || undefined,
            area: form.presentArea.trim() || undefined,
            city: form.presentCity.trim() || undefined,
            district: form.presentDistrict.trim() || undefined,
            state: form.presentState.trim() || undefined,
            pinCode: form.presentPinCode.trim() || undefined,
            country: form.presentCountry.trim() || undefined,
          },
          
          permanentAddress: {
            houseNo: form.permanentHouseNo.trim() || undefined,
            street: form.permanentStreet.trim() || undefined,
            area: form.permanentArea.trim() || undefined,
            city: form.permanentCity.trim() || undefined,
            district: form.permanentDistrict.trim() || undefined,
            state: form.permanentState.trim() || undefined,
            pinCode: form.permanentPinCode.trim() || undefined,
            country: form.permanentCountry.trim() || undefined,
          },
          sameAsPresentAddress: form.sameAsPresentAddress,
          
          currentQualification: form.currentQualification || undefined,
          institutionName: form.institutionName.trim() || undefined,
          university: form.university.trim() || undefined,
          yearOfStudy: form.yearOfStudy ? parseInt(form.yearOfStudy) : undefined,
          expectedPassingYear: form.expectedPassingYear ? parseInt(form.expectedPassingYear) : undefined,
          percentage: form.percentage ? parseFloat(form.percentage) : undefined,
          cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
          gradeType: form.gradeType,
          
          selectedCourses: form.selectedCourses,
          
          // Legacy fields
          college: form.college.trim() || undefined,
          school: form.school.trim() || undefined,
          jobTitle: form.jobTitle.trim() || undefined,
          currentStatus: form.currentStatus.trim() || undefined,
          interests: form.interests.split(',').map(i => i.trim()).filter(Boolean),
          learningGoals: form.learningGoals.trim() || undefined,
          city: form.city.trim() || undefined,
          country: form.country.trim() || undefined,
        },
      };

      const res = await apiService.updateCurrentUser(payload);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to update profile');
      }
      setSuccess('Profile updated successfully');
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    const requiredFields = [
      form.firstName,
      form.lastName,
      form.dateOfBirth,
      form.gender,
      form.guardianName,
      form.guardianRelation,
      form.phone,
      form.presentCity,
      form.presentState,
      form.presentPinCode,
      form.presentCountry,
      form.currentQualification,
      form.institutionName,
    ];
    
    const optionalFields = [
      form.profilePicture,
      form.email, // Email is always present from auth
      form.alternateMobile,
      form.whatsappNumber,
      form.presentHouseNo,
      form.presentStreet,
      form.presentArea,
      form.presentDistrict,
      form.permanentCity,
      form.permanentState,
      form.permanentPinCode,
      form.university,
      form.yearOfStudy,
      form.expectedPassingYear,
      form.percentage || form.cgpa,
      form.selectedCourses.length > 0,
    ];
    
    const filledRequired = requiredFields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    
    const filledOptional = optionalFields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    
    // Calculate completion: 70% weight on required fields, 30% on optional
    const requiredScore = (filledRequired / requiredFields.length) * 70;
    const optionalScore = (filledOptional / optionalFields.length) * 30;
    return Math.round(requiredScore + optionalScore);
  }, [form]);

  // Course categories and options
  const courseCategories = {
    'Maths': ['3', '4', '5', '6', '7', '8', '9', '10', 'Inter'],
    'Physics': ['3', '4', '5', '6', '7', '8', '9', '10', 'Inter'],
    'Social': ['3', '4', '5', '6', '7', '8', '9', '10', 'Inter'],
    'Olympiad Exams': ['NTSE', 'NLSTSE', 'INO', 'SOF', 'IMO', 'NSO', 'IEO', 'IGKO', 'ICSO', 'UCO', 'UIEO', 'SILVERZONE', 'IOM', 'IOS', 'IOEL', 'NIMO', 'NBO'],
    'National Level (All-India) Government Exams': ['UPSC', 'SSC'],
    'Public Sector Bank (PSB) Exams': ['IBPS PO', 'IBPS SO', 'IBPS CLERK', 'IBPS RRB', 'SBI PO', 'SBI SO', 'SBI CLERK', 'SBI APPRENTICE'],
    'Public Sector Finance Exams': ['RBI', 'NABARD', 'LIC'],
    'National Level Entrance Exams': {
      'Engineering & Technology': ['JEE MAIN', 'JEE ADVANCED', 'BITSAT', 'VITEEE', 'SRMJEEE'],
      'Medical & Health Sciences': ['NEET UG', 'NEET PG'],
      'Management & Commerce': ['IPMAT'],
      'Law': ['CLAT', 'AILET'],
      'Design & Architecture': ['NID DAT', 'NIFT', 'NATA'],
      'General': ['CUET UG', 'CUET PG'],
    },
    'Telangana Entrance Exams': {
      'Professional Courses': ['TSEAMCET', 'TS PGECET', 'TSCHE', 'TS LAWCET', 'TS PGLCET', 'TS ICET', 'TS EDCET', 'TS DEECET'],
      'Class 6-10 Entrance Exams': ['TS Model Schools Entrance Exam', 'Kakatiya Mentoring Schools Entrance Test', 'Telangana Social Welfare Residential Schools Entrance', 'Telangana Tribal Welfare Residential Schools Entrance', 'Jawahar Navodaya Vidyalaya (JNV) Selection Test'],
      'Class 11/Intermediate Entrance Exams': ['TS Residential Junior Colleges Entrance Exam', 'TS Social Welfare Residential Junior Colleges', 'TS Tribal Welfare Residential Junior Colleges'],
      'Specialized Schools': ['TS Sports School Entrance Test', 'Gurukul Schools Entrance Exam'],
    },
    'National Level Entrance Tests': ['Jawahar Navodaya Vidyalaya Selection Test (JNVST)', 'Sainik School Entrance Exam', 'Rashtriya Indian Military College (RIMC)', 'Atomic Energy Central Schools (AECS)', 'JEE (Main) Preparation Tests', 'Kishore Vaigyanik Protsahan Yojana (KVPY)'],
    'Scholarship & Ability Tests': ['NMMS', 'GeoGenius', 'ISTSE', 'Ramanujan Math Talent Search Exam'],
    'Technology': {
      'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin'],
      'Full Stack': ['MERN Stack', 'MEAN Stack', 'LAMP Stack', 'Django', 'Ruby on Rails'],
      'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle'],
      'Mobile Development': ['React Native', 'Flutter', 'iOS Development', 'Android Development'],
      'AI': ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
      'Testing': ['Selenium', 'Jest', 'Cypress', 'JUnit'],
      'Cloud Computing': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
    },
  };

  const toggleCourse = (courseId: string) => {
    setForm(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Filter courses based on search
  const filteredCourseCategories = useMemo(() => {
    if (!courseSearch.trim()) {
      return courseCategories;
    }
    
    const searchLower = courseSearch.toLowerCase();
    const filtered: Record<string, any> = {};
    
    Object.entries(courseCategories).forEach(([category, options]) => {
      if (category.toLowerCase().includes(searchLower)) {
        filtered[category] = options;
      } else if (Array.isArray(options)) {
        const matchingOptions = options.filter(opt => opt.toLowerCase().includes(searchLower));
        if (matchingOptions.length > 0) {
          filtered[category] = matchingOptions;
        }
      } else {
        // It's an object with subcategories
        const matchingSubcats: any = {};
        Object.entries(options).forEach(([subCat, subOpts]) => {
          if (subCat.toLowerCase().includes(searchLower)) {
            matchingSubcats[subCat] = subOpts;
          } else {
            const matchingOpts = (subOpts as string[]).filter(opt => opt.toLowerCase().includes(searchLower));
            if (matchingOpts.length > 0) {
              matchingSubcats[subCat] = matchingOpts;
            }
          }
        });
        if (Object.keys(matchingSubcats).length > 0) {
          filtered[category] = matchingSubcats;
        }
      }
    });
    
    return filtered;
  }, [courseSearch, courseCategories]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Completion Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
              <p className="text-sm text-gray-600">Complete your profile to unlock all features</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{profileCompletion}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                profileCompletion === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                profileCompletion >= 70 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                profileCompletion >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-400 to-pink-500'
              }`}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {profileCompletion < 70 && (
            <p className="text-xs text-gray-500 mt-2">
              Complete at least 70% of your profile to attempt quizzes
            </p>
            )}
          </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {(['personal', 'contact', 'address', 'academic', 'courses'] as ProfileTab[]).map((tab) => (
                      <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
              ))}
            </nav>
                    </div>

          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  {form.profilePicture ? (
                    <img src={form.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-3xl">
                      {form.firstName?.[0]?.toUpperCase() || form.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                  <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                      {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                      <input type="file" className="hidden" accept="image/*" onChange={handlePictureUpload} disabled={uploadingPicture} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (MAX. 10MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name (as per DOB certificate) *</label>
                  <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.firstName}
                      onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.lastName}
                      onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.gender}
                      onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father/Mother/Guardian Name *</label>
                  <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.guardianName}
                      onChange={(e) => setForm(prev => ({ ...prev, guardianName: e.target.value }))}
                      required
                  />
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.guardianRelation}
                      onChange={(e) => setForm(prev => ({ ...prev, guardianRelation: e.target.value }))}
                      required
                    >
                      <option value="">Select Relation</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                    </select>
              </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email ID *</label>
                  <input
                      type="email"
                      className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                      value={form.email}
                      readOnly
                    />
                    {user.verification?.emailVerified && (
                      <span className="text-xs text-green-600 mt-1 block">✓ Verified</span>
                    )}
                </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                      type="tel"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      required
                  />
                </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile Number</label>
                  <input
                      type="tel"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.alternateMobile}
                      onChange={(e) => setForm(prev => ({ ...prev, alternateMobile: e.target.value }))}
                      placeholder="+91 9876543210"
                  />
                </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <div className="flex items-center gap-2 mb-2">
                  <input
                        type="checkbox"
                        checked={form.whatsappSameAsMobile}
                        onChange={(e) => setForm(prev => ({ ...prev, whatsappSameAsMobile: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">Same as mobile number</span>
                </div>
                    <input
                      type="tel"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                      placeholder="+91 9876543210"
                      disabled={form.whatsappSameAsMobile}
                    />
              </div>
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
                
                {/* Present Address */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Present / Current Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">House No / Street</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentHouseNo}
                        onChange={(e) => setForm(prev => ({ ...prev, presentHouseNo: e.target.value }))}
                />
              </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                  <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentArea}
                        onChange={(e) => setForm(prev => ({ ...prev, presentArea: e.target.value }))}
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
                  <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentCity}
                        onChange={(e) => setForm(prev => ({ ...prev, presentCity: e.target.value }))}
                        required
                  />
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentDistrict}
                        onChange={(e) => setForm(prev => ({ ...prev, presentDistrict: e.target.value }))}
                      />
              </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentState}
                        onChange={(e) => setForm(prev => ({ ...prev, presentState: e.target.value }))}
                        required
                      />
              </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentPinCode}
                        onChange={(e) => setForm(prev => ({ ...prev, presentPinCode: e.target.value }))}
                        required
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.presentCountry}
                        onChange={(e) => setForm(prev => ({ ...prev, presentCountry: e.target.value }))}
                        required
                      />
                    </div>
                </div>
              </div>

                {/* Permanent Address */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={form.sameAsPresentAddress}
                      onChange={(e) => setForm(prev => ({ ...prev, sameAsPresentAddress: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-medium text-gray-700">Same as Present Address</label>
                </div>
                  <h4 className="font-semibold text-gray-900 mb-4">Permanent Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">House No / Street</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentHouseNo}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentHouseNo: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentArea}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentArea: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentCity}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentCity: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                        required
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentDistrict}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentDistrict: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentState}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentState: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                        required
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentPinCode}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentPinCode: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                        required
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.permanentCountry}
                        onChange={(e) => setForm(prev => ({ ...prev, permanentCountry: e.target.value }))}
                        disabled={form.sameAsPresentAddress}
                        required
                      />
                </div>
                </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Academic / Qualification Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Qualification *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.currentQualification}
                      onChange={(e) => setForm(prev => ({ ...prev, currentQualification: e.target.value }))}
                      required
                    >
                      <option value="">Select Qualification</option>
                      <optgroup label="School">
                        <option value="school_3">Class 3</option>
                        <option value="school_4">Class 4</option>
                        <option value="school_5">Class 5</option>
                        <option value="school_6">Class 6</option>
                        <option value="school_7">Class 7</option>
                        <option value="school_8">Class 8</option>
                        <option value="school_9">Class 9</option>
                        <option value="school_10">Class 10</option>
                      </optgroup>
                      <optgroup label="Intermediate">
                        <option value="inter_mpc">MPC</option>
                        <option value="inter_bipc">BIPC</option>
                        <option value="inter_cec">CEC</option>
                        <option value="inter_others">Others</option>
                      </optgroup>
                      <optgroup label="Diploma">
                        <option value="diploma_ece">ECE</option>
                        <option value="diploma_eee">EEE</option>
                        <option value="diploma_cse">CSE</option>
                        <option value="diploma_mech">MECH</option>
                        <option value="diploma_civil">CIVIL</option>
                        <option value="diploma_others">Others</option>
                      </optgroup>
                      <optgroup label="Undergraduate">
                        <option value="ug_btech">B.Tech</option>
                        <option value="ug_bsc">B.Sc</option>
                        <option value="ug_ba">BA</option>
                        <option value="ug_bcom">B.COM</option>
                        <option value="ug_bba">BBA</option>
                        <option value="ug_others">Others</option>
                      </optgroup>
                      <optgroup label="Postgraduate">
                        <option value="pg_mtech">M.Tech</option>
                        <option value="pg_msc">M.Sc</option>
                        <option value="pg_ma">MA</option>
                        <option value="pg_mcom">M.COM</option>
                        <option value="pg_mba">MBA</option>
                        <option value="pg_others">Others</option>
                      </optgroup>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School/College/Institution Name *</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.institutionName}
                      onChange={(e) => setForm(prev => ({ ...prev, institutionName: e.target.value }))}
                      required
                    />
                </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.university}
                      onChange={(e) => setForm(prev => ({ ...prev, university: e.target.value }))}
                    />
        </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.yearOfStudy}
                      onChange={(e) => setForm(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                    >
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
              </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Passing Year</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.expectedPassingYear}
                      onChange={(e) => setForm(prev => ({ ...prev, expectedPassingYear: e.target.value }))}
                      min="1900"
                      max="2100"
                />
              </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Type</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.gradeType}
                      onChange={(e) => setForm(prev => ({ ...prev, gradeType: e.target.value }))}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="cgpa">CGPA</option>
                    </select>
            </div>

                  {form.gradeType === 'percentage' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.percentage}
                        onChange={(e) => setForm(prev => ({ ...prev, percentage: e.target.value }))}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.cgpa}
                        onChange={(e) => setForm(prev => ({ ...prev, cgpa: e.target.value }))}
                        min="0"
                        max="10"
                        step="0.01"
                      />
                </div>
              )}
              </div>
            </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Courses for Practice</h3>
                  <p className="text-sm text-gray-600 mb-4">Select the courses you want to practice. Quizzes will be shown based on your selections.</p>
                  
                  {/* Search Bar */}
            <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                    />
              </div>
              </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {Object.entries(filteredCourseCategories).map(([category, options]) => {
                    const isExpanded = expandedCategories.has(category);
                    const categorySelectedCount = Array.isArray(options)
                      ? options.filter(opt => form.selectedCourses.includes(`${category}_${opt}`)).length
                      : Object.entries(options).reduce((count, [subCat, subOpts]) => {
                          return count + (subOpts as string[]).filter(opt => 
                            form.selectedCourses.includes(`${category}_${subCat}_${opt}`)
                          ).length;
                        }, 0);
                    const categoryTotalCount = Array.isArray(options)
                      ? options.length
                      : Object.values(options).reduce((sum: number, subOpts) => sum + (subOpts as string[]).length, 0);
                    
                    return (
                      <div key={category} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        {/* Category Header - Clickable */}
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
            </div>
                            <h4 className="font-semibold text-gray-900 text-left">{category}</h4>
                            {categorySelectedCount > 0 && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {categorySelectedCount}/{categoryTotalCount} selected
                </span>
                            )}
              </div>
                          <span className="text-sm text-gray-500">{categoryTotalCount} courses</span>
                        </button>
                        
                        {/* Category Content - Collapsible */}
                        {isExpanded && (
                          <div className="border-t bg-gray-50 p-4">
                            {Array.isArray(options) ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {options.map((option) => {
                                  const courseId = `${category}_${option}`;
                                  const isSelected = form.selectedCourses.includes(courseId);
                                  return (
                                    <label
                                      key={courseId}
                                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleCourse(courseId)}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                      />
                                      <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                                        {option}
                                      </span>
                                    </label>
                                  );
                                })}
              </div>
                            ) : (
                              <div className="space-y-4">
                                {Object.entries(options).map(([subCategory, subOptions]) => {
                                  const subSelectedCount = (subOptions as string[]).filter(opt => 
                                    form.selectedCourses.includes(`${category}_${subCategory}_${opt}`)
                                  ).length;
                                  
                                  return (
                                    <div key={subCategory} className="bg-white rounded-lg p-4 border border-gray-200">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium text-gray-800">{subCategory}</h5>
                                        {subSelectedCount > 0 && (
                                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {subSelectedCount} selected
                                          </span>
                                        )}
            </div>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {(subOptions as string[]).map((option) => {
                                          const courseId = `${category}_${subCategory}_${option}`;
                                          const isSelected = form.selectedCourses.includes(courseId);
                                          return (
                                            <label
                                              key={courseId}
                                              className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                isSelected
                                                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleCourse(courseId)}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                              />
                                              <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                                                {option}
                </span>
                                            </label>
                                          );
                                        })}
              </div>
              </div>
                                  );
                                })}
            </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
          </div>

                {/* Selected Courses Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 sticky bottom-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-900">
                        {form.selectedCourses.length} course(s) selected
                      </p>
                      {form.selectedCourses.length > 0 && (
                        <p className="text-xs text-purple-700 mt-1">
                          Your quizzes will be filtered based on these selections
                        </p>
                      )}
              </div>
                    {form.selectedCourses.length > 0 && (
                      <button
                        onClick={() => setForm(prev => ({ ...prev, selectedCourses: [] }))}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Clear All
                      </button>
                    )}
            </div>
              </div>
            </div>
            )}
              </div>
            </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
        </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
