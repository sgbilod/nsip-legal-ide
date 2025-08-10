/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { ContractTemplate } from '../models/ContractTemplate';

export class TemplateManagerService {
    private templates: Map<string, ContractTemplate>;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.templates = new Map();
        this.loadTemplates();
    }

    public async getTemplate(id: string): Promise<ContractTemplate | undefined> {
        return this.templates.get(id);
    }

    public async getAllTemplates(): Promise<ContractTemplate[]> {
        return Array.from(this.templates.values());
    }

    public async createTemplate(template: ContractTemplate): Promise<void> {
        if (this.templates.has(template.id)) {
            throw new Error('Template already exists');
        }
        this.templates.set(template.id, template);
        await this.saveTemplates();
    }

    public async updateTemplate(id: string, template: ContractTemplate): Promise<void> {
        if (!this.templates.has(id)) {
            throw new Error('Template not found');
        }
        this.templates.set(id, template);
        await this.saveTemplates();
    }

    public async deleteTemplate(id: string): Promise<void> {
        if (!this.templates.has(id)) {
            throw new Error('Template not found');
        }
        this.templates.delete(id);
        await this.saveTemplates();
    }

    public async previewTemplate(template: ContractTemplate): Promise<string> {
        try {
            const previewContent = `Preview of Template: ${template.name}\n\n${template.content}`;
            return previewContent;
        } catch (error) {
            console.error('Error generating template preview:', error);
            throw new Error('Failed to generate template preview');
        }
    }

    private async loadTemplates(): Promise<void> {
        try {
            const templateData = this.context.globalState.get<ContractTemplate[]>('contractTemplates', []);
            templateData.forEach(template => {
                this.templates.set(template.id, template);
            });
        } catch (error) {
            console.error('Error loading templates:', error);
            throw new Error('Failed to load templates');
        }
    }

    private async saveTemplates(): Promise<void> {
        try {
            const templateData = Array.from(this.templates.values());
            await this.context.globalState.update('contractTemplates', templateData);
        } catch (error) {
            console.error('Error saving templates:', error);
            throw new Error('Failed to save templates');
        }
    }
}
