'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BarChartProps<T = Record<string, string | number>> {
    data: T[]
    xKey: string
    bars: Array<{
        dataKey: string
        name: string
        color: string
    }>
    title?: string
}

export function BarChart<T = Record<string, string | number>>({ data, xKey, bars, title }: BarChartProps<T>) {
    return (
        <div className="w-full">
            {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    {bars.map((bar) => (
                        <Bar
                            key={bar.dataKey}
                            dataKey={bar.dataKey}
                            name={bar.name}
                            fill={bar.color}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    )
}
