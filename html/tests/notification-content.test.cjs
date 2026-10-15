const assert = require('node:assert/strict');
const test = require('node:test');

const { buildNotificationContent } = require('../src/notification-content');

test('idle notification includes hostname, workspace, and pane', () => {
    assert.deepEqual(buildNotificationContent('idle', 'codex', 'devbox', 'api', 'server'), {
        title: '[devbox] Codex Agent',
        body: 'Agent is idle on api - server',
        icon: 'notifications/codex.png',
    });
});

test('finished notification names the agent and says the work is complete', () => {
    assert.deepEqual(buildNotificationContent('done', 'Codex', 'devbox', 'api', 'server'), {
        title: '[devbox] Codex Agent',
        body: 'Agent is done on api - server',
        icon: 'notifications/codex.png',
    });
});

test('uses the event agent name in the title', () => {
    assert.deepEqual(buildNotificationContent('done', 'claude', 'devbox', 'api', 'server'), {
        title: '[devbox] Claude Agent',
        body: 'Agent is done on api - server',
        icon: 'notifications/claude.png',
    });
});

test('uses the Claude icon for a Claude display label', () => {
    assert.equal(buildNotificationContent('blocked', 'Claude Code: auth').icon, 'notifications/claude.png');
});

test('uses a logo for each Herdr agent with a matching icon', () => {
    const icons = {
        amp: 'amp',
        antigravity: 'antigravity',
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
        mastra: 'mastra',
        opencode: 'opencode',
        pi: 'pi',
        qoder: 'qoder',
        qwen: 'qwen',
    };

    for (const [agent, icon] of Object.entries(icons)) {
        assert.equal(buildNotificationContent('done', agent).icon, `notifications/${icon}.png`, agent);
    }
});

test('leaves agents without a matching logo on the browser default icon', () => {
    for (const agent of ['droid', 'letta', 'maki', 'muse', 'omp', 'oh my pi', 'command code', 'crush', 'prime agent']) {
        assert.equal(buildNotificationContent('done', agent).icon, undefined, agent);
    }
});

test('matches Herdr agent kind aliases and display labels', () => {
    const cases = {
        agy: 'antigravity',
        'Antigravity CLI': 'antigravity',
        'Gemini CLI': 'gemini',
        'GitHub Copilot CLI': 'copilot',
        MastraCode: 'mastra',
        'Qoder CLI': 'qoder',
    };

    for (const [agent, icon] of Object.entries(cases)) {
        assert.equal(buildNotificationContent('done', agent).icon, `notifications/${icon}.png`, agent);
    }
});

test('blocked notification includes workspace and pane', () => {
    assert.deepEqual(buildNotificationContent('blocked', 'Codex', 'devbox', 'api', 'server'), {
        title: '[devbox] Codex Agent',
        body: 'Agent is blocked on api - server',
        icon: 'notifications/codex.png',
    });
});

test('uses a generic agent label when Herdr does not provide an agent name', () => {
    assert.deepEqual(buildNotificationContent('done', null, 'devbox', 'api', 'server'), {
        title: '[devbox] Herdr Agent',
        body: 'Agent is done on api - server',
    });
});

test('describes future status values and uses the browser default icon when no logo matches', () => {
    assert.deepEqual(buildNotificationContent('review', 'droid', 'devbox', 'api', 'server'), {
        title: '[devbox] Droid Agent',
        body: 'Agent is review on api - server',
    });
});
