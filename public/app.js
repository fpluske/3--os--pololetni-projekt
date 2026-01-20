const shareInput = document.getElementById('shareId')
const loadBtn = document.getElementById('loadBtn')
const newBtn = document.getElementById('newBtn')
const textForm = document.getElementById('textForm')
const textInput = document.getElementById('textInput')
const textList = document.getElementById('textList')
const fileForm = document.getElementById('fileForm')
const fileInput = document.getElementById('fileInput')
const fileList = document.getElementById('fileList')

let currentShare = ''

function setShareFromPath () {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'share' && parts[1]) {
    shareInput.value = parts[1]
    currentShare = parts[1]
    fetchData()
  }
}

async function generateShareId () {
  const res = await fetch('/api/share-id')
  const data = await res.json()
  shareInput.value = data.shareId
}

async function fetchData () {
  if (!currentShare) return
  const res = await fetch(`/api/${currentShare}`)
  const data = await res.json()
  renderTexts(data.texts || [])
  renderFiles(data.files || [])
  const url = `${window.location.origin}/share/${currentShare}`
  history.replaceState({}, '', `/share/${currentShare}`)
  document.title = `Share ${currentShare}`
  console.log('Share URL', url)
}

function renderTexts (items) {
  textList.innerHTML = ''
  items.sort((a, b) => b.createdAt - a.createdAt)
  for (const item of items) {
    const li = document.createElement('li')
    const date = new Date(item.createdAt).toLocaleString()
    li.innerHTML = `<div class="muted">${date}</div><div>${escapeHtml(item.body)}</div>`
    textList.appendChild(li)
  }
}

function renderFiles (items) {
  fileList.innerHTML = ''
  items.sort((a, b) => b.mtime - a.mtime)
  for (const item of items) {
    const li = document.createElement('li')
    const link = document.createElement('a')
    link.href = `/api/${currentShare}/files/${encodeURIComponent(item.name)}`
    link.textContent = `${item.name} (${formatSize(item.size)})`
    link.target = '_blank'
    li.appendChild(link)
    fileList.appendChild(li)
  }
}

function formatSize (bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(1)
  return `${size} ${sizes[i]}`
}

function escapeHtml (str) {
  return str.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c))
}

loadBtn.addEventListener('click', () => {
  const val = shareInput.value.trim()
  if (!val) return alert('Zadej share-id')
  currentShare = val
  fetchData()
})

newBtn.addEventListener('click', async () => {
  await generateShareId()
})

textForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const body = textInput.value.trim()
  if (!currentShare) return alert('Nejprve zadej share-id')
  if (!body) return
  const res = await fetch(`/api/${currentShare}/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: body })
  })
  if (!res.ok) {
    const msg = await res.text()
    return alert(msg)
  }
  textInput.value = ''
  fetchData()
})

fileForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!currentShare) return alert('Nejprve zadej share-id')
  if (!fileInput.files.length) return
  const form = new FormData()
  for (const f of fileInput.files) form.append('files', f)
  const res = await fetch(`/api/${currentShare}/files`, { method: 'POST', body: form })
  if (!res.ok) {
    const msg = await res.text()
    return alert(msg)
  }
  fileInput.value = ''
  fetchData()
})

setShareFromPath()
