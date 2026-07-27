"use client";

import { useState } from "react";
import { Copy, MapPin } from "lucide-react";
import { labels } from "@/lib/constants";
import type { Connection } from "@/lib/types";

export function ConnectionList({ connections }: { connections: Connection[] }) {
  const [copied, setCopied] = useState("");

  async function copy(connection: Connection) {
    await navigator.clipboard.writeText(connection.contact_value);
    setCopied(connection.id);
    window.setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="connection-list">
      {connections.map((connection, index) => (
        <article className="connection-card" key={connection.id}>
          <span className="connection-index">{String(index + 1).padStart(2, "0")}</span>
          <div className="connection-person">
            <p className="connection-date">{String(connection.birthday_month).padStart(2, "0")}<i>/</i>{String(connection.birthday_day).padStart(2, "0")}</p>
            <h2>{connection.nickname}</h2>
            <p><MapPin aria-hidden="true" size={16} />{connection.city_name}</p>
          </div>
          <div className="contact-reveal">
            <span>{labels.contactKind[connection.contact_kind]}</span>
            <strong>{connection.contact_value}</strong>
            <button type="button" onClick={() => copy(connection)}><Copy aria-hidden="true" size={16} />{copied === connection.id ? "已复制" : "复制"}</button>
          </div>
        </article>
      ))}
    </div>
  );
}
