import { MarkdownRenderer } from 'obsidian';

export class CanvaView {
	private url: string;
	private container: HTMLElement;

	constructor(url: string, container: HTMLElement) {
		this.url = url;
		this.container = container;
		this.render();
	}

	async render() {
		try {
			const wrapper = this.container.createEl('div', {
				cls: 'canva-embed-wrapper',
				attr: {
					style: 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;'
				}
			});

			const loading = wrapper.createEl('div', {
				text: 'Loading Canva design...',
				attr: {
					style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'
				}
			});

			const iframe = document.createElement('iframe');
			const designId = this.extractDesignId(this.url);

			if (!designId) {
				throw new Error('Invalid Canva URL format');
			}

			// Directly convert edit URL to view URL
			const viewUrl = this.url.replace('/edit', '/view');
			
			// Add embed parameter if not already present
			const urlObj = new URL(viewUrl);
			if (!urlObj.searchParams.has('embed')) {
				urlObj.searchParams.set('embed', '1');
			}

			iframe.src = urlObj.toString();
			iframe.style.position = 'absolute';
			iframe.style.top = '0';
			iframe.style.left = '0';
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.style.border = 'none';

			// Modified iframe permissions
			iframe.allow = 'fullscreen';
			iframe.setAttribute('allowfullscreen', '');
			iframe.setAttribute('frameborder', '0');
			iframe.setAttribute('scrolling', 'no');

			// Simplified sandbox permissions
			iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation');


			// Load handling
			iframe.onload = () => {
				loading.remove();
				setTimeout(() => {
					if (!iframe.contentWindow) {
						this.showFallback(wrapper, this.url);
					}
				}, 2000);
			};

			wrapper.appendChild(iframe);
			this.container.empty();
			this.container.appendChild(wrapper);

			// Fallback timeout
			setTimeout(() => {
				if (loading.parentElement) {
					this.showFallback(wrapper, this.url);
				}
			}, 5000);

		} catch (error) {
			console.error('Canva render error:', error);
			this.showFallback(this.container, this.url);
		}
	}

	private extractDesignId(url: string): string | null {
		try {
			const urlObj = new URL(url);
			if (!urlObj.hostname.includes('canva.com')) {
				return null;
			}

			// Handle both edit and view URLs
			const pathParts = urlObj.pathname.split('/');
			const designIndex = pathParts.indexOf('design');

			if (designIndex === -1 || designIndex + 1 >= pathParts.length) {
				return null;
			}

			// Extract clean design ID
			const designId = pathParts[designIndex + 1].split('?')[0];
			return designId;
		} catch {
			return null;
		}
	}

	private showFallback(container: HTMLElement, embedUrl: string) {
		container.empty();

		const fallback = container.createEl('div', {
			cls: 'canva-fallback',
			attr: {
				style: 'padding: 1em; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 4px;'
			}
		});

		fallback.createEl('p', {
			text: 'Unable to embed Canva design. Please open in browser.',
			attr: { style: 'color: #e65100; margin-bottom: 1em;' }
		});

		fallback.createEl('a', {
			text: 'Open in Canva',
			attr: {
				href: this.url,
				target: '_blank',
				rel: 'noopener noreferrer',
				style: 'color: #3f51b5; text-decoration: underline;'
			}
		});
	}
}
