"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function VisitorsChart({ data }: { data: { day: string; visitors: number; pageviews: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: new Date(d.day).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="vis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a88a5f" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#a88a5f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2d9ce" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6f6258" }} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#6f6258" }} />
          <Tooltip contentStyle={{ borderRadius: 6, border: "1px solid #e2d9ce", background: "#fffdf9", fontSize: 13 }} />
          <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#cbbdac" strokeWidth={1.25} fill="transparent" />
          <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#7d6440" strokeWidth={1.75} fill="url(#vis)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
