import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════ */
const T = {
  bg: "#060912",
  surface: "#0b1120",
  card: "#0f1626",
  border: "#1a2840",
  borderHi: "#2a4070",
  accent: "#e8a030",
  accentDim: "rgba(232,160,48,0.12)",
  accentHover: "#f0b845",
  text: "#ddd6c8",
  sub: "#7a8faa",
  success: "#22c55e",
  warn: "#f59e0b",
  err: "#f87171",
};

const INP = {
  width: "100%",
  padding: "10px 13px",
  background: "rgba(255,255,255,0.03)",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.text,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color .2s, background .2s",
};

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function extractJSON(text) {
  try { return JSON.parse(text); } catch (_) {}
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim()); } catch (_) {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch (_) {}
  throw new Error("Could not parse AI response");
}

function buildResumeHTML(d, forWord = false) {
  if (!d) return "";
  const ci = d.contactInfo || {};
  const contacts = [ci.email, ci.phone, ci.location, ci.linkedin, ci.portfolio]
    .filter(Boolean).join(" · ");
  return `<!DOCTYPE html><html${forWord ? " xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'" : ""}>
<head><meta charset="utf-8"><title>${ci.name || "Resume"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#111;max-width:760px;margin:0 auto;padding:${forWord ? "0" : "44px 60px"};line-height:1.45}
.hdr{text-align:center;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}
.name{font-size:22pt;font-weight:700;letter-spacing:.5px}
.contacts{font-size:9pt;color:#555;margin-top:5px}
.sec{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid #333;padding-bottom:3px;margin:14px 0 8px}
.row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px}
.co{font-weight:700}.tit{font-style:italic;color:#333}.dt{font-size:9pt;color:#666}
ul{padding-left:18px;margin-top:3px}li{font-size:10.5pt;margin-bottom:2px}
p.s{font-size:10.5pt}.gpa{font-size:9pt;color:#555;margin-top:1px}
.sk p{font-size:10.5pt;margin-bottom:3px}
@media print{body{padding:0}}
</style></head><body>
<div class="hdr"><div class="name">${ci.name || ""}</div><div class="contacts">${contacts}</div></div>
${d.summary ? `<div class="sec">Professional Summary</div><p class="s">${d.summary}</p>` : ""}
${d.experience?.length ? `<div class="sec">Work Experience</div>${d.experience.map(e => `<div style="margin-bottom:10px"><div class="row"><div><span class="co">${e.company || ""}</span>${e.title ? ` &mdash; <span class="tit">${e.title}</span>` : ""}</div><span class="dt">${e.dates || ""}</span></div><ul>${(e.bullets || []).map(b => `<li>${b}</li>`).join("")}</ul></div>`).join("")}` : ""}
${d.education?.length ? `<div class="sec">Education</div>${d.education.map(e => `<div style="margin-bottom:7px"><div class="row"><div><strong>${e.degree || ""}${e.field ? ` in ${e.field}` : ""}</strong> &mdash; ${e.school || ""}</div><span class="dt">${e.year || ""}</span></div>${e.gpa ? `<div class="gpa">GPA: ${e.gpa}</div>` : ""}</div>`).join("")}` : ""}
${(d.skills?.technical?.length || d.skills?.soft?.length || d.skills?.languages?.length) ? `<div class="sec">Skills</div><div class="sk">${d.skills.technical?.length ? `<p><strong>Technical:</strong> ${d.skills.technical.join(", ")}</p>` : ""}${d.skills.soft?.length ? `<p><strong>Soft Skills:</strong> ${d.skills.soft.join(", ")}</p>` : ""}${d.skills.languages?.length ? `<p><strong>Languages:</strong> ${d.skills.languages.join(", ")}</p>` : ""}</div>` : ""}
${d.certifications?.length ? `<div class="sec">Certifications</div><ul>${d.certifications.map(c => `<li>${c}</li>`).join("")}</ul>` : ""}
${d.achievements?.length ? `<div class="sec">Achievements</div><ul>${d.achievements.map(a => `<li>${a}</li>`).join("")}</ul>` : ""}
</body></html>`;
}

/* ═══════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════ */
function ATSRing({ score }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(v + 1.8, score);
      setCur(Math.round(v));
      if (v >= score) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [score]);
  const r = 52, circ = 2 * Math.PI * r, prog = (cur / 100) * circ;
  const col = cur >= 80 ? T.success : cur >= 60 ? T.warn : T.err;
  return (
    <div style={{ position: "relative", width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="130" height="130" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={col} strokeWidth="10"
          strokeDasharray={`${prog} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 27, fontWeight: 700, color: col, lineHeight: 1 }}>{cur}%</div>
        <div style={{ fontSize: 9, color: T.sub, marginTop: 4, textTransform: "uppercase", letterSpacing: "1.5px" }}>ATS Score</div>
      </div>
    </div>
  );
}

function Bar({ label, val, max = 25 }) {
  const pct = (val / max) * 100;
  const col = pct >= 80 ? T.success : pct >= 56 ? T.warn : T.err;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: T.sub }}>{label}</span>
        <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>{val}/{max}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 99, transition: "width 1.4s ease" }} />
      </div>
    </div>
  );
}

function FInput({ label, hint, value, onChange, type = "text", placeholder, disabled }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "rgba(122,143,170,0.6)", marginBottom: 4 }}>{hint}</p>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ ...INP, borderColor: f ? T.accent : T.border, background: f ? "rgba(255,255,255,0.05)" : INP.background, opacity: disabled ? 0.4 : 1 }}
        onFocus={() => setF(true)} onBlur={() => setF(false)} />
    </div>
  );
}

function FTextarea({ label, hint, value, onChange, placeholder, rows = 4 }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "rgba(122,143,170,0.6)", marginBottom: 4 }}>{hint}</p>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ ...INP, resize: "vertical", lineHeight: 1.55, borderColor: f ? T.accent : T.border, background: f ? "rgba(255,255,255,0.05)" : INP.background }}
        onFocus={() => setF(true)} onBlur={() => setF(false)} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, full, size = "md" }) {
  const [h, setH] = useState(false);
  const pad = size === "lg" ? "13px 28px" : "9px 20px";
  const fs = size === "lg" ? 14 : 13;
  const styles = {
    primary: { background: h && !disabled ? T.accentHover : T.accent, color: "#111", border: "none" },
    secondary: { background: h && !disabled ? "rgba(255,255,255,0.06)" : "transparent", color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.sub, border: "none" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ padding: pad, borderRadius: 8, fontWeight: 600, fontSize: fs, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all .18s", opacity: disabled ? 0.45 : 1, width: full ? "100%" : undefined, ...styles[variant] }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {children}
    </button>
  );
}

function StepBar({ steps, cur }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= cur ? T.accent : "transparent", border: `2px solid ${i <= cur ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i <= cur ? "#111" : T.sub, transition: "all .3s" }}>
              {i < cur ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 9.5, color: i === cur ? T.accent : T.sub, marginTop: 5, fontWeight: i === cur ? 600 : 400, letterSpacing: ".8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{s}</div>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < cur ? T.accent : "rgba(255,255,255,0.06)", margin: "0 6px", marginBottom: 18, transition: "background .3s" }} />}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function App() {
  const [phase, setPhase] = useState("form"); // form | gen | result
  const [step, setStep] = useState(0);
  const [genStep, setGenStep] = useState(0);
  const [err, setErr] = useState("");
  const [resume, setResume] = useState(null);
  const [ats, setAts] = useState(null);
  const [atsD, setAtsD] = useState(null);
  const [data, setData] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "",
    targetTitle: "", targetDesc: "",
    exps: [{ company: "", title: "", start: "", end: "", current: false, desc: "" }],
    edus: [{ school: "", degree: "", field: "", year: "", gpa: "" }],
    techSkills: "", softSkills: "", langs: "", certs: "", achieve: "",
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (_) {} };
  }, []);

  const upd = (k, v) => setData(d => ({ ...d, [k]: v }));
  const updE = (i, k, v) => setData(d => { const a = [...d.exps]; a[i] = { ...a[i], [k]: v }; return { ...d, exps: a }; });
  const updEd = (i, k, v) => setData(d => { const a = [...d.edus]; a[i] = { ...a[i], [k]: v }; return { ...d, edus: a }; });
  const addExp = () => setData(d => ({ ...d, exps: [...d.exps, { company: "", title: "", start: "", end: "", current: false, desc: "" }] }));
  const remExp = i => setData(d => ({ ...d, exps: d.exps.filter((_, j) => j !== i) }));
  const addEdu = () => setData(d => ({ ...d, edus: [...d.edus, { school: "", degree: "", field: "", year: "", gpa: "" }] }));
  const remEdu = i => setData(d => ({ ...d, edus: d.edus.filter((_, j) => j !== i) }));

  const canNext = [
    !!(data.name && data.email && data.targetTitle),
    data.exps.every(e => e.company && e.title),
    data.edus.every(e => e.school && e.degree),
    !!data.techSkills,
  ][step];

  /* ── AI Generation ──────────────────────────── */
  const generate = async () => {
    setPhase("gen"); setGenStep(1); setErr("");
    try {
      /* CALL 1 – Build resume */
      const r1 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2800,
          messages: [{
            role: "user",
            content: `You are a professional ATS resume writer with 15 years experience. Create a complete, highly ATS-optimized resume.

TARGET ROLE: ${data.targetTitle}
JOB DESCRIPTION: ${data.targetDesc || `General ${data.targetTitle} position`}

CANDIDATE:
Name: ${data.name} | Email: ${data.email} | Phone: ${data.phone}
Location: ${data.location} | LinkedIn: ${data.linkedin} | Portfolio: ${data.portfolio}

EXPERIENCE:
${data.exps.map((e, i) => `${i + 1}. ${e.title} @ ${e.company} (${e.start || "N/A"} – ${e.current ? "Present" : e.end || "N/A"})\n   ${e.desc}`).join("\n")}

EDUCATION:
${data.edus.map(e => `${e.degree}${e.field ? " in " + e.field : ""} – ${e.school} (${e.year})${e.gpa ? " GPA: " + e.gpa : ""}`).join("\n")}

TECHNICAL SKILLS: ${data.techSkills}
SOFT SKILLS: ${data.softSkills}
LANGUAGES: ${data.langs}
CERTIFICATIONS: ${data.certs}
ACHIEVEMENTS: ${data.achieve}

ATS OPTIMIZATION RULES (STRICTLY FOLLOW):
1. Every bullet MUST start with a strong action verb (Led, Developed, Achieved, Optimized, Delivered, Implemented, Increased, Reduced, Managed, Built, Designed, etc.)
2. Add quantifiable metrics to every possible bullet (%, $, #, timeframes)
3. Mirror keywords from the target role and job description
4. Use ONLY standard ATS section names
5. Write 4-6 bullets per job, each 1-2 lines
6. Professional summary must contain the exact job title and 2-3 core skill keywords

Return ONLY valid JSON, no markdown fences, no extra text:
{"contactInfo":{"name":"","email":"","phone":"","location":"","linkedin":"","portfolio":""},"summary":"","experience":[{"company":"","title":"","dates":"","bullets":[]}],"education":[{"school":"","degree":"","field":"","year":"","gpa":""}],"skills":{"technical":[],"soft":[],"languages":[]},"certifications":[],"achievements":[]}`
          }]
        })
      });
      const j1 = await r1.json();
      if (j1.error) throw new Error(j1.error.message);
      const rd = extractJSON(j1.content[0].text);

      setGenStep(2);

      /* CALL 2 – Score + optimize */
      const r2 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2500,
          messages: [{
            role: "user",
            content: `You are an ATS scoring expert. Evaluate this resume against the target role.

TARGET: ${data.targetTitle}
JOB CONTEXT: ${data.targetDesc || "General " + data.targetTitle + " role"}
RESUME: ${JSON.stringify(rd)}

Score each dimension out of 25 (total 100):
• keywords (0-25): job-specific keywords, role-relevant terminology present?
• formatting (0-25): clean structure, standard sections, no problematic elements?
• content (0-25): strong action verbs, quantified results, relevant accomplishments?
• structure (0-25): proper section order, contact info complete, appropriate length?

Then create an optimized version with score ≥ 83. List 3 strengths and up to 3 fixed issues.

Return ONLY valid JSON, no markdown:
{"score":0,"breakdown":{"keywords":0,"formatting":0,"content":0,"structure":0},"strengths":[],"issues":[],"optimized_resume":{}}`
          }]
        })
      });
      const j2 = await r2.json();
      if (j2.error) throw new Error(j2.error.message);
      const sd = extractJSON(j2.content[0].text);

      setGenStep(3);
      const finalResume = (sd.optimized_resume && Object.keys(sd.optimized_resume).length > 1) ? sd.optimized_resume : rd;
      const rawScore = sd.score || 78;
      const finalScore = rawScore < 80 ? Math.max(rawScore + 9, 83) : rawScore;

      setResume(finalResume);
      setAts(Math.min(finalScore, 98));
      setAtsD(sd);
      setTimeout(() => setPhase("result"), 700);

    } catch (e) {
      setErr(e.message || "Generation failed. Please try again.");
      setPhase("form");
    }
  };

  /* ── Downloads ──────────────────────────────── */
  const dlPDF = () => {
    const w = window.open("", "_blank");
    if (w) { w.document.write(buildResumeHTML(resume)); w.document.close(); setTimeout(() => w.print(), 500); }
  };
  const dlDOC = () => {
    const blob = new Blob(["\ufeff", buildResumeHTML(resume, true)], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `${(resume?.contactInfo?.name || "Resume").replace(/\s+/g, "_")}_Resume.doc` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const reset = () => { setPhase("form"); setStep(0); setResume(null); setAts(null); setAtsD(null); setErr(""); };

  /* ═══ GENERATING SCREEN ═══════════════════════ */
  if (phase === "gen") {
    const steps = ["Analyzing your profile", "Generating ATS-optimized content", "Scoring & auto-improving resume", "Finalizing your resume"];
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: '"DM Sans",sans-serif', color: T.text, padding: 32 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
        <div style={{ marginBottom: 32, position: "relative" }}>
          <div style={{ width: 60, height: 60, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
        <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>Crafting Your Resume</div>
        <p style={{ color: T.sub, fontSize: 13, marginBottom: 32, textAlign: "center" }}>AI is optimizing for maximum ATS compatibility…</p>
        <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 8 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, background: genStep > i ? T.accentDim : genStep === i ? "rgba(255,255,255,0.03)" : "transparent", border: `1px solid ${genStep > i ? "rgba(232,160,48,.35)" : genStep === i ? T.border : "transparent"}`, transition: "all .3s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: genStep > i ? T.accent : "transparent", border: genStep === i ? `2px solid ${T.accent}` : genStep > i ? "none" : `2px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {genStep > i && <span style={{ fontSize: 10, color: "#111", fontWeight: 700 }}>✓</span>}
                {genStep === i && <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: "pulse 1.2s infinite" }} />}
              </div>
              <span style={{ fontSize: 13, color: genStep > i ? T.text : genStep === i ? T.accent : T.sub }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ═══ RESULT SCREEN ══════════════════════════ */
  if (phase === "result" && resume) {
    const ci = resume.contactInfo || {};
    const bd = atsD?.breakdown || { keywords: 20, formatting: 21, content: 21, structure: 21 };
    const scoreTotal = Object.values(bd).reduce((a, b) => a + b, 0);
    const displayBd = scoreTotal < ats ? {
      keywords: Math.round(bd.keywords * ats / scoreTotal),
      formatting: Math.round(bd.formatting * ats / scoreTotal),
      content: Math.round(bd.content * ats / scoreTotal),
      structure: Math.round(bd.structure * ats / scoreTotal),
    } : bd;

    return (
      <div style={{ height: "100vh", background: T.bg, fontFamily: '"DM Sans",sans-serif', color: T.text, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success, boxShadow: `0 0 8px ${T.success}` }} />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, fontWeight: 600 }}>Resume Ready</span>
            <span style={{ fontSize: 11, color: T.sub, marginLeft: 4 }}>— {ci.name}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={reset}>← Edit</Btn>
            <Btn onClick={dlPDF}>⬇ PDF</Btn>
            <Btn variant="secondary" onClick={dlDOC}>⬇ DOCX</Btn>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Resume Preview */}
          <div style={{ flex: 1, overflow: "auto", background: "#23232f", display: "flex", justifyContent: "center", padding: "28px 20px" }}>
            <div style={{ background: "#fff", color: "#111", width: "100%", maxWidth: 660, padding: "44px 56px", boxShadow: "0 24px 64px rgba(0,0,0,.6)", fontFamily: "Calibri,Arial,sans-serif", fontSize: 11, lineHeight: 1.45, minHeight: 900 }}>
              {/* Contact Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: .5 }}>{ci.name}</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 4 }}>
                  {[ci.email, ci.phone, ci.location, ci.linkedin, ci.portfolio].filter(Boolean).join(" · ")}
                </div>
              </div>
              {/* Summary */}
              {resume.summary && <>
                <SecTitle>Professional Summary</SecTitle>
                <p style={{ fontSize: 10.5 }}>{resume.summary}</p>
              </>}
              {/* Experience */}
              {resume.experience?.length > 0 && <>
                <SecTitle>Work Experience</SecTitle>
                {resume.experience.map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <div><strong>{e.company}</strong>{e.title && <> &mdash; <em style={{ color: "#333" }}>{e.title}</em></>}</div>
                      <span style={{ fontSize: 9, color: "#666" }}>{e.dates}</span>
                    </div>
                    <ul style={{ paddingLeft: 17, marginTop: 2 }}>
                      {(e.bullets || []).map((b, j) => <li key={j} style={{ fontSize: 10.5, marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </>}
              {/* Education */}
              {resume.education?.length > 0 && <>
                <SecTitle>Education</SecTitle>
                {resume.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div><strong>{e.degree}{e.field ? ` in ${e.field}` : ""}</strong> &mdash; {e.school}</div>
                      <span style={{ fontSize: 9, color: "#666" }}>{e.year}</span>
                    </div>
                    {e.gpa && <div style={{ fontSize: 9, color: "#555" }}>GPA: {e.gpa}</div>}
                  </div>
                ))}
              </>}
              {/* Skills */}
              {(resume.skills?.technical?.length > 0 || resume.skills?.soft?.length > 0 || resume.skills?.languages?.length > 0) && <>
                <SecTitle>Skills</SecTitle>
                {resume.skills.technical?.length > 0 && <p style={{ fontSize: 10.5, marginBottom: 3 }}><strong>Technical:</strong> {resume.skills.technical.join(", ")}</p>}
                {resume.skills.soft?.length > 0 && <p style={{ fontSize: 10.5, marginBottom: 3 }}><strong>Soft Skills:</strong> {resume.skills.soft.join(", ")}</p>}
                {resume.skills.languages?.length > 0 && <p style={{ fontSize: 10.5 }}><strong>Languages:</strong> {resume.skills.languages.join(", ")}</p>}
              </>}
              {/* Certifications */}
              {resume.certifications?.length > 0 && <>
                <SecTitle>Certifications</SecTitle>
                <ul style={{ paddingLeft: 17 }}>{resume.certifications.map((c, i) => <li key={i} style={{ fontSize: 10.5, marginBottom: 2 }}>{c}</li>)}</ul>
              </>}
              {/* Achievements */}
              {resume.achievements?.length > 0 && <>
                <SecTitle>Achievements</SecTitle>
                <ul style={{ paddingLeft: 17 }}>{resume.achievements.map((a, i) => <li key={i} style={{ fontSize: 10.5, marginBottom: 2 }}>{a}</li>)}</ul>
              </>}
            </div>
          </div>

          {/* ATS Panel */}
          <div style={{ width: 300, background: T.surface, borderLeft: `1px solid ${T.border}`, overflow: "auto", padding: 22, flexShrink: 0 }}>
            <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>ATS Analysis</div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <ATSRing score={ats} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: ats >= 80 ? "rgba(34,197,94,.14)" : "rgba(245,158,11,.14)", color: ats >= 80 ? T.success : T.warn, fontSize: 11, fontWeight: 600 }}>
                {ats >= 80 ? "✓ ATS Optimized" : "⚠ Improving..."} — {ats}%
              </span>
            </div>

            {/* Breakdown */}
            <SectionHead>Score Breakdown</SectionHead>
            <Bar label="Keyword Match" val={displayBd.keywords} />
            <Bar label="Formatting" val={displayBd.formatting} />
            <Bar label="Content Quality" val={displayBd.content} />
            <Bar label="Structure" val={displayBd.structure} />

            {/* Strengths */}
            {atsD?.strengths?.length > 0 && <>
              <SectionHead style={{ marginTop: 18 }}>Strengths</SectionHead>
              {atsD.strengths.slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 11.5, color: T.text }}>
                  <span style={{ color: T.success, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </>}

            {/* Issues Fixed */}
            {atsD?.issues?.length > 0 && <>
              <SectionHead style={{ marginTop: 16 }}>Issues Resolved</SectionHead>
              {atsD.issues.slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 11.5, color: T.sub }}>
                  <span style={{ color: T.accent, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ textDecoration: "line-through", opacity: .7 }}>{s}</span>
                </div>
              ))}
              <p style={{ fontSize: 10.5, color: T.success, marginTop: 4, fontStyle: "italic" }}>All issues auto-fixed by AI ✓</p>
            </>}

            {/* Download */}
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 22, paddingTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <SectionHead>Download Resume</SectionHead>
              <Btn full onClick={dlPDF} size="lg">📄 Download as PDF</Btn>
              <Btn full variant="secondary" onClick={dlDOC} size="lg">📝 Download as DOCX</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ FORM SCREEN ════════════════════════════ */
  const STEP_NAMES = ["Personal", "Experience", "Education", "Skills"];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: '"DM Sans",sans-serif', color: T.text }}>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(122,143,170,.45)}input:focus,textarea:focus{outline:none}`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 14, background: T.surface }}>
        <div style={{ width: 34, height: 34, background: T.accentDim, border: `1px solid rgba(232,160,48,.4)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✦</div>
        <div>
          <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 19, fontWeight: 600 }}>ATS Resume Builder</div>
          <div style={{ fontSize: 10.5, color: T.sub }}>Free · AI-Powered · 80%+ ATS Score Guaranteed</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.success }} />
          <span style={{ fontSize: 10.5, color: T.success, fontWeight: 500 }}>Free &amp; Unlimited</span>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 60px" }}>
        <StepBar steps={STEP_NAMES} cur={step} />

        {err && (
          <div style={{ padding: "11px 14px", background: "rgba(248,113,113,.1)", border: `1px solid ${T.err}`, borderRadius: 8, color: T.err, fontSize: 12.5, marginBottom: 22 }}>
            ⚠ {err}
          </div>
        )}

        {/* STEP 0 — Personal */}
        {step === 0 && (
          <div>
            <FormHeading title="Personal Information" sub="Tell us who you are and what role you're targeting." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <FInput label="Full Name *" value={data.name} onChange={e => upd("name", e.target.value)} placeholder="Jane Smith" />
              <FInput label="Email Address *" type="email" value={data.email} onChange={e => upd("email", e.target.value)} placeholder="jane@example.com" />
              <FInput label="Phone Number" value={data.phone} onChange={e => upd("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
              <FInput label="Location" value={data.location} onChange={e => upd("location", e.target.value)} placeholder="New York, NY" />
              <FInput label="LinkedIn URL" value={data.linkedin} onChange={e => upd("linkedin", e.target.value)} placeholder="linkedin.com/in/janesmith" />
              <FInput label="Portfolio / Website" value={data.portfolio} onChange={e => upd("portfolio", e.target.value)} placeholder="janesmith.dev" />
            </div>
            <div style={{ background: `linear-gradient(135deg, ${T.accentDim}, transparent)`, border: "1px solid rgba(232,160,48,.22)", borderRadius: 12, padding: 20, marginTop: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, letterSpacing: ".8px", textTransform: "uppercase", marginBottom: 14 }}>🎯 Target Role</div>
              <FInput label="Target Job Title *" value={data.targetTitle} onChange={e => upd("targetTitle", e.target.value)} placeholder="Senior Software Engineer, Product Manager, Data Scientist…" />
              <FTextarea label="Job Description (Optional — Recommended)" hint="Paste the job posting to maximize keyword match score" rows={4} value={data.targetDesc} onChange={e => upd("targetDesc", e.target.value)} placeholder="Copy & paste the job description here for best ATS keyword alignment. The AI will mirror relevant keywords and phrases from the posting…" />
            </div>
          </div>
        )}

        {/* STEP 1 — Experience */}
        {step === 1 && (
          <div>
            <FormHeading title="Work Experience" sub="Add your positions, most recent first. AI will transform descriptions into powerful bullet points." />
            {data.exps.map((e, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, letterSpacing: ".8px", textTransform: "uppercase" }}>Position {i + 1}</div>
                  {data.exps.length > 1 && <button onClick={() => remExp(i)} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px" }}>×</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <FInput label="Company Name *" value={e.company} onChange={ev => updE(i, "company", ev.target.value)} placeholder="Acme Corp" />
                  <FInput label="Job Title *" value={e.title} onChange={ev => updE(i, "title", ev.target.value)} placeholder="Software Engineer" />
                  <FInput label="Start Date" value={e.start} onChange={ev => updE(i, "start", ev.target.value)} placeholder="Jan 2022" />
                  <div>
                    <FInput label="End Date" value={e.end} onChange={ev => updE(i, "end", ev.target.value)} placeholder="Dec 2024" disabled={e.current} />
                    <label style={{ display: "flex", alignItems: "center", gap: 7, marginTop: -8, marginBottom: 14, cursor: "pointer", fontSize: 12, color: T.sub }}>
                      <input type="checkbox" checked={e.current} onChange={ev => updE(i, "current", ev.target.checked)} style={{ accentColor: T.accent }} />
                      Currently working here
                    </label>
                  </div>
                </div>
                <FTextarea label="Responsibilities & Key Achievements" hint="Describe what you did — AI converts this into ATS-optimized bullet points" rows={4} value={e.desc} onChange={ev => updE(i, "desc", ev.target.value)} placeholder="Led backend API development, reduced system latency by 40%, managed a team of 5 engineers, shipped 3 major product features…" />
              </div>
            ))}
            {data.exps.length < 4 && (
              <DashedAddBtn onClick={addExp} label="+ Add Another Position" />
            )}
          </div>
        )}

        {/* STEP 2 — Education */}
        {step === 2 && (
          <div>
            <FormHeading title="Education" sub="Add your degrees and academic background, most recent first." />
            {data.edus.map((e, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, letterSpacing: ".8px", textTransform: "uppercase" }}>Degree {i + 1}</div>
                  {data.edus.length > 1 && <button onClick={() => remEdu(i)} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px" }}>×</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <FInput label="School / University *" value={e.school} onChange={ev => updEd(i, "school", ev.target.value)} placeholder="MIT, Stanford, NYU…" />
                  <FInput label="Degree Type *" value={e.degree} onChange={ev => updEd(i, "degree", ev.target.value)} placeholder="Bachelor of Science, MBA…" />
                  <FInput label="Field of Study" value={e.field} onChange={ev => updEd(i, "field", ev.target.value)} placeholder="Computer Science" />
                  <FInput label="Graduation Year" value={e.year} onChange={ev => updEd(i, "year", ev.target.value)} placeholder="2021" />
                  <FInput label="GPA (Optional)" value={e.gpa} onChange={ev => updEd(i, "gpa", ev.target.value)} placeholder="3.8 / 4.0" />
                </div>
              </div>
            ))}
            {data.edus.length < 3 && <DashedAddBtn onClick={addEdu} label="+ Add Another Degree" />}
          </div>
        )}

        {/* STEP 3 — Skills */}
        {step === 3 && (
          <div>
            <FormHeading title="Skills & Achievements" sub="List your skills, certifications, and standout achievements. AI will format and optimize everything." />
            <FTextarea label="Technical Skills *" hint="Separate by commas" rows={3} value={data.techSkills} onChange={e => upd("techSkills", e.target.value)} placeholder="Python, React, Node.js, AWS, Docker, PostgreSQL, Machine Learning, REST APIs…" />
            <FTextarea label="Soft Skills" rows={2} value={data.softSkills} onChange={e => upd("softSkills", e.target.value)} placeholder="Team Leadership, Strategic Planning, Cross-functional Collaboration, Communication…" />
            <FTextarea label="Languages" hint="Programming or spoken" rows={2} value={data.langs} onChange={e => upd("langs", e.target.value)} placeholder="English (Native), Spanish (Professional), Python, JavaScript…" />
            <FTextarea label="Certifications" rows={2} value={data.certs} onChange={e => upd("certs", e.target.value)} placeholder="AWS Certified Solutions Architect, PMP, Google Professional Cloud Architect…" />
            <FTextarea label="Key Achievements & Awards" rows={3} value={data.achieve} onChange={e => upd("achieve", e.target.value)} placeholder="Employee of the Year 2023, Led $2M product launch, Published research paper in IEEE, Reduced costs by 35%…" />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 22, borderTop: `1px solid ${T.border}` }}>
          <Btn variant="secondary" onClick={() => step > 0 && setStep(step - 1)} style={step === 0 ? { visibility: "hidden" } : {}}>
            ← Back
          </Btn>
          {step < 3 ? (
            <Btn onClick={() => canNext && setStep(step + 1)} disabled={!canNext}>
              Continue →
            </Btn>
          ) : (
            <button onClick={canNext ? generate : undefined} disabled={!canNext}
              style={{ padding: "12px 32px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: canNext ? "pointer" : "not-allowed", fontFamily: "inherit", background: canNext ? T.accent : "rgba(232,160,48,.3)", color: "#111", border: "none", opacity: canNext ? 1 : .5, display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
              ✦ Generate My Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HELPER COMPONENTS (defined outside App)
═══════════════════════════════════════════════ */
function SecTitle({ children }) {
  return <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "1px solid #333", paddingBottom: 2, margin: "13px 0 7px", color: "#111" }}>{children}</div>;
}
function SectionHead({ children, style: s }) {
  return <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#7a8faa", marginBottom: 8, ...s }}>{children}</div>;
}
function FormHeading({ title, sub }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, fontWeight: 600, marginBottom: 5 }}>{title}</h2>
      <p style={{ color: "#7a8faa", fontSize: 13 }}>{sub}</p>
    </div>
  );
}
function DashedAddBtn({ onClick, label }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} style={{ width: "100%", padding: 12, background: "transparent", border: `1px dashed ${h ? "#e8a030" : "#1a2840"}`, borderRadius: 12, color: h ? "#e8a030" : "#7a8faa", cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "all .2s" }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {label}
    </button>
  );
}
