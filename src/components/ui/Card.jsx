import { useState } from "react";
import { C, shadow } from "../../theme/tokens.js";

function Card({ children, style, className = "", pad = 18, hover = false, delay = 0 }) {
  const [h, setH] = useState(false);
  return (
    <div
      className={"ava-rise " + className}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        boxShadow: h ? shadow.raised : shadow.card, padding: pad,
        transition: "box-shadow .25s, transform .25s", transform: h ? "translateY(-2px)" : "none",
        animationDelay: `${delay}ms`, ...style,
      }}
    >{children}</div>
  );
}


export default Card;
