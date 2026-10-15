'use strict';

function buildNotificationContent(status, agent, hostname, workspaceName, paneName) {
    const name = typeof agent === 'string' && agent.trim() ? agent.trim() : 'Herdr';
    const baseName = name.replace(/\s+Agent$/i, '');
    const agentTitle = `${baseName.charAt(0).toUpperCase()}${baseName.slice(1)} Agent`;
    const host = typeof hostname === 'string' && hostname.trim() ? hostname.trim() : 'localhost';
    const title = `[${host}] ${agentTitle}`;
    const normalizedAgent = typeof agent === 'string' ? agent.toLowerCase().trim() : '';
    const agentWords = normalizedAgent.split(/[^a-z0-9]+/);
    const iconByAgent = {
        amp: 'amp',
        antigravity: 'antigravity',
        agy: 'antigravity',
        claude: 'claude',
        cline: 'cline',
        codex: 'codex',
        copilot: 'copilot',
        cursor: 'cursor',
        devin: 'devin',
        gemini: 'gemini',
        grok: 'grok',
        hermes: 'hermes',
        kilo: 'kilo',
        kimi: 'kimi',
        kiro: 'kiro',
        mastracode: 'mastra',
        mastra: 'mastra',
        opencode: 'opencode',
        pi: 'pi',
        qoder: 'qoder',
        qodercli: 'qoder',
        qwen: 'qwen',
    };
    const isOhMyPi = /^oh\s+my\s+pi(?:\b|$)/.test(normalizedAgent);
    const iconAgent = isOhMyPi ? undefined : agentWords.find(word => iconByAgent[word]);
    const icon = iconAgent ? `notifications/${iconByAgent[iconAgent]}.png` : undefined;

    const content = icon ? { title, icon } : { title };

    if (typeof status !== 'string' || !status.trim()) return null;
    const workspace = typeof workspaceName === 'string' && workspaceName.trim() ? workspaceName.trim() : 'workspace';
    const pane = typeof paneName === 'string' && paneName.trim() ? paneName.trim() : 'pane';
    return { ...content, body: `Agent is ${status.trim()} on ${workspace} - ${pane}` };
}

module.exports = { buildNotificationContent };
