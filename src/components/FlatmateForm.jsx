import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiMethods } from "../utils/api";

export default function FlatmateForm() {
  const [form, setForm] = useState({
    userId: "",
    userEmail: "",
    name: "",
    photoUrl: "",
    gender: "",
    age: "",
    occupation: "",
    hometown: "",
    languages: "",
    foodPreference: "",
    socialPreference: "",
    hobbies: "",
    workMode: "",
    relationshipStatus: "",
    musicPreference: "",
    guestPolicy: "",
    wakeupTime: "",
    bedtime: "",
    preferredGender: "",
    budget: "",
    locationPreference: "",
    habits: {
      smoking: "No",
      pets: "No",
      sleepTime: "Early",
      cleanliness: "Medium"
    },
    bio: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [fromSource, setFromSource] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let userId = localStorage.getItem("userId");
    const name = localStorage.getItem("name") || "";
    const userEmail = localStorage.getItem("userEmail") || "";
    
    // Check if this is a new user (just signed up)
    const urlParams = new URLSearchParams(window.location.search);
    const fromSource = urlParams.get('from');
    const fromSignup = fromSource === 'signup' || !localStorage.getItem('hasCompletedPreferences');
    setIsNewUser(fromSignup);
    setFromSource(fromSource || '');
    
    // Only fall back to email as userId if userId is completely missing
    // This prevents mixing ObjectId and email formats
    if (!userId && userEmail) {
      console.warn("No userId found, using email as fallback. This may cause connection issues.");
      userId = userEmail;
    }
    
    if (userId) setForm(f => ({ ...f, userId, name, userEmail }));
    // Optionally fetch existing profile here
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["smoking", "pets", "sleepTime", "cleanliness"].includes(name)) {
      setForm({ ...form, habits: { ...form.habits, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.userId) {
      setError("User ID missing. Please log in again.");
      return;
    }
    try {
      // Save flatmate profile
      await apiMethods.flatmate.createProfile(form.userId, {
        ...form,
        userEmail: form.userEmail || localStorage.getItem("userEmail") || "",
        age: Number(form.age),
        budget: Number(form.budget),
        languages: form.languages.split(',').map(l => l.trim()),
        hobbies: form.hobbies.split(',').map(h => h.trim()),
        name: form.name || localStorage.getItem("name") || "User",
      });

      // Mark user as having completed preferences in the database
      const userEmail = form.userEmail || localStorage.getItem("userEmail");
      if (userEmail) {
        await apiMethods.user.markPreferencesCompleted(userEmail);
      }

      setSuccess(true);
      // Mark that user has completed preferences in localStorage
      localStorage.setItem('hasCompletedPreferences', 'true');
      
      setTimeout(() => {
        setSuccess(false);
        if (isNewUser) {
          // For new users, redirect to home page
          navigate("/", { replace: true });
        } else {
          // For existing users editing preferences, go back to find flatmate page
          navigate("/find-flatmate", { replace: true });
        }
      }, 2000); // Increased delay to show success message longer
    } catch (err) {
      setError("Could not save preferences");
      console.error("Save error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {isNewUser && (
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-3">
                {fromSource === 'signup' && 'Welcome to FlatScout!'}
                {fromSource === 'login' && 'Complete Your Profile'}
                {fromSource === 'oauth' && 'Welcome to FlatScout!'}
                {fromSource === 'landing' && 'Let\'s Set You Up'}
                {!fromSource && 'Complete Your Profile'}
              </h2>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                {fromSource === 'signup' && 'Complete your profile to unlock personalized flatmate matching and connect with compatible roommates'}
                {fromSource === 'login' && 'Set up your preferences to access all features and find your perfect flatmate'}
                {fromSource === 'oauth' && 'Complete your profile to start finding compatible flatmates in your area'}
                {fromSource === 'landing' && 'Set up your preferences to unlock personalized flatmate matching'}
                {!fromSource && 'Set up your preferences to start finding compatible flatmates'}
              </p>
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-6 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
                <span className="text-blue-100 text-sm font-medium">
                  {fromSource === 'signup' ? 'Step 2 of 2' : 'Almost there!'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          {!isNewUser && (
            <div className="px-8 pt-8 pb-6 border-b border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Edit Flatmate Preferences
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Update your preferences to find better flatmate matches
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-8">
      <form onSubmit={submitForm} className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter your full name" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Gender *</label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select your gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Age *</label>
              <input 
                type="number" 
                name="age" 
                value={form.age} 
                onChange={handleChange} 
                placeholder="Your age" 
                min="16" 
                max="100" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Occupation *</label>
              <input 
                type="text" 
                name="occupation" 
                value={form.occupation} 
                onChange={handleChange} 
                placeholder="e.g., Student, Software Engineer" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Hometown/City *</label>
              <input 
                type="text" 
                name="hometown" 
                value={form.hometown} 
                onChange={handleChange} 
                placeholder="Your hometown or current city" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Languages Spoken *</label>
              <input 
                type="text" 
                name="languages" 
                value={form.languages} 
                onChange={handleChange} 
                placeholder="e.g., English, Hindi, Spanish" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Food Preference *</label>
              <select 
                name="foodPreference" 
                value={form.foodPreference} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select food preference</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Social Preference *</label>
              <select 
                name="socialPreference" 
                value={form.socialPreference} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select social preference</option>
                <option value="Introvert">Introvert</option>
                <option value="Extrovert">Extrovert</option>
                <option value="Ambivert">Ambivert</option>
              </select>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Hobbies & Interests</label>
              <input 
                type="text" 
                name="hobbies" 
                value={form.hobbies} 
                onChange={handleChange} 
                placeholder="e.g., Reading, Music, Sports, Gaming, Cooking" 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
              <p className="text-xs text-slate-500">Separate multiple hobbies with commas</p>
            </div>
          </div>
        </div>

        {/* Lifestyle & Preferences Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Lifestyle & Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Work/Study Mode *</label>
              <select 
                name="workMode" 
                value={form.workMode} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select work/study mode</option>
                <option value="Home">Work/Study from Home</option>
                <option value="Office">Work from Office</option>
                <option value="College">Study at College</option>
                <option value="Hybrid">Hybrid (Mix of both)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Relationship Status</label>
              <select 
                name="relationshipStatus" 
                value={form.relationshipStatus} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select relationship status</option>
                <option value="Single">Single</option>
                <option value="In a Relationship">In a Relationship</option>
                <option value="Married">Married</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Music Preference</label>
              <input 
                type="text" 
                name="musicPreference" 
                value={form.musicPreference} 
                onChange={handleChange} 
                placeholder="e.g., Pop, Rock, Classical, Hip-hop" 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Guest Policy *</label>
              <select 
                name="guestPolicy" 
                value={form.guestPolicy} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select guest policy</option>
                <option value="Comfortable">Comfortable with guests</option>
                <option value="Not Comfortable">Not comfortable with guests</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Wake-up Time</label>
              <input 
                type="time" 
                name="wakeupTime" 
                value={form.wakeupTime} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Bedtime</label>
              <input 
                type="time" 
                name="bedtime" 
                value={form.bedtime} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
        {/* Roommate Preferences Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Roommate Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Preferred Roommate Gender *</label>
              <select 
                name="preferredGender" 
                value={form.preferredGender} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">Select preference</option>
                <option value="Any">No Preference</option>
                <option value="Female">Female Only</option>
                <option value="Male">Male Only</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Budget Range (INR) *</label>
              <input 
                type="number" 
                name="budget" 
                value={form.budget} 
                onChange={handleChange} 
                placeholder="e.g., 15000" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
              <p className="text-xs text-slate-500">Monthly budget for accommodation</p>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Location Preference *</label>
              <input 
                type="text" 
                name="locationPreference" 
                value={form.locationPreference} 
                onChange={handleChange} 
                placeholder="e.g., Koramangala, Indiranagar, Near IT corridor" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
              <p className="text-xs text-slate-500">Preferred areas or neighborhoods</p>
            </div>
          </div>
        </div>

        {/* Habits & Lifestyle Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Habits & Lifestyle</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Smoking *</label>
              <select 
                name="smoking" 
                value={form.habits.smoking} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="No">Non-Smoker</option>
                <option value="Yes">Smoker</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Pets *</label>
              <select 
                name="pets" 
                value={form.habits.pets} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="No">No Pets</option>
                <option value="Yes">Has Pets</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Sleep Schedule *</label>
              <select 
                name="sleepTime" 
                value={form.habits.sleepTime} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="Early">Early Sleeper (Before 11 PM)</option>
                <option value="Late">Late Sleeper (After 11 PM)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Cleanliness Level *</label>
              <select 
                name="cleanliness" 
                value={form.habits.cleanliness} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              >
                <option value="Low">Relaxed about cleanliness</option>
                <option value="Medium">Moderately clean</option>
                <option value="High">Very clean and organized</option>
              </select>
            </div>
          </div>
        </div>

        {/* About You Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">About You</h3>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Personal Bio *</label>
            <textarea 
              name="bio" 
              value={form.bio} 
              onChange={handleChange} 
              placeholder="Tell potential flatmates about yourself. What makes you a great roommate? What are your interests? What kind of living environment do you prefer?" 
              rows={4} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
            />
            <p className="text-xs text-slate-500">Write a brief description about yourself (minimum 50 characters)</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-green-800 font-medium">
                {isNewUser ? "🎉 Profile completed! You're now ready to find compatible flatmates!" : "✅ Preferences saved successfully!"}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200">
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-4 focus:ring-indigo-500/50 focus:outline-none"
          >
            <span className="flex items-center justify-center space-x-2">
              {isNewUser ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Complete Profile & Start Matching</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                  </svg>
                  <span>Save Preferences</span>
                </>
              )}
            </span>
          </button>
          
          {isNewUser && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <strong>What happens next?</strong> After completing your profile, you'll be able to browse through potential flatmates, send connection requests, and start chatting with matches!
              </p>
            </div>
          )}
        </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
}
