"use client";

import ReactECharts from "echarts-for-react";

type ChartData = {
  labels: string[];
  values: number[];
};

type DynamicChartProps = {
  type: "bar" | "line";
  title: string;
  subtitle?: string;
  data: ChartData;
};

export default function DynamicChart({
  type,
  title,
  subtitle,
  data,
}: DynamicChartProps) {
  // Safety check
  if (!data || !data.labels || !data.values) {
    return null;
  }

  const option = {
    tooltip: {
      trigger: "axis",
    },

    grid: {
      left: "3%",
      right: "4%",
      bottom: "8%",
      top: "15%",
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: data.labels,

      axisLine: {
        lineStyle: {
          color: "#D9DDE5",
        },
      },

      axisLabel: {
        color: "#667085",
      },
    },

    yAxis: {
      type: "value",

      axisLine: {
        show: false,
      },

      axisLabel: {
        color: "#667085",
      },

      splitLine: {
        lineStyle: {
          color: "#EEF0F4",
        },
      },
    },

    series: [
      {
        name: title,
        type: type,
        data: data.values,

        smooth: type === "line",

        barMaxWidth: 55,

        itemStyle: {
          color: "#192A56",

          borderRadius:
            type === "bar"
              ? [6, 6, 0, 0]
              : 0,
        },

        lineStyle: {
          color: "#192A56",
          width: 3,
        },

        symbol: "circle",
        symbolSize: 8,
      },
    ],
  };

  return (
    <div className="w-full rounded-xl border border-[#192A56]/10 bg-white p-4">

      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#192A56]">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="h-[300px] w-full sm:h-[340px]">
        <ReactECharts
          option={option}
          style={{
            width: "100%",
            height: "100%",
          }}
          opts={{
            renderer: "canvas",
          }}
        />
      </div>

    </div>
  );
}