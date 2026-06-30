import React, { Component } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

class LineGraph extends Component {
    formatTick = (time) => {
        const date = new Date(time);
        return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    renderTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        const value = payload[0].value;
        const date = new Date(label).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        return (
            <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-md text-sm">
                <p className="text-gray-400">{date}</p>
                <p className="font-bold">{value}</p>
            </div>
        );
    };

    render() {
        const data = this.props.values?.map((point) => {
            const data = point.mapValue.fields;
            const date = new Date(data.date.timestampValue);
            return {
                value: data.elo.stringValue,
                time: date.getTime(),
                dateObj: date,
            };
        }) ?? [];

        const values = data.map((point) => point.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        var pad = (max - min) * 0.08;
        if (pad === 0) {
            pad = 100;
        }
        const yDomain = [
            Math.floor((min - pad) * 100) / 100,
            Math.ceil((max + pad) * 100) / 100,
        ];

        return (
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#364153" />
                    <XAxis
                        dataKey="time"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={this.formatTick}
                        tick={{ fontSize: "14px" }}
                    />
                    <YAxis domain={yDomain} tick={{ fontSize: "14px" }} />
                    <Tooltip content={this.renderTooltip} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2b7fff"
                        strokeWidth={2}
                        dot={{ r: 2, stroke: "#2b7fff", fill: "#2b7fff" }}
                        activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default LineGraph;
