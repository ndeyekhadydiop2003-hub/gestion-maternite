import { useState } from "react";
import { MessageSquare, Send, Search, Plus, AlertCircle, Clock } from "lucide-react";
import { Avatar } from "../components/PatientRow";
import Modal from "../components/Modal";
import { messages } from "../data/mockData";

const conversation = [
  { from:"patient", texte:"Bonjour Antoine, je souhaite annuler mon rendez-vous de demain.", heure:"15:12" },
  { from:"moi",     texte:"Bonjour Céline, pas de problème. On reporte à quelle date ?", heure:"15:20" },
  { from:"patient", texte:"La semaine prochaine si possible, mercredi ou jeudi.", heure:"15:22" },
  { from:"moi",     texte:"Mercredi 1er mai à 15h ça vous convient ?", heure:"15:25" },
  { from:"patient", texte:"Bonjour Antoine, je souhaiter...", heure:"15:30" },
];

export default function Messages() {
  const [selected, setSelected] = useState(messages[0]);
  const [input, setInput]       = useState("");
  const [showNew, setShowNew]   = useState(false);
  const [search, setSearch]     = useState("");

  const filtered = messages.filter(m =>
    m.de.toLowerCase().includes(search.toLowerCase()) ||
    m.apercu.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (input.trim()) setInput("");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><MessageSquare size={22} /> Messages</div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nouveau message
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20, height:"calc(100vh - 160px)" }}>
        {/* Liste messages */}
        <div className="card" style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 16px 12px" }}>
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                className="search-input"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {filtered.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                style={{
                  display:"flex", gap:12, padding:"14px 16px",
                  cursor:"pointer",
                  background: selected?.id === m.id ? "#f5f0ff" : "transparent",
                  borderLeft: selected?.id === m.id ? "3px solid var(--primary)" : "3px solid transparent",
                  borderBottom: "1px solid var(--border)",
                  transition: "all 0.15s",
                }}
              >
                <Avatar initiales={m.initiales} size="sm" />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{m.de}</div>
                  <div style={{ fontSize:"0.76rem", color:"var(--text-medium)", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {m.apercu}
                  </div>
                </div>
                <div>
                  {m.statut === "urgent"
                    ? <span className="tag-urgent" style={{ fontSize:"0.68rem" }}><AlertCircle size={9}/> Urgent</span>
                    : <span className="tag-time" style={{ fontSize:"0.72rem" }}><Clock size={10}/>{m.heure}</span>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding:"12px 16px", borderTop:"1.5px solid var(--border)" }}>
            <div style={{ fontSize:"0.76rem", color:"var(--text-medium)" }}>
              1–{filtered.length} de 248 messages
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="card" style={{ padding:0, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Header conv */}
          <div style={{ padding:"16px 20px", borderBottom:"1.5px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
            <Avatar initiales={selected?.initiales || "?"} />
            <div>
              <div style={{ fontWeight:800, fontSize:"0.95rem" }}>{selected?.de}</div>
              <div style={{ fontSize:"0.76rem", color:"var(--green)", fontWeight:600 }}>● En ligne</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
              <button className="btn btn-outline btn-sm">Voir dossier</button>
              <button className="btn btn-rose btn-sm">Planifier RDV</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
            {conversation.map((msg, i) => (
              <div key={i} style={{ display:"flex", justifyContent: msg.from==="moi" ? "flex-end" : "flex-start", gap:10 }}>
                {msg.from !== "moi" && <Avatar initiales={selected?.initiales || "?"} size="sm" />}
                <div>
                  <div style={{
                    padding:"10px 14px",
                    borderRadius: msg.from==="moi" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.from==="moi"
                      ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                      : "#f5f0ff",
                    color: msg.from==="moi" ? "white" : "var(--text-dark)",
                    fontSize: "0.87rem",
                    maxWidth: 360,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}>
                    {msg.texte}
                  </div>
                  <div style={{ fontSize:"0.7rem", color:"var(--text-medium)", marginTop:3, textAlign: msg.from==="moi" ? "right" : "left" }}>
                    {msg.heure}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saisie */}
          <div style={{ padding:"16px 20px", borderTop:"1.5px solid var(--border)", display:"flex", gap:10, alignItems:"flex-end" }}>
            <textarea
              className="form-textarea"
              style={{ flex:1, minHeight:44, maxHeight:100, resize:"none", borderRadius:12 }}
              placeholder="Écrire un message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button className="btn btn-primary" style={{ padding:"12px 16px" }} onClick={handleSend}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Nouveau message modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouveau message">
        <div className="form-group">
          <label className="form-label">Destinataire</label>
          <input className="form-input" placeholder="Nom du patient ou médecin..." />
        </div>
        <div className="form-group">
          <label className="form-label">Objet</label>
          <input className="form-input" placeholder="Sujet du message..." />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" style={{ minHeight:130 }} placeholder="Votre message..." />
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
          <button className="btn btn-primary" onClick={() => setShowNew(false)}><Send size={14}/> Envoyer</button>
        </div>
      </Modal>
    </div>
  );
}
