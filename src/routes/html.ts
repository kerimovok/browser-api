import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { BaseRequest } from '../types/common'

export interface HTMLRequest extends BaseRequest {}

const router = Router()

router.post(
	'/html',
	async (req: Request<{}, {}, HTMLRequest>, res: Response) => {
		const browserManager = new BrowserManager()

		try {
			const { url, waitForSelector } = req.body
			const page = await browserManager.createPage()

			await page.goto(url, BrowserManager.getNavigationOptions())

			if (waitForSelector) {
				await page.waitForSelector(waitForSelector)
			}

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
