import { useMemo } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import {
  SCATTER_LETTER_ORDER,
  getOwnScoreClamped,
  getScatterPoint,
  type ScatterLetter,
} from '../../../lib/practicioner-match-analytics'
import { cn } from '../../../lib/utils'
import type { GraphqlMatchSearchRow } from '../../../services/graphql/matches'

ChartJS.register(ScatterController, LinearScale, CategoryScale, PointElement, LineElement, Tooltip, Legend)

export interface PractitionerMatchScatterChartProps {
  matches: GraphqlMatchSearchRow[]
  practitionerFullName: string
  className?: string
}

interface PointMeta {
  x: number
  y: number
  yLabel: string
  x0: number
}

function letterIndex(label: string): number {
  return SCATTER_LETTER_ORDER.indexOf(label as ScatterLetter)
}

function buildOptions(points: PointMeta[]): ChartOptions<'scatter'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx: TooltipItem<'scatter'>) {
            const pt = points[ctx.dataIndex]
            if (!pt) return ''
            return `${pt.yLabel}: ${pt.x0} pts`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 3,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Scored points' },
      },
      y: {
        type: 'category',
        labels: [...SCATTER_LETTER_ORDER],
        offset: true,
        reverse: true,
        ticks: { autoSkip: false },
        title: { display: true, text: 'Letter' },
      },
    },
  }
}

export function PractitionerMatchScatterChart({
  matches,
  practitionerFullName,
  className,
}: PractitionerMatchScatterChartProps) {
  const { chartData, options } = useMemo(() => {
    const points: PointMeta[] = []
    for (const m of matches) {
      const p = getScatterPoint(m, practitionerFullName)
      if (!p) continue
      const x0 = getOwnScoreClamped(m, practitionerFullName) ?? 0
      points.push({ x: p.x, y: p.y, yLabel: p.yLabel, x0 })
    }
    return {
      chartData: {
        datasets: [
          {
            label: 'Matches',
            data: points.map((q) => {
              const yi = letterIndex(q.yLabel)
              return { x: q.x, y: yi >= 0 ? yi : 0 }
            }),
            backgroundColor: 'rgba(37, 99, 235, 0.45)',
            borderColor: 'rgba(37, 99, 235, 0.9)',
            pointRadius: 7,
            pointHoverRadius: 9,
          },
        ],
      },
      options: buildOptions(points),
    }
  }, [matches, practitionerFullName])

  if (chartData.datasets[0].data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
        No matches could be plotted (need a known home/away side, numeric scores, and letter A–C or X–Z).
      </p>
    )
  }

  return (
    <div className={cn('h-80 w-full min-h-[16rem]', className)}>
      <Scatter data={chartData} options={options} />
    </div>
  )
}
