import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { subscribeToOpenNeeds, updateNeed } from "../../services/needsService";
import { subscribeToVolunteerTasks, acceptTask, declineTask, createTask } from "../../services/tasksService";
import { incrementTasksAccepted } from "../../services/volunteersService";
import { getAllNGOs } from "../../services/ngoService";
import { matchNeedsToVolunteer } from "../../ai/volunteerMatcher";
import VolunteerBottomNav from "../../components/layout/VolunteerBottomNav";
import TaskCard from "../../components/common/TaskCard";
import NearbyMap from "../../components/common/NearbyMap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Sparkles, ClipboardList, MapPin } from "lucide-react";

/* ── Empty State Illustration ──────────────────────────── */
function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" style={{ width: 160, margin: "0 auto 16px" }}>
      <ellipse cx="100" cy="145" rx="70" ry="10" fill="#EDE9FF"/>
      <circle cx="100" cy="75" r="30" fill="#FDBCB4" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="80" y="105" width="40" height="35" rx="10" fill="#6B4EFF" stroke="#1A1A2E" strokeWidth="2"/>
      <circle cx="90" cy="72" r="3" fill="#1A1A2E"/>
      <circle cx="110" cy="72" r="3" fill="#1A1A2E"/>
      <path d="M92 82C92 82 100 86 108 82" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Binoculars */}
      <circle cx="86" cy="60" r="8" fill="#FFD046" stroke="#1A1A2E" strokeWidth="2"/>
      <circle cx="114" cy="60" r="8" fill="#FFD046" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="92" y="56" width="16" height="8" rx="3" fill="#1A1A2E"/>
      <circle cx="86" cy="60" r="4" fill="#1A1A2E"/>
      <circle cx="114" cy="60" r="4" fill="#1A1A2E"/>
      {/* Sparkles */}
      <path d="M50 50L52 55L57 56L52 58L50 63L48 58L43 56L48 55Z" fill="#FFD046" stroke="#1A1A2E" strokeWidth="0.5"/>
      <path d="M150 40L151 44L156 45L151 46L150 50L149 46L144 45L149 44Z" fill="#FF4D8D" stroke="#1A1A2E" strokeWidth="0.5"/>
    </svg>
  );
}

export default function VolunteerHome() {
  const [matchedNeeds, setMatchedNeeds] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("matches");
  const { user, volunteerProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const prevMatchIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);
  const [ngoMarkers, setNgoMarkers] = useState([]);

  // Subscribe to open needs and compute matches
  useEffect(() => {
    if (!volunteerProfile) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToOpenNeeds((needs) => {
      const matches = matchNeedsToVolunteer(volunteerProfile, needs);
      setMatchedNeeds(matches);
      setLoading(false);

      // Notify about NEW nearby needs (not on first load)
      if (!isFirstLoadRef.current) {
        const currentIds = new Set(matches.map((m) => m.need.id));
        const newNeedIds = [...currentIds].filter((id) => !prevMatchIdsRef.current.has(id));

        if (newNeedIds.length > 0) {
          const newMatch = matches.find((m) => m.need.id === newNeedIds[0]);
          if (newMatch) {
            toast.notify(
              `📍 New ${newMatch.need.category} need nearby: "${newMatch.need.description.slice(0, 60)}..." (${newMatch.distance} km away)`
            );
          }
          if (newNeedIds.length > 1) {
            toast.notify(`+${newNeedIds.length - 1} more new needs near you!`);
          }
        }
      }

      prevMatchIdsRef.current = new Set(matches.map((m) => m.need.id));
      isFirstLoadRef.current = false;
    });

    return () => unsub();
  }, [volunteerProfile]);

  // Subscribe to assigned tasks + notify on status changes
  useEffect(() => {
    if (!user) return;
    const prevTaskStatuses = new Map();

    const unsub = subscribeToVolunteerTasks(user.uid, (tasks) => {
      // Check for status changes (task approved/assigned to you)
      tasks.forEach((task) => {
        const prevStatus = prevTaskStatuses.get(task.id);
        if (prevStatus && prevStatus !== task.status) {
          if (task.status === "accepted") {
            toast.success(`✅ Task "${task.needDescription?.slice(0, 40)}..." has been confirmed!`);
          } else if (task.status === "done") {
            toast.success(`🎉 Great job! Task "${task.needDescription?.slice(0, 40)}..." marked as completed!`);
          } else if (task.status === "declined") {
            toast.info(`Task "${task.needDescription?.slice(0, 40)}..." was declined.`);
          }
        }
        prevTaskStatuses.set(task.id, task.status);
      });

      setMyTasks(tasks);
    });

    return () => unsub();
  }, [user]);

  // Fetch NGOs for map
  useEffect(() => {
    getAllNGOs().then((ngos) => {
      setNgoMarkers(ngos.map((n) => ({
        id: n.id,
        lat: n.lat,
        lng: n.lng,
        name: n.displayName || n.email?.split("@")[0] || "NGO",
        detail1: `📧 ${n.email || "N/A"}`,
        detail2: n.locationName ? `📍 ${n.locationName}` : null,
        detail3: null,
      })));
    }).catch(() => {});
  }, []);

  const handleAccept = async (match) => {
    try {
      // Create the task record
      const newTask = {
        needId: match.need.id,
        assignedVolunteerId: user.uid,
        matchScore: match.score,
        needDescription: match.need.description,
        needCategory: match.need.category,
        needLocationName: match.need.locationName,
        needLat: match.need.lat || 0,
        needLng: match.need.lng || 0,
        needUrgencyScore: match.need.urgencyScore || 5,
        status: "accepted", // Set status directly to accepted during creation to avoid multi-step failure
      };
      
      const taskId = await createTask(newTask);
      
      // Mark need as assigned so it disappears from open list
      await updateNeed(match.need.id, { status: "assigned" });
      
      // Update local state immediately for better UX
      setMyTasks(prev => [{ id: taskId, ...newTask, createdAt: new Date() }, ...prev]);
      setMatchedNeeds((prev) => prev.filter((m) => m.need.id !== match.need.id));
      
      // Non-critical: increment stats
      try { await incrementTasksAccepted(user.uid); } catch (_) {}
      
      toast.success(`✅ You accepted the ${match.need.category} task at ${match.need.locationName}!`);
      setTab("tasks");
    } catch (err) {
      toast.error("Failed to accept task. Please try again.");
      console.error("Accept failed:", err);
    }
  };

  const handleDecline = async (match) => {
    setMatchedNeeds((prev) => prev.filter((m) => m.need.id !== match.need.id));
    toast.info(`Declined ${match.need.category} task at ${match.need.locationName}.`);
  };

  const activeTasks = myTasks.filter((t) => t.status === "accepted");
  const pendingTasks = myTasks.filter((t) => t.status === "pending");

  return (
    <VolunteerBottomNav>
      <div id="volunteer-home">
        <h1 style={{
          fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 28,
          color: "#1A1A2E", marginBottom: 4,
        }}>
          My Dashboard 🌟
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15,
          color: "#6B7280", marginBottom: 24,
        }}>
          {volunteerProfile
            ? `Welcome back, ${volunteerProfile.name}!`
            : "Loading your profile..."}
        </p>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: "#F3F4F6",
          borderRadius: 16, padding: 4, marginBottom: 24,
        }}>
          {[
            { key: "matches", icon: <Sparkles size={14} />, label: `Matches (${matchedNeeds.length})` },
            { key: "tasks", icon: <ClipboardList size={14} />, label: `My Tasks (${activeTasks.length + pendingTasks.length})` },
            { key: "nearby", icon: <MapPin size={14} />, label: `Nearby NGOs` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 12, border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 14,
                transition: "all 0.2s ease",
                background: tab === t.key ? "white" : "transparent",
                color: tab === t.key ? "#6B4EFF" : "#6B7280",
                boxShadow: tab === t.key ? "0 2px 8px rgba(107,78,255,0.1)" : "none",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Finding matches for you..." />
        ) : tab === "matches" ? (
          matchedNeeds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <EmptyStateIllustration />
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1A2E", marginBottom: 4 }}>
                No matches yet — we're looking!
              </h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280" }}>
                New tasks will appear here based on your skills and location.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {matchedNeeds.map((match, i) => (
                <div
                  key={match.need.id}
                  style={{
                    animation: `fadeUp 0.4s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <TaskCard
                    need={match.need}
                    distance={match.distance}
                    matchScore={match.score}
                    onAccept={() => handleAccept(match)}
                    onDecline={() => handleDecline(match)}
                    onClick={() =>
                      navigate(`/volunteer/task/${match.need.id}`, {
                        state: { need: match.need, distance: match.distance },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )
        ) : tab === "tasks" ? (
          (activeTasks.length + pendingTasks.length) === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <EmptyStateIllustration />
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1A2E", marginBottom: 4 }}>
                No active tasks
              </h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280" }}>
                Accept a match to get started
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...pendingTasks, ...activeTasks].map((task) => (
                <TaskCard
                  key={task.id}
                  need={{
                    id: task.needId,
                    description: task.needDescription,
                    category: task.needCategory,
                    locationName: task.needLocationName,
                    urgencyScore: task.needUrgencyScore,
                  }}
                  taskStatus={task.status}
                  onClick={() =>
                    navigate(`/volunteer/task/${task.id}`, { state: { task } })
                  }
                />
              ))}
            </div>
          )
        ) : tab === "nearby" ? (
          <div style={{ animation: "fadeUp 0.35s ease-out" }}>
            <NearbyMap
              markers={ngoMarkers}
              radiusKm={50}
              markerColor="#FF6B35"
              markerType="ngo"
              title="Nearby NGOs"
            />
          </div>
        ) : null}
      </div>
    </VolunteerBottomNav>
  );
}
