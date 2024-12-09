import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { ScriptRequest } from '../types/common'

const router = Router()

router.post(
	'/script',
	async (req: Request<{}, {}, ScriptRequest>, res: Response) => {
		const browserManager = new BrowserManager()

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
			await browserManager.close()
		}
	}
)

export default router
