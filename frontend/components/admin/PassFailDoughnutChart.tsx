'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

type Props = {
  labels: string[];
  data: number[];
};

export default function PassFailDoughnutChart({ labels, data }: Props) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            label: 'Attempts',
            data,
            backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(239, 68, 68, 0.85)'],
            borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
            borderWidth: 1,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      }}
    />
  );
}
