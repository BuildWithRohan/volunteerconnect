import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNeedById, updateNeed } from "../../services/needsService";
import { getTaskById, completeTask } from "../../services/tasksService";
import { incrementTasksCompleted } from "../../services/volunteersService";
import VolunteerBottomNav from "../../components/layout/VolunteerBottomNav";
import UrgencyBadge from "../../components/common/UrgencyBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, User, CheckCircle, Phone, Mail, Loader2, Building, ClipboardCheck } from "lucide-react";

// Fix default Leaflet marker icon
const getUrgencyIcon = (score) => {
  const color = score >= 8 ? "#FF4D8D" : score >= 4 ? "#FFD046" : "#2DCB73";
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color:${color}; width:30px; height:30px; border-radius:50% 50% 50% 0; transform: rotate(-45deg); border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center;">
             <div style="width:12px; height:12px; background-color:white; border-radius:50%; transform: rotate(45deg);"></div>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [need, setNeed] = useState(location.state?.need || null);
  const [task, setTask] = useState(location.state?.task || null);
  const [loading, setLoading] = useState(!need && !task);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (task && !need) {
        const needData = await getNeedById(task.needId);
        setNeed(needData);
      } else if (!task && !need) {
        const taskData = await getTaskById(id);
        if (taskData) {
          setTask(taskData);
          const needData = await getNeedById(taskData.needId);
          setNeed(needData);
        } else {
          const needData = await getNeedById(id);
          setNeed(needData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      if (task) {
        await completeTask(task.id);
        await incrementTasksCompleted(user.uid);
        await updateNeed(task.needId, { status: "resolved" });
      }
      setCompleted(true);
      setTimeout(() => navigate("/volunteer/home"), 2000);
    } catch (err) {
      console.error("Complete failed:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <VolunteerBottomNav>
        <LoadingSpinner text="Loading task details..." />
      </VolunteerBottomNav>
    );
  }

  if (completed) {
    return (
      <VolunteerBottomNav>
        <div style={{ textAlign: "center", padding: "80px 0", animation: "fadeUp 0.5s ease-out" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#E6F9EE", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <CheckCircle size={40} color="#2DCB73" />
          </div>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: "#1A1A2E", marginBottom: 8 }}>
            Task Completed! 🎉
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#6B7280" }}>
            Great work! Redirecting...
          </p>
        </div>
      </VolunteerBottomNav>
    );
  }

  const categoryIcons = { food: "🍱", medical: "🏥", shelter: "🏠", education: "📚" };

  return (
    <VolunteerBottomNav>
      <div id="task-detail-page" style={{ animation: "fadeUp 0.35s ease-out" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", marginBottom: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 14,
            color: "#6B7280",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Need details card */}
        <div style={{
          background: "white", borderRadius: 20, padding: 24,
          boxShadow: "0 4px 24px rgba(107,78,255,0.10)", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>{categoryIcons[need?.category] || "📋"}</span>
              <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, color: "#1A1A2E", textTransform: "capitalize" }}>
                {need?.category} Need
              </h2>
            </div>
            <UrgencyBadge score={need?.urgencyScore || 5} />
          </div>

          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "#1A1A2E", lineHeight: 1.7, marginBottom: 16 }}>
            {need?.description}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 14px", borderRadius: 999, background: "#EDE9FF", color: "#6B4EFF",
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 13,
            }}>
              <MapPin size={14} /> {need?.locationName || "Unknown"}
            </span>
            {task?.status && (
              <span style={{
                padding: "4px 12px", borderRadius: 999,
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 11,
                textTransform: "uppercase",
                ...(task.status === "accepted" ? { background: "#EDE9FF", color: "#6B4EFF" } :
                   task.status === "done" ? { background: "#E6F9EE", color: "#2DCB73" } :
                   { background: "#FFF0EA", color: "#FF6B35" }),
              }}>
                {task.status}
              </span>
            )}
          </div>
        </div>

        {/* Map */}
        {need?.lat && need?.lng && (
          <div style={{
            background: "white", borderRadius: 20,
            boxShadow: "0 4px 24px rgba(107,78,255,0.10)",
            overflow: "hidden", marginBottom: 16, height: 200,
          }}>
            <MapContainer
              center={[need.lat, need.lng]}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[need.lat, need.lng]} icon={getUrgencyIcon(need?.urgencyScore || 5)}>
                <Popup>{need.locationName}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Requirements */}
        {need?.requirements && (
          <div style={{
            background: "white", borderRadius: 20, padding: 24,
            boxShadow: "0 4px 24px rgba(107,78,255,0.10)", marginBottom: 16,
          }}>
            <h3 style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16,
              color: "#1A1A2E", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <ClipboardCheck size={16} color="#6B4EFF" /> Specific Requirements
            </h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
              {need.requirements}
            </p>
          </div>
        )}

        {/* Contact Person */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{
            background: "white", borderRadius: 20, padding: 24,
            boxShadow: "0 4px 24px rgba(107,78,255,0.10)",
          }}>
            <h3 style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16,
              color: "#1A1A2E", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <User size={16} color="#6B4EFF" /> On-site Contact
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#1A1A2E", fontWeight: 600 }}>
                {need?.contactPerson || "NGO Coordinator"}
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280" }}>
                <Phone size={16} color="#9CA3AF" /> {need?.contactPhone ? `+91 ${need.contactPhone}` : "+91 98765 43210"}
              </p>
            </div>
          </div>

          <div style={{
            background: "white", borderRadius: 20, padding: 24,
            boxShadow: "0 4px 24px rgba(107,78,255,0.10)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <h3 style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16,
              color: "#1A1A2E", marginBottom: 0,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <FileText size={16} color="#6B4EFF" /> Documents
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {need?.photoURL ? (
                <a href={need.photoURL} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  padding: "8px 12px", background: "#F3F4F6", borderRadius: 10,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#1A1A2E", fontWeight: 500,
                }}>
                  <ImageIcon size={14} color="#6B4EFF" /> View Need Photo
                </a>
              ) : (
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>No photo uploaded</p>
              )}
              {need?.surveyURL ? (
                <a href={need.surveyURL} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  padding: "8px 12px", background: "#EDE9FF", borderRadius: 10,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#6B4EFF", fontWeight: 600,
                }}>
                  <FileUp size={14} color="#6B4EFF" /> Download Survey PDF
                </a>
              ) : (
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>No survey PDF</p>
              )}
            </div>
          </div>
        </div>

        {/* Complete button */}
        {task && (task.status === "accepted" || task.status === "pending") && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="btn-accent"
            id="complete-task-btn"
            style={{ width: "100%", height: 52, borderRadius: 12 }}
          >
            {completing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><CheckCircle size={18} /> Mark as Complete</>
            )}
          </button>
        )}
      </div>
    </VolunteerBottomNav>
  );
}
