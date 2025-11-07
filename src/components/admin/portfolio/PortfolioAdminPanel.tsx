import { useState, useEffect } from 'react'
import { Portfolio } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

interface FormData {
  title: string
  description: string
  category: 'photography' | 'websites' | 'apps' | 'marketing'
  image_url: string
  image_alt: string
  project_url: string
  client_name: string
  project_date: string
  technologies: string
  is_featured: boolean
  sort_order: number
  status: 'active' | 'inactive'
}

const initialFormData: FormData = {
  title: '',
  description: '',
  category: 'websites',
  image_url: '',
  image_alt: '',
  project_url: '',
  client_name: '',
  project_date: '',
  technologies: '',
  is_featured: false,
  sort_order: 0,
  status: 'active'
}

export default function PortfolioAdminPanel() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Load portfolios
  const loadPortfolios = async (category: string = 'all') => {
    try {
      setLoading(true)
      const url = category === 'all' 
        ? '/api/portfolios'
        : `/api/portfolios?category=${category}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setPortfolios(data.portfolios)
      } else {
        console.error('Failed to load portfolios:', data.error)
      }
    } catch (error) {
      console.error('Error loading portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolios(selectedCategory)
  }, [selectedCategory])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Preview the image
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image_url: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload image
  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return ''
    
    setUploading(true)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch('/api/portfolios/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (handleAdminUnauthorized(response)) {
        return ''
      }

      const data = await response.json()
      
      if (data.success) {
        setUploadProgress(100)
        setFormData(prev => ({
          ...prev,
          image_url: data.image_url,
          image_alt: prev.image_alt || prev.title
        }))
        return data.image_url
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Fehler beim Upload: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'))
      return ''
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageUrl = formData.image_url
      
      // Upload image if file selected
      if (selectedFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) return
      }
      
      const portfolioData = {
        ...formData,
        image_url: imageUrl,
        technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : []
      }
      
      let response
      if (editingPortfolio) {
        // Update existing portfolio
        response = await fetch(`/api/portfolios/${editingPortfolio.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(portfolioData)
        })
      } else {
        // Create new portfolio
        response = await fetch('/api/portfolios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(portfolioData)
        })
      }

      if (handleAdminUnauthorized(response)) {
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(editingPortfolio ? 'Portfolio aktualisiert!' : 'Portfolio erstellt!')
        setShowForm(false)
        setEditingPortfolio(null)
        setFormData(initialFormData)
        setSelectedFile(null)
        loadPortfolios(selectedCategory)
      } else {
        setMessage('Fehler: ' + data.error)
      }
    } catch (error) {
      console.error('Submit error:', error)
      setMessage('Fehler beim Speichern')
    }
  }

  // Edit portfolio
  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setFormData({
      title: portfolio.title,
      description: portfolio.description || '',
      category: portfolio.category,
      image_url: portfolio.image_url || '',
      image_alt: portfolio.image_alt || '',
      project_url: portfolio.project_url || '',
      client_name: portfolio.client_name || '',
      project_date: portfolio.project_date || '',
      technologies: portfolio.technologies?.join(', ') || '',
      is_featured: portfolio.is_featured || false,
      sort_order: portfolio.sort_order || 0,
      status: portfolio.status
    })
    setSelectedFile(null)
    setShowForm(true)
  }

  // Delete portfolio
  const handleDelete = async (portfolio: Portfolio) => {
    if (!confirm(`Portfolio "${portfolio.title}" wirklich löschen?`)) return
    
    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'DELETE'
      })
      
      if (handleAdminUnauthorized(response)) {
        return
      }

      const data = await response.json()
      
      if (data.success) {
        setMessage('Portfolio gelöscht!')
        loadPortfolios(selectedCategory)
      } else {
        setMessage('Fehler beim Löschen: ' + data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Fehler beim Löschen')
    }
  }

  // Cancel form
  const handleCancel = () => {
    setShowForm(false)
    setEditingPortfolio(null)
    setFormData(initialFormData)
    setSelectedFile(null)
    setMessage('')
  }

  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'photography', label: 'Fotografie' },
    { value: 'websites', label: 'Websites' },
    { value: 'apps', label: 'Apps' },
    { value: 'marketing', label: 'Marketing' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Portfolio Verwaltung</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:from-purple-500 hover:to-pink-400"
        >
          Portfolio hinzufügen
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded border ${message.includes('Fehler') ? 'bg-red-500/20 text-red-200 border-red-500/40' : 'bg-green-500/20 text-green-200 border-green-500/40'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">
            {editingPortfolio ? 'Portfolio bearbeiten' : 'Neues Portfolio'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Titel*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Kategorie*</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as FormData['category'],
                    }))
                  }
                  className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                  required
                >
                  <option value="photography">Fotografie</option>
                  <option value="websites">Websites</option>
                  <option value="apps">Apps</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Kunde</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                  placeholder="Kundenname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Projektdatum</label>
                <input
                  type="text"
                  value={formData.project_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
                  className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                  placeholder="z.B. 2024 oder März 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Projekt URL</label>
                <input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                  className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Reihenfolge</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-300">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                rows={3}
                placeholder="Projektbeschreibung..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-300">Technologien</label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                placeholder="React, Next.js, TypeScript (durch Komma getrennt)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-300">Bild Alt-Text</label>
              <input
                type="text"
                value={formData.image_alt}
                onChange={(e) => setFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
                placeholder="Beschreibung für Barrierefreiheit"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-300">Bild hochladen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
              />
              {selectedFile && (
                <p className="text-sm text-purple-200 mt-1">
                  Datei ausgewählt: {selectedFile.name}
                </p>
              )}
              {uploading && (
                <div className="mt-2">
                  <div className="bg-purple-900/40 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-purple-200 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
            
            {formData.image_url && (
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Vorschau</label>
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="max-w-xs h-auto rounded border border-purple-500/40"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-purple-200">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="mr-2 bg-black/40 border-purple-500/40"
                />
                Featured Portfolio
              </label>
              
              <label className="flex items-center text-purple-200">
                <input
                  type="checkbox"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                  className="mr-2 bg-black/40 border-purple-500/40"
                />
                Aktiv
              </label>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:from-purple-500 hover:to-pink-400 disabled:opacity-50"
              >
                {uploading ? 'Wird hochgeladen...' : (editingPortfolio ? 'Aktualisieren' : 'Erstellen')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-purple-700/40 text-purple-200 px-4 py-2 rounded hover:bg-purple-600/40 hover:text-white border border-purple-500/40"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Einträge</h3>
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-300">Filter nach Kategorie:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-purple-500/40 rounded bg-black/40 text-white outline-none focus:border-purple-300"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-purple-200">Lade...</div>
        ) : portfolios.length === 0 ? (
          <div className="text-purple-400">Keine Portfolio-Einträge gefunden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left p-2 text-purple-300">Bild</th>
                  <th className="text-left p-2 text-purple-300">Titel</th>
                  <th className="text-left p-2 text-purple-300">Kategorie</th>
                  <th className="text-left p-2 text-purple-300">Kunde</th>
                  <th className="text-left p-2 text-purple-300">Datum</th>
                  <th className="text-left p-2 text-purple-300">Status</th>
                  <th className="text-left p-2 text-purple-300">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="border-b border-purple-500/20">
                    <td className="p-2">
                      {portfolio.image_url && (
                        <img 
                          src={portfolio.image_url} 
                          alt={portfolio.image_alt || portfolio.title}
                          className="w-16 h-10 object-cover rounded border border-purple-500/40"
                        />
                      )}
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium text-white">{portfolio.title}</div>
                        {portfolio.is_featured && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1 rounded border border-yellow-500/40">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 capitalize text-purple-200">{portfolio.category}</td>
                    <td className="p-2 text-purple-200">{portfolio.client_name || '-'}</td>
                    <td className="p-2 text-purple-200">{portfolio.project_date || '-'}</td>
                    <td className="p-2">
                      <span className={`text-xs px-2 py-1 rounded border ${portfolio.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'}`}>
                        {portfolio.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(portfolio)}
                          className="text-purple-400 hover:text-purple-200"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDelete(portfolio)}
                          className="text-red-400 hover:text-red-200"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}