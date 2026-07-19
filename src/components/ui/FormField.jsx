import { C } from "../../theme/tokens.js";

const baseInput = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${C.border}`,
  fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", background: "#fff", color: C.ink,
};

export function FormField({ label, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export function TextInput(props) {
  return <input style={baseInput} {...props} />;
}

export function SelectInput({ children, ...props }) {
  return (
    <select style={{ ...baseInput, cursor: "pointer" }} {...props}>
      {children}
    </select>
  );
}
