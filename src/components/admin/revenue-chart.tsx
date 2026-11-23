"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatPrice } from "@/lib/money"

export function RevenueChart({ data }: { data: { day: string; revenue_ore: number; orders: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: new Date(d.day).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a88a5f" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#a88a5f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2d9ce" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6f6258" }} minTickGap={24} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fontSize: 11, fill: "#6f6258" }}
            tickFormatter={(v: number) => (v >= 100000 ? `${Math.round(v / 100000)}k kr` : `${Math.round(v / 100)} kr`)}
          />
          <Tooltip
            cursor={{ stroke: "#cbbdac" }}
            contentStyle={{ borderRadius: 6, border: "1px solid #e2d9ce", background: "#fffdf9", fontSize: 13 }}
            formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { label: string; orders: number } | undefined
              return p ? `${p.label} · ${p.orders} ${p.orders === 1 ? "order" : "orders"}` : ""
            }}
          />
          <Area type="monotone" dataKey="revenue_ore" stroke="#7d6440" strokeWidth={1.75} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
