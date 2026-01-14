'use client'

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface LineChartProps<T = Record<string, string | number>> {
    data: T[]
    xKey: string
    lines: Array<{
        dataKey: string
        name: string
        color: string
    }>
    title?: string
}

export function LineChart<T = Record<string, string | number>>({ data, xKey, lines, title }: LineChartProps<T>) {
    return (
        <div className="w-full">
            {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey={xKey}
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    {lines.map((line) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    )
}
