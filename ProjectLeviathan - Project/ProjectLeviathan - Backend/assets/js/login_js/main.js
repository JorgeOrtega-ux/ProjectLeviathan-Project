document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');
    const togglePassword = document.getElementById('toggle-password');
    const csrfTokenInput = document.getElementById('csrf_token');
    const logicUrl = 'config/login_config/login_process.php';

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

    async function handleLogin(e) {
        e.preventDefault();
        const button = form.querySelector('.continue-btn');
        button.disabled = true;
        button.classList.add('btn-loading');
        hideError();

        const formData = new FormData(form);
        formData.append('action', 'login');

        try {
            const response = await fetch(logicUrl, { method: 'POST', body: formData });
            const result = await response.json();

            if (result.success) {
                window.location.href = result.redirect_url;
            } else {
                showError(result.message || 'Ocurrió un error inesperado.');
            }
        } catch (error) {
            showError('No se pudo conectar con el servidor. Revisa tu conexión.');
        } finally {
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    }

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.textContent = isPassword ? 'visibility_off' : 'visibility';
        });
    }
    
    form.addEventListener('submit', handleLogin);
    fetchCsrfToken();
});