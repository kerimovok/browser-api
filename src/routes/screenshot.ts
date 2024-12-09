import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { ScreenshotRequest } from '../types/common'

const router = Router()

router.post(
	'/screenshot',
	async (req: Request<{}, {}, ScreenshotRequest>, res: Response) => {
		const browserManager = new BrowserManager()

		try {
			const { viewportWidth, viewportHeight, ...baseOptions } = req.body
			const page = await browserManager.createPage()

			if (viewportWidth && viewportHeight) {
				await page.setViewport({
					width: viewportWidth,
					height: viewportHeight,
				})
			}

			await browserManager.setupPage(page, baseOptions)
			const screenshotBuffer = await page.screenshot({
				encoding: 'base64',
			})

			res.send({ image: screenshotBuffer })
		} catch (error) {
			console.error('Error taking screenshot:', error)
			res.status(500).send({ error: 'Failed to take screenshot' })
		} finally {
			await browserManager.close()
		}
	}
)

export default router