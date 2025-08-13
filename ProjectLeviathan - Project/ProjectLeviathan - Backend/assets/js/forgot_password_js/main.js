document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgot-password-form');
    const stages = document.querySelectorAll('.form-stage');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');
    const csrfTokenInput = document.getElementById('csrf_token');
    const logicUrl = '../config/forgot_password_config/forgot_password_process.php';

    async function fetchCsrfToken() {
        try {
            const formData = new FormData();
            formData.append('action', 'get_csrf_token');
            const response = await fetch(logicUrl, { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success && result.csrf_token) {
                csrfTokenInput.value = result.csrf_token;
            } else {
                showError('No se pudo establecer una conexión segura. Recarga la página.');
            }
        } catch (error) {
            showError('Error de conexión al inicializar. Por favor, recarga.');
        }
    }

    function showError(message) {
        errorText.textContent = message;
        errorContainer.classList.remove('disabled');
        errorContainer.classList.add('active');
    }

    function hideError() {
        errorContainer.classList.add('disabled');
        errorContainer.classList.remove('active');
        errorText.textContent = '';
    }

    function goToStage(stageId) {
        stages.forEach(stage => {
            stage.classList.remove('active');
            stage.classList.add('disabled');
        });
        const newStage = document.getElementById(stageId);
        if (newStage) {
            newStage.classList.remove('disabled');
            newStage.classList.add('active');
        }
    }
    
    async function handleFetch(url, formData, button) {
        button.disabled = true;
        button.classList.add('btn-loading');
        hideError();
        try {
            formData.append('csrf_token', csrfTokenInput.value);
            const response = await fetch(url, { method: 'POST', body: formData });
            return await response.json();
        } catch (error) {
            showError('No se pudo conectar con el servidor. Revisa tu conexión.');
            return { success: false };
        } finally {
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    }

    form.addEventListener('click', async function(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const currentStage = button.closest('.form-stage');
        
        const formData = new FormData(form);
        formData.append('action', action);

        const result = await handleFetch(logicUrl, formData, button);

        if (result.success) {
            if (action === 'find-account') {
                goToStage('stage-2');
            } else if (action === 'verify-code') {
                goToStage('stage-3');
            } else if (action === 'reset-password') {
                alert(result.message);
                if (result.redirect_url) {
                    window.location.href = result.redirect_url;
                }
            }
        } else {
            showError(result.message || 'Ocurrió un error inesperado.');
        }
    });

    fetchCsrfToken();
});