import { Router, type Request, type Response } from 'express'
import { BrowserPool } from '../utils/browser-pool'
import type { ScriptRequest } from '../types/common'

const router = Router()

router.post(
	'/script',
	async (req: Request<{}, {}, ScriptRequest>, res: Response) => {
		const browserManager =
			await BrowserPool.getInstance().getBrowserManager()

		try {
			const { script, ...baseOptions } = req.body
			const page = await browserManager.createPage()

			await browserManager.setupPage(page, baseOptions)
			const result = await page.evaluate(script)

			res.send({ result })
		} catch (error) {
			console.error('Error executing script:', error)
			res.status(500).send({ error: 'Failed to execute script' })
		} finally {
			BrowserPool.getInstance().releaseBrowserManager(browserManager)
		}
	}
)

export default router
