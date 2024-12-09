import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { HTMLRequest } from '../types/common'

const router = Router()

router.post(
	'/html',
	async (req: Request<{}, {}, HTMLRequest>, res: Response) => {
		const browserManager = new BrowserManager()

		try {
			const page = await browserManager.createPage()
			await browserManager.setupPage(page, req.body)

			const html = await page.content()
			res.send({ html })
		} catch (error) {
			console.error('Error fetching HTML:', error)
			res.status(500).send({ error: 'Failed to fetch HTML' })
		} finally {
			await browserManager.close()
		}
	}
)

export default router
