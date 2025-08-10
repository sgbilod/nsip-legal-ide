import * as vscode from 'vscode';
import { AdvancedDocumentAnalyzerService } from '../core/services/AdvancedDocumentAnalyzerService';
import { DocumentAnalysis } from '../core/models/DocumentAnalysis';

export class DocumentAnalysisViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'nsipDocumentAnalysisView';
    // ...existing code...

        constructor() {}

    resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
    ) {
        // ...existing code...
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.webview.html = this._getHtmlForWebview([]);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'analyzeDocument') {
                const analysis: DocumentAnalysis = await AdvancedDocumentAnalyzerService.analyze(message.text);
                webviewView.webview.html = this._getHtmlForWebview([analysis]);
            }
        });
    }

    private _getHtmlForWebview(analyses: DocumentAnalysis[]): string {
        const resultsHtml = analyses.map(a => `
            <div class="analysis-result">
                <h3>Document Analysis</h3>
                <p><strong>Sentiment Scores:</strong> ${a.sentimentScores.join(', ')}</p>
                <ul>
                    ${a.clauses.map((c: any) => `<li>${c.category}: ${c.text}</li>`).join('')}
                </ul>
                <p><strong>Entities:</strong> ${a.entities.join(', ')}</p>
                <p><strong>Risks:</strong> ${a.risks.join(', ')}</p>
                <p><strong>Timestamp:</strong> ${a.timestamp.toString()}</p>
                <p><strong>Version:</strong> ${a.version}</p>
                <h4>Suggestions</h4>
                <ul>
                    ${(a.suggestions && a.suggestions.length > 0) ? a.suggestions.map((s: string) => `<li>${s}</li>`).join('') : '<li>No suggestions</li>'}
                </ul>
            </div>
        `).join('');
        return `
            <html>
                <body>
                    <h1>Document Analysis</h1>
                    <textarea id="docText" rows="10" cols="60"></textarea><br>
                    <button onclick="analyze()">Analyze</button>
                    <div id="results">${resultsHtml}</div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        function analyze() {
                            const text = document.getElementById('docText').value;
                            vscode.postMessage({ command: 'analyzeDocument', text });
                        }
                    </script>
                </body>
            </html>
        `;
    }
}
