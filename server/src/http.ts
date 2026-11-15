import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('../../client/dist', import.meta.url))

const TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.webmanifest': 'application/manifest+json'
}

async function file(path: string): Promise<Buffer | null> {
    try {
        if(!(await stat(path)).isFile()) return null
        return await readFile(path)
    }
    catch { return null }
}

export const http = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://local')
    const path = normalize(join(DIST, decodeURIComponent(url.pathname)))

    if(!path.startsWith(DIST)){
        res.writeHead(403).end()
        return
    }

    const found = await file(path)
    const body = found ?? await file(join(DIST, 'index.html'))

    if(!body){
        res.writeHead(404).end('Client not built. Run npm run build.')
        return
    }

    const type = found ? TYPES[extname(path)] ?? 'application/octet-stream' : TYPES['.html']!
    const cache = found && path.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache }).end(body)
})
