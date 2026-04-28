import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addNeed } from "../../services/needsService";
import { scoreUrgency } from "../../ai/urgencyScorer";
import NGOSidebar from "../../components/layout/NGOSidebar";
import UrgencyBadge from "../../components/common/UrgencyBadge";
import {
  FileText, MapPin, Tag, Send, Loader2, ArrowLeft, Sparkles,
} from "lucide-react";

const CATEGORIES = [
  { value: "food", label: "🍱 Food" },
  { value: "medical", label: "🏥 Medical" },
  { value: "shelter", label: "🏠 Shelter" },
  { value: "education", label: "📚 Education" },
];

export default function SubmitNeedPage() {
  const [formData, setFormData] = useState({
    description: "",
    category: "food",
    locationName: "",
    lat: "",
    lng: "",
    contactPerson: "",
    contactPhone: "",
    requirements: "",
  });
  const [urgencyScore, setUrgencyScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-score when description changes
    if (field === "description" && value.length > 10) {
      const score = scoreUrgency(value);
      setUrgencyScore(score);
    }
  };

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6)
          }));
        },
        null,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const score = scoreUrgency(formData.description);

      await addNeed({
        description: formData.description,
        category: formData.category,
        locationName: formData.locationName,
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0,
        urgencyScore: score,
        submittedByNGO: user?.uid || "unknown",
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        requirements: formData.requirements,
      });

      setSuccess(true);
      setTimeout(() => navigate("/ngo/dashboard"), 2000);
    } catch (err) {
      console.error("Failed to submit need:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <NGOSidebar>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "80px 0", animation: "fadeUp 0.5s ease-out" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "#E6F9EE",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
          }}>
            <Send size={36} color="#2DCB73" />
          </div>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: "#1A1A2E", marginBottom: 8 }}>
            Need Submitted! 🎉
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#6B7280", marginBottom: 4 }}>
            Urgency score: <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#FF6B35" }}>{urgencyScore}</span>
          </p>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>
            Redirecting to dashboard...
          </p>
        </div>
      </NGOSidebar>
    );
  }

  return (
    <NGOSidebar>
      <div style={{ maxWidth: 640, margin: "0 auto" }} id="submit-need-page">
        <button
          onClick={() => navigate("/ngo/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", marginBottom: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 14, color: "#6B7280",
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: "#1A1A2E", marginBottom: 4 }}>
          Submit New Need Report ✏️
        </h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "#6B7280", marginBottom: 32 }}>
          Describe a community need and our AI will assess its urgency
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white", borderRadius: 20, padding: 32,
            boxShadow: "0 4px 24px rgba(107,78,255,0.10)",
            display: "flex", flexDirection: "column", gap: 24,
          }}
        >
          {/* Description */}
          <div>
            <label className="input-label" htmlFor="need-description">
              <FileText size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
              Description
            </label>
            <textarea
              id="need-description"
              className="input-field"
              style={{ minHeight: 120, height: "auto", resize: "vertical" }}
              placeholder="Describe the community need in detail..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
            />
            {urgencyScore !== null && (
              <div style={{
                marginTop: 12, display: "flex", alignItems: "center", gap: 10,
                padding: 12, background: "#EDE9FF", borderRadius: 12,
                animation: "fadeUp 0.3s ease-out",
              }}>
                <Sparkles size={18} color="#6B4EFF" />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280" }}>
                  AI Urgency Score:
                </span>
                <UrgencyBadge score={urgencyScore} />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="input-label">
              <Tag size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
              Category
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => updateField("category", cat.value)}
                  style={{
                    padding: 14, borderRadius: 16, textAlign: "center", cursor: "pointer",
                    border: `2px solid ${formData.category === cat.value ? "#6B4EFF" : "#E5E7EB"}`,
                    background: formData.category === cat.value ? "#EDE9FF" : "white",
                    color: formData.category === cat.value ? "#6B4EFF" : "#6B7280",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 14,
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="input-label" htmlFor="need-location">
              <MapPin size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
              Location Name
            </label>
            <input
              id="need-location"
              type="text"
              className="input-field"
              placeholder="e.g., Dharavi, Mumbai"
              value={formData.locationName}
              onChange={(e) => updateField("locationName", e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="contact-person">Contact Person</label>
              <input id="contact-person" type="text" className="input-field" 
                placeholder="Name" value={formData.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)} required />
            </div>
            <div>
              <label className="input-label" htmlFor="contact-phone">Contact Phone</label>
              <input id="contact-phone" type="tel" className="input-field" 
                placeholder="10 digit number" value={formData.contactPhone}
                maxLength={10}
                onChange={(e) => updateField("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} required />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="specific-req">Specific Requirements</label>
            <textarea id="specific-req" className="input-field" style={{ minHeight: 80 }}
              placeholder="e.g., Must have a bike, should speak local language..." 
              value={formData.requirements}
              onChange={(e) => updateField("requirements", e.target.value)} />
          </div>

          {/* Location details handled automatically in background */}
          <div style={{ display: "none" }}>
            <input type="hidden" value={formData.lat} />
            <input type="hidden" value={formData.lng} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-accent"
            id="submit-need-btn" style={{ width: "100%", height: 52, borderRadius: 12 }}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Send size={18} /> Submit Need Report</>
            )}
          </button>
        </form>
      </div>
    </NGOSidebar>
  );
}
