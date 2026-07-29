import type { Component } from 'vue'
import {
  Document,
  DocumentCopy,
  EditPen,
  Files,
  FolderOpened,
  Grid,
  Headset,
  Notebook,
  Picture,
  Reading,
  VideoCamera
} from '@element-plus/icons-vue'

export type FileIconTone =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'archive'
  | 'code'
  | 'text'
  | 'default'

export interface FileIconVisual {
  icon: Component
  tone: FileIconTone
  ext: string
}

function extOf(name?: string) {
  if (!name) return ''
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function resolveFileVisual(
  name?: string,
  mimeType?: string
): FileIconVisual {
  const ext = extOf(name)
  const mime = (mimeType || '').toLowerCase()

  if (
    /^image\//.test(mime) ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'heic'].includes(
      ext
    )
  ) {
    return { icon: Picture, tone: 'image', ext: ext || 'img' }
  }

  if (
    /^video\//.test(mime) ||
    ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v'].includes(ext)
  ) {
    return { icon: VideoCamera, tone: 'video', ext }
  }

  if (
    /^audio\//.test(mime) ||
    ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext)
  ) {
    return { icon: Headset, tone: 'audio', ext }
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return { icon: Reading, tone: 'pdf', ext: ext || 'pdf' }
  }

  if (
    ['doc', 'docx'].includes(ext) ||
    mime.includes('word') ||
    mime.includes('msword')
  ) {
    return { icon: Document, tone: 'word', ext: ext || 'doc' }
  }

  if (
    ['xls', 'xlsx', 'csv'].includes(ext) ||
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('csv')
  ) {
    return { icon: Grid, tone: 'excel', ext: ext || 'xls' }
  }

  if (
    ['ppt', 'pptx'].includes(ext) ||
    mime.includes('presentation') ||
    mime.includes('powerpoint')
  ) {
    return { icon: DocumentCopy, tone: 'ppt', ext: ext || 'ppt' }
  }

  if (
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext) ||
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('archive')
  ) {
    return { icon: FolderOpened, tone: 'archive', ext: ext || 'zip' }
  }

  if (
    [
      'js',
      'ts',
      'tsx',
      'jsx',
      'vue',
      'json',
      'html',
      'css',
      'less',
      'scss',
      'py',
      'java',
      'go',
      'rs',
      'cpp',
      'c',
      'h',
      'sql',
      'xml',
      'yaml',
      'yml',
      'md'
    ].includes(ext)
  ) {
    return { icon: EditPen, tone: 'code', ext }
  }

  if (
    ['txt', 'log', 'ini', 'cfg', 'conf', 'rtf'].includes(ext) ||
    (mime.startsWith('text/') && ext !== 'csv')
  ) {
    return { icon: Notebook, tone: 'text', ext: ext || 'txt' }
  }

  return { icon: Files, tone: 'default', ext: ext || 'file' }
}
