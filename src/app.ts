import { Hono } from 'hono'

export const app = new Hono()

app.get('/', (c) => c.text('Hello Hono Azion!'))

app.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body['file']

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    const filename = file.name
    const extension = filename.split('.').pop() || 'unknown'
    const mimeType = file.type

    return c.json({
      filename,
      extension,
      mimeType
    })
  } catch (error) {
    return c.json({ error: 'Failed to process file upload' }, 500)
  }
})
