import React, { useState } from "react";

const initialProfile = {
  name: "Amit Sharma",
  email: "amit.sharma@example.com",
  phone: "+91 9876543210",
  avatar: "",
};

const initialPreferences = {
  theme: "light",
  notifications: true,
  language: "English",
};

const Settings = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle preferences change
  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({
        ...prev,
        avatar: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle password change input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simulate save profile
  const handleProfileSave = (e) => {
    e.preventDefault();
    setMessage("Profile updated successfully!");
    setTimeout(() => setMessage(""), 2000);
  };

  // Simulate save preferences
  const handlePreferencesSave = (e) => {
    e.preventDefault();
    setMessage("Preferences saved!");
    setTimeout(() => setMessage(""), 2000);
  };

  // Simulate password update
  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setMessage("New passwords do not match.");
      return;
    }
    setMessage("Password updated successfully!");
    setPassword({ current: "", new: "", confirm: "" });
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-white py-10 px-0">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Settings
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Manage your profile, preferences, and account security.
        </p>

        {message && (
          <div className="mb-6 text-center text-green-600 font-semibold">
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Profile Information
          </h2>
          <form onSubmit={handleProfileSave}>
            <div className="flex items-center mb-6">
              <div className="mr-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-gray-400">
                      {profile.name[0]}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 text-sm"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Preferences
          </h2>
          <form onSubmit={handlePreferencesSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 mb-1">Theme</label>
                <select
                  name="theme"
                  value={preferences.theme}
                  onChange={handlePreferencesChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Language</label>
                <select
                  name="language"
                  value={preferences.language}
                  onChange={handlePreferencesChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center mt-2">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={preferences.notifications}
                  onChange={handlePreferencesChange}
                  className="mr-2"
                  id="notifications"
                />
                <label htmlFor="notifications" className="text-gray-600">
                  Enable Email Notifications
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition"
            >
              Save Preferences
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Change Password
          </h2>
          <form onSubmit={handlePasswordSave}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                  className="w-full border rounded px-3 py-2"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="new"
                  value={password.new}
                  onChange={handlePasswordChange}
                  className="w-full border rounded px-3 py-2"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  className="w-full border rounded px-3 py-2"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
