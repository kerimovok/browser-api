export interface BaseRequest {
	url: string
	userAgent?: string
	extraHTTPHeaders?: Record<string, string>
	timeout?: number
	waitForSelector?: string
}

export interface ScreenshotRequest extends BaseRequest {
	viewportWidth?: number
	viewportHeight?: number
}

export interface PDFRequest extends BaseRequest {
	format?: string
	margin?: {
		top?: string
		right?: string
		bottom?: string
		left?: string
	}
	printBackground?: boolean
}

export interface HTMLRequest extends BaseRequest {
	// No additional properties needed
}

export interface MetadataRequest extends BaseRequest {
	// No additional properties needed
}

export interface FormRequest extends BaseRequest {
	formSelector: string
	formData: Record<string, string>
	submitButtonSelector: string
}

export interface ScriptRequest extends BaseRequest {
	script: string
}
