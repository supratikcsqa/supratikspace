import { getStroke } from 'perfect-freehand'

import type { InkPoint, InkStroke } from './types'

interface SurfaceSize {
  width: number
  height: number
}

interface SyncCanvasOptions {
  clear?: boolean
}

function toDisplayPoint(
  point: InkPoint,
  source: SurfaceSize,
  target: SurfaceSize,
): InkPoint {
  return {
    x: (point.x / source.width) * target.width,
    y: (point.y / source.height) * target.height,
    pressure: point.pressure ?? 0.5,
  }
}

function createStrokeOutline(
  stroke: InkStroke,
  source: SurfaceSize,
  target: SurfaceSize,
  predictedPoints: InkPoint[] = [],
  last = true,
): number[][] {
  const points = [...stroke.points, ...predictedPoints].map((point) =>
    toDisplayPoint(point, source, target),
  )

  if (points.length === 0) {
    return []
  }

  const hasRealPressure = points.some((point) => point.pressure !== undefined)
  const size = Math.max(1, (stroke.width / source.width) * target.width)

  return getStroke(
    points.map((point) => [point.x, point.y, point.pressure ?? 0.5]),
    {
      size,
      thinning: hasRealPressure ? 0.62 : 0.3,
      smoothing: 0.72,
      streamline: 0.42,
      simulatePressure: !hasRealPressure,
      easing: (value) => value,
      last,
      start: { cap: true, taper: 0 },
      end: { cap: true, taper: 0 },
    },
  )
}

function fillStrokeOutline(
  context: CanvasRenderingContext2D,
  outline: number[][],
): void {
  if (outline.length === 0) {
    return
  }

  context.beginPath()
  context.moveTo(outline[0][0], outline[0][1])

  for (let index = 1; index < outline.length; index += 1) {
    context.lineTo(outline[index][0], outline[index][1])
  }

  context.closePath()
  context.fill()
}

export function drawStrokeOnContext(
  context: CanvasRenderingContext2D,
  stroke: InkStroke,
  source: SurfaceSize,
  target: SurfaceSize,
): void {
  if (stroke.points.length === 0) {
    return
  }

  const lineWidth = Math.max(1, (stroke.width / source.width) * target.width)
  const firstPoint = toDisplayPoint(stroke.points[0], source, target)
  const outline = createStrokeOutline(stroke, source, target)

  context.save()
  context.fillStyle = stroke.color
  context.globalAlpha = stroke.opacity

  if (stroke.points.length === 1 || outline.length < 4) {
    context.beginPath()
    context.arc(firstPoint.x, firstPoint.y, lineWidth / 2, 0, Math.PI * 2)
    context.fill()
    context.restore()
    return
  }

  fillStrokeOutline(context, outline)
  context.restore()
}

export function drawLiveStrokeOnContext(
  context: CanvasRenderingContext2D,
  stroke: InkStroke,
  source: SurfaceSize,
  target: SurfaceSize,
  predictedPoints: InkPoint[] = [],
): void {
  if (stroke.points.length === 0) {
    return
  }

  const lineWidth = Math.max(1, (stroke.width / source.width) * target.width)
  const firstPoint = toDisplayPoint(stroke.points[0], source, target)
  const outline = createStrokeOutline(stroke, source, target, predictedPoints, false)

  context.save()
  context.fillStyle = stroke.color
  context.globalAlpha = stroke.opacity

  if (stroke.points.length === 1 || outline.length < 4) {
    context.beginPath()
    context.arc(firstPoint.x, firstPoint.y, lineWidth / 2, 0, Math.PI * 2)
    context.fill()
    context.restore()
    return
  }

  fillStrokeOutline(context, outline)
  context.restore()
}

export function clearContext(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  context.clearRect(0, 0, width, height)
}

export function syncCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  options: SyncCanvasOptions = {},
): CanvasRenderingContext2D | null {
  const context = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true,
  })

  if (!context) {
    return null
  }

  const ratio = window.devicePixelRatio || 1
  const targetWidth = Math.max(1, Math.round(width * ratio))
  const targetHeight = Math.max(1, Math.round(height * ratio))
  const resized = canvas.width !== targetWidth || canvas.height !== targetHeight

  if (resized) {
    canvas.width = targetWidth
    canvas.height = targetHeight
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0)

  if ((options.clear ?? true) || resized) {
    clearContext(context, width, height)
  }

  return context
}
