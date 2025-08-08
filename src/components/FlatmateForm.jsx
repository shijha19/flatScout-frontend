import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      await axios.post(`/api/flatmates/profile/${form.userId}`, {
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
        await axios.put('/api/user/preferences-completed', {
          email: userEmail
        });
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
    <>
      {isNewUser && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-center py-4 mb-6">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">
              {fromSource === 'signup' && '🎉 Welcome to FlatScout!'}
              {fromSource === 'login' && '👋 Complete Your Profile!'}
              {fromSource === 'oauth' && '🎉 Welcome to FlatScout!'}
              {fromSource === 'landing' && '🏠 Let\'s Set You Up!'}
              {!fromSource && '👋 Complete Your Profile!'}
            </h2>
            <p className="text-lg">
              {fromSource === 'signup' && 'Just one more step - complete your profile to find amazing flatmates!'}
              {fromSource === 'login' && 'Complete your flatmate preferences to access all features!'}
              {fromSource === 'oauth' && 'Complete your profile to start finding compatible flatmates!'}
              {fromSource === 'landing' && 'Set up your preferences to unlock personalized flatmate matching!'}
              {!fromSource && 'Set up your preferences to start finding compatible flatmates!'}
            </p>
            <div className="mt-3 flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-white/70 rounded-full"></div>
                <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                <span className="text-white/90 ml-2">
                  {fromSource === 'signup' ? 'Step 2 of 2' : 'Almost there!'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-8 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 rounded-2xl shadow-2xl mt-10 border border-pink-100">
        <h2 className="text-2xl font-extrabold mb-2 text-center text-blue-700 drop-shadow">
          {isNewUser ? "Set Up Your Flatmate Profile" : "Edit Flatmate Preferences"}
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          {isNewUser 
            ? "Help us match you with compatible flatmates by sharing your preferences and lifestyle!" 
            : "Update your preferences to find better flatmate matches!"
          }
        </p>
      <form onSubmit={submitForm} className="flex flex-col gap-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-lg font-semibold text-pink-700 mb-2">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Age" min="16" max="100" required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Occupation</label>
              <input type="text" name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Student, Engineer" required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Hometown/City</label>
              <input type="text" name="hometown" value={form.hometown} onChange={handleChange} placeholder="Hometown/City" required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Languages Spoken</label>
              <input type="text" name="languages" value={form.languages} onChange={handleChange} placeholder="e.g. English, Hindi" required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Food Preference</label>
              <select name="foodPreference" value={form.foodPreference} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="">Food Preference</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Social Preference</label>
              <select name="socialPreference" value={form.socialPreference} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="">Social Preference</option>
                <option value="Introvert">Introvert</option>
                <option value="Extrovert">Extrovert</option>
                <option value="Ambivert">Ambivert</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Hobbies/Interests</label>
              <input type="text" name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="e.g. Reading, Music, Sports" className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </div>
        <hr className="my-2 border-pink-200" />
        {/* Lifestyle & Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-pink-700 mb-2">Lifestyle & Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Work/Study From</label>
              <select name="workMode" value={form.workMode} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="">Work/Study From</option>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="College">College</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Relationship Status</label>
              <select name="relationshipStatus" value={form.relationshipStatus} onChange={handleChange} className="w-full rounded border px-3 py-2">
                <option value="">Relationship Status</option>
                <option value="Single">Single</option>
                <option value="In a Relationship">In a Relationship</option>
                <option value="Married">Married</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Music Preference</label>
              <input type="text" name="musicPreference" value={form.musicPreference} onChange={handleChange} placeholder="Music Preference (optional)" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Guest Policy</label>
              <select name="guestPolicy" value={form.guestPolicy} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="">Guest Policy</option>
                <option value="Comfortable">Comfortable with guests</option>
                <option value="Not Comfortable">Not comfortable with guests</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Wake-up Time</label>
              <input type="time" name="wakeupTime" value={form.wakeupTime} onChange={handleChange} className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Bedtime</label>
              <input type="time" name="bedtime" value={form.bedtime} onChange={handleChange} className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </div>
        <hr className="my-2 border-pink-200" />
        {/* Roommate Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-pink-700 mb-2">Roommate Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Preferred Roommate Gender</label>
              <select name="preferredGender" value={form.preferredGender} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="">Preferred Roommate Gender</option>
                <option value="Any">Any</option>
                <option value="Female">Only Girls</option>
                <option value="Male">Only Boys</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Budget (INR)</label>
              <input type="number" name="budget" value={form.budget} onChange={handleChange} placeholder="Budget (INR)" required className="w-full rounded border px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Location Preference</label>
              <input type="text" name="locationPreference" value={form.locationPreference} onChange={handleChange} placeholder="Location Preference" required className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </div>
        <hr className="my-2 border-pink-200" />
        {/* Habits */}
        <div>
          <h3 className="text-lg font-semibold text-pink-700 mb-2">Habits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Smoking</label>
              <select name="smoking" value={form.habits.smoking} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="No">Non-Smoker</option>
                <option value="Yes">Smoker</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Pets</label>
              <select name="pets" value={form.habits.pets} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="No">No Pets</option>
                <option value="Yes">Has Pets</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Sleep Time</label>
              <select name="sleepTime" value={form.habits.sleepTime} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="Early">Early Sleeper</option>
                <option value="Late">Late Sleeper</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Cleanliness</label>
              <select name="cleanliness" value={form.habits.cleanliness} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                <option value="Low">Low Cleanliness</option>
                <option value="Medium">Medium Cleanliness</option>
                <option value="High">High Cleanliness</option>
              </select>
            </div>
          </div>
        </div>
        <hr className="my-2 border-pink-200" />
        {/* Bio */}
        <div>
          <h3 className="text-lg font-semibold text-pink-700 mb-2">About You</h3>
          <label className="block text-gray-700 font-medium mb-1">Short Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself in a few sentences..." rows={3} required className="w-full rounded border px-3 py-2" />
        </div>
        {error && <div className="text-red-500 text-center font-medium">{error}</div>}
        {success && <div className="text-green-600 text-center font-medium">
          {isNewUser ? "🎉 Profile completed! You're now listed as a potential flatmate!" : "Preferences saved!"}
        </div>}
        <button type="submit" className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-3 rounded-full mt-2 font-bold shadow hover:from-orange-500 hover:to-pink-600 transition-all text-lg">
          {isNewUser ? "🚀 Complete Profile & Find Flatmates" : "💾 Save Preferences"}
        </button>
        {isNewUser && (
          <p className="text-sm text-gray-600 text-center mt-3">
            After completing your profile, you'll be able to browse and connect with potential flatmates!
          </p>
        )}
      </form>
      </div>
    </>
  );
}
