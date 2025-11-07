'use client'

import { Editor, type IAllProps } from '@tinymce/tinymce-react'

export type TinyEditorProps = IAllProps

export function TinyEditor({ licenseKey, tinymceScriptSrc, init, ...props }: TinyEditorProps) {
  return (
    <Editor
      licenseKey={licenseKey ?? 'gpl'}
      tinymceScriptSrc={tinymceScriptSrc ?? '/tinymce/tinymce.min.js'}
      init={{
        skin: 'oxide-dark',
        content_css: 'dark',
        ...(init ?? {}),
      }}
      {...props}
    />
  )
}
