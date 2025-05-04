import { Router, type Request, type Response } from 'express'
import { BrowserPool } from '../utils/browser-pool'
import type { MetadataRequest } from '../types/common'

const router = Router()

router.post(
	'/metadata',
	async (req: Request<{}, {}, MetadataRequest>, res: Response) => {
		const browserManager =
			await BrowserPool.getInstance().getBrowserManager()

		try {
			const page = await browserManager.createPage()
			await browserManager.setupPage(page, req.body)

			const metadata = await page.evaluate(() => {
				const getMetaContent = (name: string) => {
					const element = document.querySelector(
						`meta[name="${name}"], meta[property="${name}"]`
					)
					return element ? element.getAttribute('content') : null
				}

				return {
					title: document.title,
					description:
						getMetaContent('description') ||
						getMetaContent('og:description'),
					image: getMetaContent('og:image'),
					url: getMetaContent('og:url') || window.location.href,
					type: getMetaContent('og:type'),
					siteName: getMetaContent('og:site_name'),
				}
			})

			res.send({ metadata })
		} catch (error) {
			console.error('Error fetching metadata:', error)
			res.status(500).send({ error: 'Failed to fetch metadata' })
		} finally {
			BrowserPool.getInstance().releaseBrowserManager(browserManager)
		}
	}
)

export default router
