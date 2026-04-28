import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "How do I sign up?",
  "How to use this app?",
  "How does matching work?",
  "How to submit a need?",
  "Where is my profile?"
];

const RESPONSES = {
  signup: "Welcome to the community! To get started, click **'Get Started'**. If you want to lend a hand, choose **'Volunteer'**. If you represent an organization looking for help, choose **'NGO'**. Once you sign up, we'll guide you through setting up your mission!",
  matching: "We use a smart matching system to ensure the right hands reach the right places. As a volunteer, your dashboard will show tasks that fit your skills and are close to your location. Just click **'Accept'** to start helping!",
  how_to_use: "It's simple! **NGOs** can post 'Needs' via their dashboard to request help. **Volunteers** will then see these needs as 'Tasks'. You can track everything from your personal dashboard and even see a map of nearby activity!",
  profile: "Your profile is your community identity. You can update your skills, contact info, and availability anytime. Keeping this updated helps us send you the most relevant opportunities to make an impact.",
  submit: "Reporting a need is easy for NGOs. Go to your dashboard, click **'Submit Need'**, and tell us what's happening. Our system will help prioritize it so volunteers can find you quickly.",
  default: "I'm here to help you navigate our bridge of kindness! You can ask me how to **sign up**, how to **find tasks**, or how to **report a need**. What's on your mind?"
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm Bridgey, your VolunteerBridge assistant. How can I help you today? 👋", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes("signup") || q.includes("register") || q.includes("join")) return RESPONSES.signup;
    if (q.includes("match") || q.includes("how it works") || q.includes("find task")) return RESPONSES.matching;
    if (q.includes("how to use") || q.includes("app") || q.includes("guide")) return RESPONSES.how_to_use;
    if (q.includes("profile") || q.includes("edit") || q.includes("change")) return RESPONSES.profile;
    if (q.includes("submit") || q.includes("report") || q.includes("ngo")) return RESPONSES.submit;
    return RESPONSES.default;
  };

  const processQuery = (text) => {
    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: response, isBot: true }]);
      setIsTyping(false);
    }, 800);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    processQuery(text);
  };

  const handleSuggestedClick = (question) => {
    processQuery(question);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 60, height: 60, borderRadius: "50%",
          background: "#6B4EFF", color: "white", border: "none",
          boxShadow: "0 8px 32px rgba(107,78,255,0.4)",
          cursor: "pointer", zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 100, right: 24,
          width: "calc(100% - 48px)", maxWidth: 380, height: 500,
          background: "white", borderRadius: 24,
          boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          overflow: "hidden", zIndex: 10000,
          animation: "fadeUp 0.3s ease-out",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 24px", background: "#6B4EFF", color: "white",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>
                Bridgey
              </h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, opacity: 0.8, margin: 0 }}>
                Online & ready to help
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, padding: 20, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 16,
            background: "#F9FAFB",
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.isBot ? "flex-start" : "flex-end",
                  gap: 8,
                }}
              >
                {msg.isBot && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={14} color="#6B4EFF" />
                  </div>
                )}
                <div style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: msg.isBot ? "0 16px 16px 16px" : "16px 0 16px 16px",
                  background: msg.isBot ? "white" : "#6B4EFF",
                  color: msg.isBot ? "#1A1A2E" : "white",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: msg.isBot ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                }}>
                  {msg.text}
                </div>
                {!msg.isBot && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FFE8F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={14} color="#FF4D8D" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={14} color="#6B4EFF" />
                </div>
                <div style={{ padding: "12px 16px", background: "white", borderRadius: "0 16px 16px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <Loader2 size={16} className="animate-spin" color="#6B4EFF" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div style={{
            padding: "12px 16px", background: "white", borderTop: "1px solid #E5E7EB",
            display: "flex", gap: 8, flexWrap: "wrap",
          }}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestedClick(q)}
                style={{
                  padding: "6px 12px", borderRadius: 8, background: "#F3F4F6",
                  border: "1px solid #E5E7EB", color: "#6B4EFF",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11,
                  fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#EDE9FF"; e.currentTarget.style.borderColor = "#6B4EFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
              >
                <Sparkles size={10} /> {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            style={{
              padding: 16, background: "white", borderTop: "1px solid #E5E7EB",
              display: "flex", gap: 10,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 12,
                border: "1px solid #E5E7EB", outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: input.trim() ? "#6B4EFF" : "#E5E7EB",
                color: "white", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
