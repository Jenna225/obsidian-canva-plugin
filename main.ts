import { Notice, Plugin, PluginSettingTab, Setting, App } from 'obsidian';
import { CanvaView } from './canvaView';

interface CanvaPluginSettings {
	defaultView: 'presentation' | 'document';
	autoPlay: boolean;
	autoPlayInterval: number;
}

const DEFAULT_SETTINGS: CanvaPluginSettings = {
	defaultView: 'presentation',
	autoPlay: false,
	autoPlayInterval: 3000
};

export default class CanvaPlugin extends Plugin {
	settings: CanvaPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register Canva code block processor with enhanced validation and error handling
		this.registerMarkdownCodeBlockProcessor('canva', (source, el, ctx) => {
			try {
				const url = source.trim();

				// Validate Canva URL
				if (!this.isValidCanvaUrl(url)) {
					this.showError(el, 'Invalid Canva URL. Please use a URL starting with https://www.canva.com/design/');
					return;
				}

				// Create Canva view with current settings
				new CanvaView(url, el);
			} catch (error) {
				console.error('Error processing Canva block:', error);
				this.showError(el, 'Failed to load Canva design. Please check your URL and try again.');
			}
		});

		// Add settings tab
		this.addSettingTab(new CanvaSettingTab(this.app, this));
	}

	private isValidCanvaUrl(url: string): boolean {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname === 'www.canva.com' &&
				urlObj.pathname.startsWith('/design/') &&
				urlObj.pathname.split('/').length >= 3;
		} catch {
			return false;
		}
	}

	private showError(container: HTMLElement, message: string) {
		container.empty();
		container.createEl('div', {
			text: message,
			attr: {
				style: 'color: #c62828; padding: 1em; background: #ffebee; border: 1px solid #ffcdd2; border-radius: 4px;'
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CanvaSettingTab extends PluginSettingTab {
	plugin: CanvaPlugin;

	constructor(app: App, plugin: CanvaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl('h2', {text: 'Canva Embed Settings'});

		new Setting(containerEl)
			.setName('Default View Mode')
			.setDesc('Choose how Canva designs are displayed by default')
			.addDropdown(dropdown => dropdown
				.addOption('presentation', 'Presentation')
				.addOption('document', 'Document')
				.setValue(this.plugin.settings.defaultView)
				.onChange(async (value: 'presentation' | 'document') => {
					this.plugin.settings.defaultView = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-Play')
			.setDesc('Automatically advance slides in presentation mode')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoPlay)
				.onChange(async (value) => {
					this.plugin.settings.autoPlay = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-Play Interval')
			.setDesc('Time between slides (in milliseconds)')
			.addSlider(slider => slider
				.setLimits(1000, 10000, 500)
				.setValue(this.plugin.settings.autoPlayInterval)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.autoPlayInterval = value;
					await this.plugin.saveSettings();
				}));
	}
}
