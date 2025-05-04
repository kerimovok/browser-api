import app from './app'
import { BrowserPool } from './utils/browser-pool'

const port = process.env.PORT || 3004

BrowserPool.getInstance()
	.initialize()
	.then(() => {
		console.log('Browser pool initialized')
	})

const server = app.listen(port, () => {
	console.log(`Server is running on http://0.0.0.0:${port}`)
})

const shutdown = async () => {
	console.log('Shutting down server...')

	await BrowserPool.getInstance().closeAll()

	server.close(() => {
		console.log('Server stopped')
		process.exit(0)
	})
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
