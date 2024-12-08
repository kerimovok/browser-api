import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { BaseRequest } from '../types/common'

export interface ScreenshotRequest extends BaseRequest {
	viewportWidth?: number
	viewportHeight?: number
}

const router = Router()

router.post(
	'/screenshot',
	async (req: Request<{}, {}, ScreenshotRequest>, res: Response) => {
		const browserManager = new BrowserManager()

		try {
			const {
				url,
				viewportWidth,
				viewportHeight,
				userAgent,
				extraHTTPHeaders,
			} = req.body
			const page = await browserManager.createPage()

			if (viewportWidth && viewportHeight) {
				await page.setViewport({
					width: viewportWidth,
					height: viewportHeight,
				})
			}

			if (userAgent) {
				await page.setUserAgent(userAgent)
			}

			if (extraHTTPHeaders) {
				await page.setExtraHTTPHeaders(extraHTTPHeaders)
			}

			await page.goto(url, BrowserManager.getNavigationOptions())
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
