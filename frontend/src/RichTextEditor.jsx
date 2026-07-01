import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import BaseImage from '@tiptap/extension-image'
import { useState, useEffect } from 'react'

function ResizableImageComponent({ node, updateAttributes, selected }) {
  const { src, alt, width } = node.attributes

  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const wrapper = e.target.closest('[data-node-view-wrapper]')
    const imgEl = wrapper ? wrapper.querySelector('img') : null
    const startWidth = imgEl ? imgEl.clientWidth : 300

    const handleMouseMove = (moveEvent) => {
      const currentX = moveEvent.clientX
      const diffX = currentX - startX
      const newWidth = Math.max(80, startWidth + diffX)
      updateAttributes({ width: `${newWidth}px` })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <NodeViewWrapper as="span" className="inline-block relative max-w-full my-3">
      <span className={`relative inline-block max-w-full ${selected ? 'ring-2 ring-emerald-500 rounded-lg' : ''}`}>
        <img
          src={src}
          alt={alt}
          style={{ width: width || 'auto', height: 'auto', display: 'block' }}
          className="max-w-full rounded-lg border border-slate-200 cursor-pointer select-none"
        />
        
        {selected && (
          <span
            onMouseDown={handleMouseDown}
            className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full cursor-se-resize shadow-md flex items-center justify-center hover:scale-125 transition-transform active:bg-emerald-700 select-none z-30"
            title="Arraste para redimensionar"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full block"></span>
          </span>
        )}
      </span>
    </NodeViewWrapper>
  )
}

const ResizableImage = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 'auto',
        renderHTML: attributes => {
          if (!attributes.width || attributes.width === 'auto') return {}
          return { width: attributes.width }
        },
        parseHTML: element => element.getAttribute('width') || 'auto',
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Table as TableIcon, Plus, Trash2, ArrowDown, ArrowRight, Image as ImageIcon,
  Undo2, Redo2, Maximize2, Minimize2
} from 'lucide-react'

function MenuBar({ editor, isFullscreen, onToggleFullscreen }) {
  if (!editor) return null

  const [showTableMenu, setShowTableMenu] = useState(false)

  const btnClass = (active) =>
    `p-1.5 rounded-lg transition-all ${
      active
        ? 'bg-emerald-100 text-emerald-800 shadow-sm'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
    }`

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${btnClass(false)} disabled:opacity-30`}
          title="Desfazer"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${btnClass(false)} disabled:opacity-30`}
          title="Refazer"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title="Sublinhado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Table dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTableMenu(!showTableMenu)}
            className={btnClass(editor.isActive('table'))}
            title="Tabela"
          >
            <TableIcon className="h-4 w-4" />
          </button>

          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 min-w-[180px] space-y-1 animate-in fade-in duration-150">
              {!editor.isActive('table') ? (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    setShowTableMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Inserir Tabela 3×3
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Adicionar Coluna
                  </button>
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    Adicionar Linha
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover Coluna
                  </button>
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover Linha
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir Tabela
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Image */}
        <label
          className={`${btnClass(false)} cursor-pointer`}
          title="Inserir imagem"
        >
          <ImageIcon className="h-4 w-4" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => {
                  editor.chain().focus().setImage({ src: ev.target.result }).run()
                }
                reader.readAsDataURL(file)
              }
              e.target.value = ''
            }}
          />
        </label>
      </div>

      {/* Screen Expand Toggle Button */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className={btnClass(isFullscreen)}
        title={isFullscreen ? "Sair da Tela Cheia" : "Editar em Tela Cheia"}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4 text-emerald-800" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function RichTextEditor({ value, onChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isFullscreen])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: true,
        orderedList: true,
        listItem: true,
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-sm text-slate-800',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            event.preventDefault()
            const file = items[i].getAsFile()
            const reader = new FileReader()
            reader.onload = (ev) => {
              const { state } = view
              const tr = state.tr
              const pos = state.selection.from
              const node = state.schema.nodes.image.create({ src: ev.target.result })
              view.dispatch(tr.insert(pos, node))
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
    },
  })

  // Sync value when it changes outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  return (
    <div className={
      isFullscreen
        ? "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-200"
        : "border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors"
    }>
      {/* Custom Fullscreen Header */}
      {isFullscreen && (
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white shrink-0 shadow-md">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wide">Editor de Texto Cheio</h3>
            <p className="text-[10px] opacity-75 font-semibold mt-0.5">Texto de Estudo / Artigo Completo</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/60 hover:bg-emerald-900/60 rounded-lg text-xs font-bold transition-all border border-emerald-500/30 shadow-sm"
          >
            <Minimize2 className="h-4 w-4" />
            Concluir Edição
          </button>
        </div>
      )}

      <MenuBar
        editor={editor}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      <div className={`overflow-y-auto ${isFullscreen ? 'flex-grow px-4 py-8 bg-slate-100' : 'min-h-[200px] max-h-[400px]'}`}>
        <div className={isFullscreen ? 'max-w-4xl mx-auto' : ''}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Inline styles for Tiptap editor content */}
      <style>{`
        .ProseMirror {
          min-height: 200px;
          outline: none;
        }
        
        /* Fullscreen document editing sheet */
        .fixed .ProseMirror {
          min-height: 70vh;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem 2.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
        }

        .ProseMirror p {
          margin-bottom: 0.5em;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror li {
          margin-bottom: 0.15em;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 0.75em 0;
          border: 1px solid #e2e8f0;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.75em 0;
          table-layout: fixed;
          overflow: hidden;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e2e8f0;
          padding: 0.5em 0.75em;
          text-align: left;
          vertical-align: top;
          min-width: 60px;
          position: relative;
          font-size: 0.85em;
        }
        .ProseMirror th {
          background-color: #f8fafc;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          font-size: 0.75em;
          letter-spacing: 0.05em;
        }
        .ProseMirror td {
          color: #475569;
        }
        .ProseMirror .selectedCell {
          background-color: #d1fae5;
        }
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #10b981;
          cursor: col-resize;
          z-index: 20;
        }
      `}</style>
    </div>
  )
}
