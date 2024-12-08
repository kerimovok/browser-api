import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { BaseRequest } from '../types/common'

export interface ScriptRequest extends BaseRequest {
	script: string
}

const router = Router()

router.post(
	'/script',
	async (req: Request<{}, {}, ScriptRequest>, res: Response) => {
		const browserManager = new BrowserManager()

		try {
			const { url, script, waitForSelector } = req.body
			const page = await browserManager.createPage()

			await page.goto(url, BrowserManager.getNavigationOptions())

			if (waitForSelector) {
				await page.waitForSelector(waitForSelector)
			}

			const result = await page.evaluate(script)
			res.send({ result })
		} catch (error) {
			console.error('Error executing script:', error)
			res.status(500).send({ error: 'Failed to execute script' })
		} finally {
			await browserManager.close()
		}
	}
)

export default router
