document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENTOS DEL DOM ---
    const form = document.getElementById('register-form');
    const stages = document.querySelectorAll('.register-stage');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');
    const togglePassword = document.getElementById('toggle-password');
    const phoneGroup = document.getElementById('phone-group');
    const csrfTokenInput = document.getElementById('csrf_token');

    // --- DEFINICIÓN DE CAMPOS PARA VALIDACIÓN ---
    const fields = {
        email: { max: 126, name: 'El correo electrónico' },
        password: { min: 8, max: 30, name: 'La contraseña' },
        username: { min: 4, max: 25, name: 'El nombre de usuario' },
        phone: { min: 10, max: 10, name: 'El número de teléfono' },
        verification_code: { min: 6, max: 6, name: 'El código de verificación' }
    };
    
    // --- RUTA AL SCRIPT DE PROCESAMIENTO ---
    const logicUrl = 'config/register_config/register_process.php';

    /**
     * Obtiene y establece el token CSRF al cargar la página.
     */
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

    /**
     * Muestra un mensaje de error en la interfaz.
     */
    function showError(message, fieldIds = []) {
        errorText.textContent = message;
        errorContainer.classList.remove('disabled');
        errorContainer.classList.add('active');
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
        fieldIds.forEach(id => {
            const fieldElement = document.getElementById(id);
            if (fieldElement) {
                const elementToBorder = fieldElement.closest('.phone-group') || fieldElement;
                elementToBorder.classList.add('error-border');
            }
        });
    }

    /**
     * Oculta el contenedor de errores.
     */
    function hideError() {
        errorContainer.classList.add('disabled');
        errorContainer.classList.remove('active');
        errorText.textContent = '';
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
    }

    /**
     * Cambia a una etapa específica del formulario.
     */
    function goToStage(stageId) {
        stages.forEach(stage => {
            stage.classList.add('disabled');
            stage.classList.remove('active');
        });
        const newStage = document.getElementById(stageId);
        if (newStage) {
            newStage.classList.remove('disabled');
            newStage.classList.add('active');
        }
    }

    /**
     * Valida los campos requeridos en una etapa específica del formulario.
     */
    function validateStage(stageId) {
        const stage = document.getElementById(stageId);
        if (!stage) return false;
        const inputs = stage.querySelectorAll('input[required]');
        for (const input of inputs) {
            if (!input.value.trim()) {
                showError('Por favor, completa todos los campos requeridos.', [input.id]);
                return false;
            }
            const fieldInfo = fields[input.id];
            if (fieldInfo) {
                const len = input.value.length;
                if ((fieldInfo.min && len < fieldInfo.min) || (fieldInfo.max && len > fieldInfo.max)) {
                    const message = fieldInfo.min === fieldInfo.max ? `${fieldInfo.name} debe tener exactamente ${fieldInfo.min} caracteres.` : `El campo no cumple con la longitud requerida.`;
                    showError(message, [input.id]);
                    return false;
                }
            }
            if (input.id === 'email') {
                const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i;
                if (!emailRegex.test(input.value)) {
                    showError('Solo se permiten correos de @gmail.com o @outlook.com.', ['email']);
                    return false;
                }
            }
        }
        hideError();
        return true;
    }
    
    /**
     * Maneja las solicitudes fetch al backend.
     */
    async function handleFetch(url, formData, button) {
        button.disabled = true;
        button.classList.add('btn-loading');
        hideError();
        try {
            // Adjunta el token CSRF a todos los FormData antes de enviarlos
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

    // --- EVENT LISTENER PRINCIPAL PARA LAS ACCIONES DEL FORMULARIO ---
    form.addEventListener('click', async function(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const currentStage = button.closest('.register-stage');
        
        // ETAPA 1 -> ETAPA 2
        if (action === 'next-stage') {
            if (!validateStage(currentStage.id)) return;
            const formData = new FormData();
            formData.append('action', 'validate_step1');
            formData.append('email', document.getElementById('email').value);
            
            const result = await handleFetch(logicUrl, formData, button);
            if (result.success) {
                goToStage('stage-2');
            } else {
                showError(result.message || 'Error al validar el correo.', ['email']);
            }
        }

        // ETAPA 2 -> ETAPA 3
        if (action === 'submit-register') {
            if (!validateStage('stage-1') || !validateStage('stage-2')) return;

            const formData = new FormData(form);
            formData.append('action', 'generate_code');
            
            const result = await handleFetch(logicUrl, formData, button);
            if (result.success) {
                goToStage('stage-3');
            } else {
                showError(result.message || 'Error al validar el perfil.');
            }
        }

        // ETAPA 3 -> FINAL
        if (action === 'submit-verification') {
            if (!validateStage(currentStage.id)) return;
            
            const formData = new FormData();
            formData.append('action', 'verify_account');
            formData.append('verification_code', document.getElementById('verification_code').value);
            
            const result = await handleFetch(logicUrl, formData, button);
            if (result.success) {
                currentStage.innerHTML = `
                    <h1>¡Cuenta verificada!</h1>
                    <p class="verification-text">${result.message}</p>
                    <a href="../login/" class="continue-btn" style="text-decoration: none; text-align: center; line-height: 52px;"><span>Ir a Iniciar Sesión</span></a>
                `;
            } else {
                showError(result.message || 'Error al verificar el código.', ['verification_code']);
            }
        }
    });

    // --- MANEJO DE ENTRADAS, CONTRASEÑA Y SELECTOR DE PAÍS ---
    form.addEventListener('focus', e => e.target.matches('.input-field') && hideError(), true);
    form.addEventListener('input', e => {
        const input = e.target;
        if (input.id === 'username') input.value = input.value.replace(/[^a-zA-Z0-9_]/g, '');
        if (input.id === 'phone' || input.id === 'verification_code') input.value = input.value.replace(/[^0-9]/g, '');
    });

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.textContent = isPassword ? 'visibility_off' : 'visibility';
        });
    }
    
    if (phoneGroup) {
        const countrySelector = document.getElementById('country-selector');
        const countryDropdown = document.getElementById('country-dropdown');
        if (countrySelector && countryDropdown) {
            const countryLinks = countryDropdown.querySelectorAll('.menu-link');
            const selectedCode = document.getElementById('selected-code');
            const countryCodeInput = document.getElementById('country_code');
            
            countrySelector.addEventListener('click', () => countryDropdown.classList.toggle('disabled'));
            countryLinks.forEach(link => {
                link.addEventListener('click', () => {
                    selectedCode.textContent = link.dataset.code;
                    countryCodeInput.value = link.dataset.code;
                    countryDropdown.classList.add('disabled');
                });
            });
    
            window.addEventListener('click', e => {
                if (!phoneGroup.contains(e.target)) countryDropdown.classList.add('disabled');
            });
        }
    }

    // --- INICIALIZACIÓN ---
    fetchCsrfToken();
});