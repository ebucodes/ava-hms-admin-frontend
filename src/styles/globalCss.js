import { C, FONT } from "../theme/tokens.js";

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.ava-root { font-family: ${FONT.body}; -webkit-font-smoothing: antialiased; }
.ava-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.ava-scroll::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 99px; }
.ava-scroll::-webkit-scrollbar-track { background: transparent; }
@keyframes avaRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.ava-rise { animation: avaRise .5s cubic-bezier(.2,.7,.2,1) both; }
@keyframes avaFade { from { opacity: 0; } to { opacity: 1; } }
.ava-fade { animation: avaFade .18s ease both; }
@keyframes avaPop { from { opacity: 0; transform: scale(.97) translateY(-6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.ava-pop { animation: avaPop .2s cubic-bezier(.2,.8,.2,1) both; }
@keyframes avaSpin { to { transform: rotate(360deg); } }
.ava-spin { animation: avaSpin 1s linear infinite; }
@keyframes avaPulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
.ava-pulse { animation: avaPulse 2s ease-in-out infinite; }
@keyframes avaCaret { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
.ava-caret { animation: avaCaret 1.1s step-end infinite; }
.ava-cmd:hover { background: ${C.blueSoft} !important; }
.ava-row:hover td { background: ${C.surface2}; }
.ava-bed { transition: transform .12s; cursor: pointer; }
.ava-bed:hover { transform: scale(1.35); z-index: 2; }

/* ---- Responsive layout ---- */
.ava-main-pad { padding: 22px 24px 60px; }
.ava-hamburger { display: none !important; }
.ava-backdrop { display: none; }
.ava-grid-4 { grid-template-columns: repeat(4, 1fr); }
.ava-fd-layout { grid-template-columns: 1fr 320px; }
.ava-form-grid-2 { grid-template-columns: 1fr 1fr; }
.ava-form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

@media (max-width: 1024px) {
  .ava-hamburger { display: inline-flex !important; }
  .ava-collapse-btn { display: none !important; }
  .ava-sidebar-close-btn { display: flex !important; }
  .ava-sidebar { position: fixed !important; top: 0; left: 0; height: 100vh; width: 260px !important; min-width: 260px !important; transform: translateX(-100%); transition: transform .25s cubic-bezier(.2,.7,.2,1); z-index: 60 !important; box-shadow: 0 0 0 rgba(0,0,0,0); }
  .ava-sidebar.ava-sidebar-open { transform: translateX(0); box-shadow: 0 0 48px rgba(12,19,34,.28); }
  .ava-backdrop { display: block; position: fixed; inset: 0; background: rgba(12,19,34,.45); z-index: 55; }
  .ava-fd-layout { grid-template-columns: 1fr; }
}

@media (max-width: 860px) {
  .ava-grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .ava-topbar-clock, .ava-topbar-sync-label { display: none; }
}

@media (max-width: 768px) {
  .ava-topbar-search-label, .ava-topbar-search-kbd { display: none; }
  .ava-topbar-search { flex: 0 0 auto !important; max-width: 44px !important; margin-left: 8px !important; padding: 9px !important; justify-content: center !important; }
}

@media (max-width: 640px) {
  .ava-main-pad { padding: 14px 14px 40px; }
  .ava-topbar-ai-label { display: none; }
  .ava-topbar-sync, .ava-topbar-ai, .ava-topbar-quickaction { display: none !important; }
  .ava-topbar { padding: 0 10px !important; gap: 6px !important; }
  .ava-grid-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
}

@media (max-width: 560px) {
  .ava-form-grid-2, .ava-form-grid-3 { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .ava-grid-4 { grid-template-columns: 1fr; }
  .ava-login-card { padding: 26px !important; }
}
`;
