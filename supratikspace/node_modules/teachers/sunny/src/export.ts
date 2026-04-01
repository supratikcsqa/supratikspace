import { drawStrokeOnContext } from './ink'
import type { SheetRecord } from './types'

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Unable to read the selected image.'))
    }

    image.src = url
  })
}

export async function renderMarkedSheetBlob(sheet: SheetRecord): Promise<Blob> {
  const image = await loadImageFromBlob(sheet.image)
  const canvas = document.createElement('canvas')
  canvas.width = sheet.width
  canvas.height = sheet.height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create an export surface for this page.')
  }

  context.drawImage(image, 0, 0, sheet.width, sheet.height)

  for (const stroke of sheet.strokes) {
    drawStrokeOnContext(
      context,
      stroke,
      { width: sheet.width, height: sheet.height },
      { width: sheet.width, height: sheet.height },
    )
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to export the marked page.'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to encode the selected image.'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read the selected image.'))
    reader.readAsDataURL(blob)
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}
