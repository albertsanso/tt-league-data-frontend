import { useMemo } from 'react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
  SCATTER_LETTER_ORDER,
  summarizeWinsLossesByLetter,
} from '../../../lib/practicioner-match-analytics'
import { cn } from '../../../lib/utils'
import type { GraphqlMatchSearchRow } from '../../../services/graphql/matches'

const WIN_COLOR = '#639922'
const LOSS_COLOR = '#E24B4A'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export interface PractitionerMatchDistributionBarChartProps {
  matches: GraphqlMatchSearchRow[]
  practitionerFullName: string
  className?: string
}

function buildOptions(): ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: false,
        },
      },
      tooltip: {
        backgroundColor: '#f9fafb',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4b5563' },
        title: { display: true, text: 'Slot letter', color: '#374151' },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#4b5563' },
        grid: { color: '#f3f4f6' },
        title: { display: true, text: 'Matches', color: '#374151' },
      },
    },
    datasets: {
      bar: {
        borderWidth: 0,
        borderRadius: 0,
        borderSkipped: false,
      },
    },
  }
}

export function PractitionerMatchDistributionBarChart({
  matches,
  practitionerFullName,
  className,
}: PractitionerMatchDistributionBarChartProps) {
  const { chartData, hasAny } = useMemo(() => {
    const byLetter = summarizeWinsLossesByLetter(matches, practitionerFullName)
    const wins = SCATTER_LETTER_ORDER.map((L) => byLetter[L].wins)
    const losses = SCATTER_LETTER_ORDER.map((L) => byLetter[L].losses)
    const any = wins.some((n) => n > 0) || losses.some((n) => n > 0)
    return {
      hasAny: any,
      chartData: {
        labels: [...SCATTER_LETTER_ORDER],
        datasets: [
          {
            label: 'Wins',
            data: wins,
            backgroundColor: WIN_COLOR,
            hoverBackgroundColor: WIN_COLOR,
          },
          {
            label: 'Losses',
            data: losses,
            backgroundColor: LOSS_COLOR,
            hoverBackgroundColor: LOSS_COLOR,
          },
        ],
      },
    }
  }, [matches, practitionerFullName])

  const options = useMemo(() => buildOptions(), [])

  if (!hasAny) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
        No win/loss data to chart for slot letters (need a known home/away side, numeric scores, decisive result,
        and letter A–C or X–Z). Ties are omitted.
      </p>
    )
  }

  return (
    <div className={cn('h-80 w-full min-h-[16rem]', className)}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
