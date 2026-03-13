(() => {
    const rawBase = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl) ? String(window.APP_CONFIG.apiBaseUrl) : '';
    const trimmed = rawBase.trim();
    const baseUrl = trimmed.length > 0 ? trimmed.replace(/\/+$/, '') : '';

    const joinUrl = (path) => {
        const p = String(path || '');
        if (p.startsWith('http://') || p.startsWith('https://')) return p;
        const normalizedPath = p.startsWith('/') ? p : `/${p}`;
        return `${baseUrl}${normalizedPath}`;
    };

    window.apiClient = {
        baseUrl,
        request: (path, options) => fetch(joinUrl(path), options),
        url: joinUrl
    };
})();
