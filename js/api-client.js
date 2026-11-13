/**
 * Cliente API Seguro (Puente Frontend <-> PHP 8)
 * Detecta automáticamente entorno estático (GitHub Pages) vs servidor PHP 8.
 */
(function (window) {
    'use strict';

    const state = {
        checked: false,
        available: false,
        authenticated: false,
        role: null,
        csrfToken: ''
    };

    function isStaticOnlyHost() {
        const proto = window.location.protocol;
        const host = window.location.hostname || '';
        return proto === 'file:' || host.endsWith('.github.io');
    }

    async function requestJson(url, options = {}, timeoutMs = 4500) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const headers = Object.assign(
                { 'Accept': 'application/json' },
                options.headers || {}
            );

            if (options.body && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
            if (state.csrfToken && (options.method || 'GET').toUpperCase() !== 'GET') {
                headers['X-CSRF-Token'] = state.csrfToken;
            }

            const response = await fetch(url, {
                method: options.method || 'GET',
                credentials: 'same-origin',
                headers,
                body: options.body || undefined,
                signal: controller.signal
            });

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                return { ok: false, status: response.status, nonJson: true, error: 'Respuesta no JSON del servidor.' };
            }

            const data = await response.json();
            if (!response.ok) {
                return Object.assign({ ok: false, status: response.status }, data);
            }
            return Object.assign({ ok: true, status: response.status }, data);
        } catch (err) {
            return {
                ok: false,
                status: 0,
                networkError: true,
                error: err && err.name === 'AbortError' ? 'Tiempo de espera agotado.' : 'Sin conexión al servidor PHP.'
            };
        } finally {
            clearTimeout(timer);
        }
    }

    async function detectBackend(force = false) {
        if (state.checked && !force) {
            return { ...state };
        }
        if (isStaticOnlyHost()) {
            state.checked = true;
            state.available = false;
            state.authenticated = false;
            state.role = null;
            return { ...state };
        }

        const res = await requestJson('api/auth.php', { method: 'GET' }, 2500);
        state.checked = true;
        if (res.ok && !res.nonJson) {
            state.available = true;
            state.authenticated = Boolean(res.authenticated);
            state.role = res.role || null;
            state.csrfToken = res.csrfToken || '';
        } else {
            state.available = false;
            state.authenticated = false;
            state.role = null;
        }
        return { ...state };
    }

    async function login(scope, credential) {
        await detectBackend();
        if (!state.available) {
            return { ok: false, offline: true, error: 'Backend PHP no disponible en este entorno.' };
        }
        const res = await requestJson('api/auth.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'login', scope, credential })
        });
        if (res.ok) {
            state.authenticated = true;
            state.role = res.role || scope;
            state.csrfToken = res.csrfToken || state.csrfToken;
        }
        return res;
    }

    async function logout() {
        if (!state.available) return { ok: true };
        const res = await requestJson('api/auth.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'logout' })
        });
        if (res.ok) {
            state.authenticated = false;
            state.role = null;
            state.csrfToken = '';
        }
        return res;
    }

    async function changeCredential(target, currentCredential, newCredential) {
        return requestJson('api/auth.php', {
            method: 'POST',
            body: JSON.stringify({
                action: 'change_credential',
                target,
                current_credential: currentCredential,
                new_credential: newCredential
            })
        });
    }

    async function fetchPublicData() {
        const status = await detectBackend();
        if (!status.available) return null;
        const res = await requestJson('api/data.php?resource=public', { method: 'GET' }, 3000);
        return res.ok ? res : null;
    }

    async function saveConfig(config) {
        return requestJson('api/data.php', {
            method: 'POST',
            body: JSON.stringify({ resource: 'config', data: config })
        }, 8000);
    }

    async function saveProjects(projects) {
        return requestJson('api/data.php', {
            method: 'POST',
            body: JSON.stringify({ resource: 'projects', data: projects })
        }, 12000);
    }

    async function saveBundle(config, projects) {
        return requestJson('api/data.php', {
            method: 'POST',
            body: JSON.stringify({ resource: 'bundle', config, projects })
        }, 15000);
    }

    async function fetchEmpalme() {
        return requestJson('api/data.php?resource=empalme', { method: 'GET' });
    }

    async function saveEmpalme(data) {
        return requestJson('api/data.php', {
            method: 'POST',
            body: JSON.stringify({ resource: 'empalme', data })
        });
    }

    async function submitLead(payload) {
        const status = await detectBackend();
        if (!status.available) {
            return { ok: false, offline: true, error: 'Servidor PHP no activo en modo vitrina.' };
        }
        return requestJson('api/leads.php', {
            method: 'POST',
            body: JSON.stringify(Object.assign({ action: 'create' }, payload))
        }, 6000);
    }

    async function fetchLeads() {
        return requestJson('api/leads.php', { method: 'GET' });
    }

    async function updateLeadStatus(id, status) {
        return requestJson('api/leads.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'update_status', id, status })
        });
    }

    async function deleteLead(id) {
        return requestJson('api/leads.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', id })
        });
    }

    window.InmobiliariaAPI = {
        getState: () => ({ ...state }),
        detectBackend,
        login,
        logout,
        changeCredential,
        fetchPublicData,
        saveConfig,
        saveProjects,
        saveBundle,
        fetchEmpalme,
        saveEmpalme,
        submitLead,
        fetchLeads,
        updateLeadStatus,
        deleteLead
    };
})(window);