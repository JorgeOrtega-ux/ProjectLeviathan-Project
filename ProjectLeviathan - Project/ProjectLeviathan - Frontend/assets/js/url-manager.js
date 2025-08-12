let urlManagerConfig = null;
let urlMap = null;

function initUrlManager() {
    urlManagerConfig = window.PROJECT_CONFIG;
    urlMap = {
        home: '',
        explore: 'explore',
        'settings-profile': 'settings/your-account',
        'settings-login': 'settings/login',
        'settings-accessibility': 'settings/accessibility',
        'help-privacy': 'help/privacy',
        'help-terms': 'help/terms',
        'help-cookies': 'help/cookies',
        'help-suggestions': 'help/suggestions'
    };
}

function generateUrl(section, subsection = null) {
    if (!urlManagerConfig) return '#';
    
    let path = '';

    if (section === 'home') {
        path = '';
    } else if (section === 'explore') {
        path = 'explore';
    } else if (section === 'settings') {
        const sub = subsection || 'profile';
        switch (sub) {
            case 'profile':
                path = 'settings/your-account';
                break;
            case 'login':
                path = 'settings/login';
                break;
            case 'accessibility':
                path = 'settings/accessibility';
                break;
            default:
                path = 'settings/your-account';
        }
    } else if (section === 'help') {
        const sub = subsection || 'privacy';
        switch (sub) {
            case 'privacy':
                path = 'help/privacy';
                break;
            case 'terms':
                path = 'help/terms';
                break;
            case 'cookies':
                path = 'help/cookies';
                break;
            case 'suggestions':
                path = 'help/suggestions';
                break;
            default:
                path = 'help/privacy';
        }
    }

    return path ? `${urlManagerConfig.baseUrl}/${path}` : urlManagerConfig.baseUrl;
}

function navigateToUrl(section, subsection = null, updateHistory = true) {
    if (!urlManagerConfig) return;
    
    const url = generateUrl(section, subsection);
    
    if (updateHistory && window.location.href !== url) {
        history.pushState({
            section: section,
            subsection: subsection
        }, '', url);
    }

    updatePageTitle(section, subsection);
}

function updatePageTitle(section, subsection = null) {
    const titles = {
        home: 'Página Principal - ProjectLeviathan',
        explore: 'Explorar Comunidades - ProjectLeviathan',
        settings: 'Configuración - ProjectLeviathan',
        help: 'Ayuda y Recursos - ProjectLeviathan'
    };

    const title = titles[section] || 'ProjectLeviathan';
    document.title = title;
}

function getCurrentUrlState() {
    if (!urlManagerConfig) return null;
    
    const section = urlManagerConfig.currentSection;
    const subsection = urlManagerConfig.currentSubsection;
    
    return {
        section: section,
        subsection: subsection,
        isSettingsSection: section === 'settings',
        isHelpSection: section === 'help'
    };
}

function setupPopStateHandler(callback) {
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            const { section, subsection } = event.state;
            callback(section, subsection, false);
        } else {
            callback('home', null, false);
        }
    });
}

function setInitialHistoryState() {
    if (!urlManagerConfig) return;
    
    const currentState = getCurrentUrlState();
    
    if (!history.state && currentState) {
        history.replaceState({
            section: currentState.section,
            subsection: currentState.subsection
        }, '', window.location.href);
    }
}

export {
    initUrlManager,
    generateUrl,
    navigateToUrl,
    updatePageTitle,
    getCurrentUrlState,
    setupPopStateHandler,
    setInitialHistoryState
};