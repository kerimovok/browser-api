import { BrowserManager } from './browser'

export class BrowserPool {
	private static instance: BrowserPool
	private availableBrowsers: BrowserManager[] = []
	private inUseBrowsers: Set<BrowserManager> = new Set()
	private maxPoolSize: number
	private initializationPromise: Promise<void> | null = null

	private constructor(maxPoolSize = 5) {
		this.maxPoolSize = maxPoolSize
	}

	public static getInstance(): BrowserPool {
		if (!BrowserPool.instance) {
			BrowserPool.instance = new BrowserPool()
		}
		return BrowserPool.instance
	}

	public async initialize(): Promise<void> {
		if (this.initializationPromise) {
			return this.initializationPromise
		}

		this.initializationPromise = new Promise<void>(async (resolve) => {
			console.log(
				`Initializing browser pool with ${this.maxPoolSize} instances...`
			)

			const initializations = Array(this.maxPoolSize)
				.fill(0)
				.map(async () => {
					const browser = new BrowserManager()
					await browser.initialize()
					this.availableBrowsers.push(browser)
				})

			await Promise.all(initializations)
			console.log('Browser pool initialized successfully')
			resolve()
		})

		return this.initializationPromise
	}

	public async getBrowserManager(): Promise<BrowserManager> {
		if (!this.initializationPromise) {
			await this.initialize()
		}

		if (this.availableBrowsers.length > 0) {
			const browser = this.availableBrowsers.shift()!
			this.inUseBrowsers.add(browser)
			return browser
		}

		console.log('No available browsers in pool, creating new instance')
		const newBrowser = new BrowserManager()
		await newBrowser.initialize()
		this.inUseBrowsers.add(newBrowser)
		return newBrowser
	}

	public releaseBrowserManager(browser: BrowserManager): void {
		if (this.inUseBrowsers.has(browser)) {
			this.inUseBrowsers.delete(browser)

			if (
				this.availableBrowsers.length + this.inUseBrowsers.size <
				this.maxPoolSize
			) {
				this.availableBrowsers.push(browser)
			} else {
				browser.close().catch((err) => {
					console.error('Error closing browser instance:', err)
				})
			}
		}
	}

	public async closeAll(): Promise<void> {
		console.log('Closing all browsers in pool...')

		const closeBrowsers = [
			...this.availableBrowsers,
			...Array.from(this.inUseBrowsers),
		].map((browser) =>
			browser.close().catch((err) => {
				console.error('Error closing browser instance:', err)
			})
		)

		this.availableBrowsers = []
		this.inUseBrowsers.clear()

		await Promise.all(closeBrowsers)
		console.log('All browsers in pool closed')
	}
}
