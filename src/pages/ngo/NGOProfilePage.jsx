import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToNGOProfile, updateNGOProfile } from "../../services/ngoService";
import NGOSidebar from "../../components/layout/NGOSidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { User, Edit3, Save, Loader2, MapPin, ArrowLeft, Mail, Phone, Building } from "lucide-react";

export default function NGOProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNGOProfile(user.uid, (data) => {
      setProfile(data);
      setEditData(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNGOProfile(user.uid, {
        name: editData.name,
        phone: editData.phone,
        locationName: editData.locationName,
        photoURL: editData.photoURL,
        organization: editData.organization,
      });
      setEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <NGOSidebar>
        <LoadingSpinner text="Loading profile..." />
      </NGOSidebar>
    );
  }

  const initials = profile?.name?.[0]?.toUpperCase() || "N";

  return (
    <NGOSidebar>
      <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.35s ease-out" }} id="ngo-profile-page">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "white", border: "1.5px solid #E5E7EB",
            padding: "8px 16px", borderRadius: 12, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600,
            color: "#6B7280", marginBottom: 24, transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6B4EFF"; e.currentTarget.style.color = "#6B4EFF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#6B7280"; }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        {/* ── Profile Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%)",
          borderRadius: 24,
          padding: "40px 32px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          color: "white",
          boxShadow: "0 8px 32px rgba(255,107,53,0.2)",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
            <div style={{
              width: 100, height: 100, borderRadius: 28,
              background: "white", border: "4px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0,
            }}>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 36, color: "#FF6B35" }}>
                  {initials}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <input
                  type="text"
                  className="input-field"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", fontWeight: 800, fontSize: 24, fontFamily: "'Nunito', sans-serif", width: "100%", padding: "8px 16px" }}
                  value={editData.name || ""}
                  onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                />
              ) : (
                <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 28, margin: 0 }}>
                  {profile?.name}
                </h1>
              )}
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Building size={16} /> {profile?.organization || "NGO Coordinator"}
              </p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12,
                padding: 10, cursor: "pointer", color: "white", display: "flex", transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            >
              <Edit3 size={20} />
            </button>
          </div>
        </div>

        {/* ── Content Card ── */}
        <div style={{
          background: "white", borderRadius: 24, padding: 32,
          boxShadow: "0 4px 24px rgba(107,78,255,0.06)",
        }}>
          <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18, color: "#1A1A2E", marginBottom: 24 }}>
            Organization Details
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {/* Organization Name */}
            <div>
              <label className="input-label">Organization Name</label>
              {editing ? (
                <input
                  type="text"
                  className="input-field"
                  value={editData.organization || ""}
                  onChange={(e) => setEditData((p) => ({ ...p, organization: e.target.value }))}
                  placeholder="e.g. Hope Foundation"
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F9FAFB", borderRadius: 12 }}>
                  <Building size={18} color="#FF6B35" />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#1A1A2E" }}>
                    {profile?.organization || "Not specified"}
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F9FAFB", borderRadius: 12, opacity: 0.7 }}>
                <Mail size={18} color="#6B7280" />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#6B7280" }}>
                  {profile?.email}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="input-label">Contact Number</label>
              {editing ? (
                <div style={{ position: "relative", display: "flex" }}>
                  <div style={{
                    position: "absolute", left: 1, top: 1, bottom: 1,
                    display: "flex", alignItems: "center", padding: "0 12px",
                    background: "#F3F4F6", borderRadius: "11px 0 0 11px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 500,
                    color: "#1A1A2E", borderRight: "1px solid #E5E7EB",
                  }}>
                    +91
                  </div>
                  <input
                    type="tel"
                    className="input-field"
                    style={{ paddingLeft: 72 }}
                    value={editData.phone || ""}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setEditData((p) => ({ ...p, phone: val }));
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F9FAFB", borderRadius: 12 }}>
                  <Phone size={18} color="#FF6B35" />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#1A1A2E" }}>
                    {profile?.phone ? `+91 ${profile.phone}` : "Not set"}
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="input-label">Operating Location</label>
              {editing ? (
                <input
                  type="text"
                  className="input-field"
                  value={editData.locationName || ""}
                  onChange={(e) => setEditData((p) => ({ ...p, locationName: e.target.value }))}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F9FAFB", borderRadius: 12 }}>
                  <MapPin size={18} color="#FF6B35" />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#1A1A2E" }}>
                    {profile?.locationName || "Global"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Image URL */}
          {editing && (
            <div style={{ marginTop: 24 }}>
              <label className="input-label">Profile Image URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://example.com/logo.jpg"
                value={editData.photoURL || ""}
                onChange={(e) => setEditData((p) => ({ ...p, photoURL: e.target.value }))}
              />
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                Tip: Use a direct link to your organization's logo image.
              </p>
            </div>
          )}

          {editing && (
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setEditing(false)}
                className="btn-outline"
                style={{ flex: 1, height: 48, borderRadius: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-accent"
                style={{ flex: 1, height: 48, borderRadius: 12, background: "#FF6B35" }}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </NGOSidebar>
  );
}
