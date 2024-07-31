import { extractJSON } from "@/libs/extractJSON";
import React, { useEffect, useState } from "react";
import Spinner from "../atoms/Spinner";
import styled from "styled-components";
import { findBigNumber } from "@/libs/findBigNumber";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DataIT } from "@/json/data";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const ChartSt = styled.div`
  width: 100%;
  height: 30rem;
  border: 1px solid hsla(240 3.7% 15.9%);
  background: #09090b;
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface props {
  currentData: [];
  indexDate: string;
  response: any;
  isStreaming: boolean;
}
export default function Chart(props: props) {
  // !TEST
  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: "SP500 DAY TRADING",
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawBorder: false,
          color: "#111111",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const labels = props.currentData.map((i: any) => i.timestamp);
  const data = {
    labels,
    datasets: [
      {
        label: "Valor real",
        data: props.currentData.map((i: any) => i.close),
        borderColor: "#2662D9",
        backgroundColor: "#1444a5",
        yAxisID: "y",
        tension: 0.1,
      },
      {
        label: "Predicción",
        data: props.currentData.map((i: any) => i.prediction),
        borderColor: "#E23670",
        backgroundColor: "#a81848",
        yAxisID: "y",
        tension: 0.1,
      },
    ],
  };

  return (
    <ChartSt>
      <Line options={options} data={data} />
      {props.isStreaming && <Spinner />}
    </ChartSt>
  );
}
