import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { nanoid } from 'nanoid'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT || 5000
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'uploads')
const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_BYTES || '10485760', 10) // 10 MB default

fs.mkdirSync(DATA_DIR, { recursive: true })

app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(process.cwd(), 'public')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const shareId = req.params.shareId
    const dir = path.join(DATA_DIR, shareId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, safeName)
  }
})
const upload = multer({ storage, limits: { fileSize: MAX_SIZE } })

function ensureShareId (req, res, next) {
  const { shareId } = req.params
  if (!shareId || !/^[a-zA-Z0-9_-]{3,64}$/.test(shareId)) {
    return res.status(400).json({ error: 'Invalid share id. Use 3-64 chars a-z A-Z 0-9 _ -' })
  }
  next()
}

app.get('/api/share-id', (req, res) => {
  const id = nanoid(8)
  res.json({ shareId: id })
})

app.get('/api/:shareId', ensureShareId, (req, res) => {
  const dir = path.join(DATA_DIR, req.params.shareId)
  if (!fs.existsSync(dir)) return res.json({ files: [], texts: [] })

  const files = []
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isFile()) {
      files.push({ name: file, size: stat.size, mtime: stat.mtimeMs })
    }
  }

  let texts = []
  const textFile = path.join(dir, 'texts.json')
  if (fs.existsSync(textFile)) {
    try {
      texts = JSON.parse(fs.readFileSync(textFile, 'utf8'))
    } catch (err) {
      console.error('Failed to read texts', err)
    }
  }
  res.json({ files, texts })
})

app.post('/api/:shareId/text', ensureShareId, (req, res) => {
  const dir = path.join(DATA_DIR, req.params.shareId)
  fs.mkdirSync(dir, { recursive: true })
  const textFile = path.join(dir, 'texts.json')
  const entry = {
    id: nanoid(6),
    body: req.body.text || '',
    createdAt: Date.now()
  }
  let list = []
  if (fs.existsSync(textFile)) {
    try {
      list = JSON.parse(fs.readFileSync(textFile, 'utf8'))
    } catch (err) {
      console.error('Failed to read texts', err)
    }
  }
  list.push(entry)
  fs.writeFileSync(textFile, JSON.stringify(list, null, 2))
  res.status(201).json(entry)
})

app.post('/api/:shareId/files', ensureShareId, upload.array('files', 5), (req, res) => {
  res.status(201).json({ uploaded: (req.files || []).map(f => ({ name: f.filename, size: f.size })) })
})

app.get('/api/:shareId/files/:fileName', ensureShareId, (req, res) => {
  const { shareId, fileName } = req.params
  const filePath = path.join(DATA_DIR, shareId, fileName)
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found')
  res.sendFile(filePath)
})

app.get('/share/:shareId', ensureShareId, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
})

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Share-id service running on http://localhost:${PORT}`)
})
