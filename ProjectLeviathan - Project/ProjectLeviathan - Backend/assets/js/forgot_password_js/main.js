document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgot-password-form');
    if (!form) return;

    const stages = document.querySelectorAll('.register-stage');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');
    const csrfTokenInput = document.getElementById('csrf_token');
    const logicUrl = '../config/forgot_password_config/forgot_password_process.php';

    const fields = {
        email: document.getElementById('email'),
        verification_code: document.getElementById('verification_code'),
        password: document.getElementById('password'),
        confirm_password: document.getElementById('confirm_password')
    };

    // Función para mostrar errores
    function showError(message, fieldKey = null) {
        if (errorText) errorText.textContent = message;
        if (errorContainer) {
            errorContainer.classList.add('active');
            errorContainer.classList.remove('disabled');
        }
        
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
        if (fieldKey && fields[fieldKey]) {
            fields[fieldKey].classList.add('error-border');
        }
    }

    // Función para ocultar errores
    function hideError() {
        if (errorContainer) {
            errorContainer.classList.remove('active');
            errorContainer.classList.add('disabled');
        }
        if (errorText) errorText.textContent = '';
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
    }

    // CORRECCIÓN: Función para cambiar de etapa
    function goToStage(stageId) {
        stages.forEach(stage => {
            if (stage.id === stageId) {
                stage.classList.add('active');
                stage.classList.remove('disabled');
            } else {
                stage.classList.remove('active');
                stage.classList.add('disabled');
            }
        });
    }

    // Función para manejar las peticiones fetch
    async function handleFetch(url, formData, button) {
        button.disabled = true;
        button.classList.add('btn-loading');
        hideError();
        try {
            formData.append('csrf_token', csrfTokenInput.value);
            const response = await fetch(url, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            showError('No se pudo conectar con el servidor. Revisa tu conexión.');
            return { success: false, message: 'Error de conexión.' };
        } finally {
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    }

    // Obtener el token CSRF al cargar la página
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

    // Delegación de eventos en el formulario
    form.addEventListener('click', async function(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const formData = new FormData();
        let result;

        switch (action) {
            case 'send-code':
                formData.append('action', 'send_code');
                formData.append('email', fields.email.value);
                result = await handleFetch(logicUrl, formData, button);
                if (result.success) {
                    goToStage('stage-2');
                } else {
                    showError(result.message || 'Error al enviar el código.', 'email');
                }
                break;

            case 'verify-code':
                formData.append('action', 'verify_code');
                formData.append('verification_code', fields.verification_code.value);
                result = await handleFetch(logicUrl, formData, button);
                if (result.success) {
                    goToStage('stage-3');
                } else {
                    showError(result.message || 'Error al verificar el código.', 'verification_code');
                }
                break;

            case 'reset-password':
                formData.append('action', 'reset_password');
                formData.append('password', fields.password.value);
                formData.append('confirm_password', fields.confirm_password.value);
                result = await handleFetch(logicUrl, formData, button);
                if (result.success && result.redirect_url) {
                    window.location.href = result.redirect_url;
                } else {
                    showError(result.message || 'Error al restablecer la contraseña.');
                }
                break;
        }
    });

    // Inicialización
    fetchCsrfToken();
});