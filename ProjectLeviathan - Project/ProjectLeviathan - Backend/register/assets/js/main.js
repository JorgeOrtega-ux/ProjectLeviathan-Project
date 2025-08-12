document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENTOS DEL DOM ---
    const form = document.getElementById('register-form');
    const stages = document.querySelectorAll('.register-stage');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');

    // --- DEFINICIÓN DE CAMPOS PARA VALIDACIÓN ---
    const fields = {
        email: { max: 126, name: 'El correo electrónico' },
        password: { min: 8, max: 30, name: 'La contraseña' },
        username: { min: 4, max: 25, name: 'El nombre de usuario' },
        phone: { min: 10, max: 10, name: 'El número de teléfono' },
        verification_code: { min: 6, max: 6, name: 'El código de verificación' }
    };

    /**
     * Muestra un mensaje de error en la interfaz.
     */
    function showError(message, fieldIds = []) {
        errorText.textContent = message;
        errorContainer.classList.remove('disabled');
        errorContainer.classList.add('active');
        document.querySelectorAll('.input-field.error-border, .phone-group.error-border').forEach(el => {
            el.classList.remove('error-border');
        });
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
     * Valida los campos requeridos en una etapa específica.
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
                    const message = fieldInfo.min === fieldInfo.max ?
                        `${fieldInfo.name} debe tener exactamente ${fieldInfo.min} caracteres.` :
                        `El campo no cumple con la longitud requerida.`;
                    showError(message, [input.id]);
                    return false;
                }
            }
             if (input.id === 'email') {
                const emailValue = input.value.toLowerCase();
                if (!emailValue.endsWith('@gmail.com') && !emailValue.endsWith('@outlook.com')) {
                    showError('Solo se permiten correos de @gmail.com o @outlook.com.', ['email']);
                    return false;
                }
            }
        }
        hideError();
        return true;
    }
    
    /**
     * Maneja las solicitudes fetch al backend, incluyendo el estado de los botones y el spinner.
     */
    async function handleFetch(url, formData, button) {
        button.disabled = true;
        button.classList.add('btn-loading');
        hideError();

        try {
            const response = await fetch(url, { method: 'POST', body: formData });
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            showError('No se pudo conectar con el servidor. Revisa tu conexión.');
            return { success: false, is_in_use: false, message: 'Error de conexión.' };
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

        if (action === 'next-stage') {
            if (!validateStage(currentStage.id)) return;
            
            const emailData = new FormData();
            emailData.append('email', document.getElementById('email').value);
            
            const validationResult = await handleFetch('logic/validate_email.php', emailData, button);

            if (validationResult.is_in_use) {
                showError('Este correo electrónico ya está registrado.', ['email']);
            } else {
                goToStage('stage-2');
            }
        }

        if (action === 'submit-register') {
            if (!validateStage('stage-1') || !validateStage('stage-2')) return;

            const profileData = new FormData();
            profileData.append('username', document.getElementById('username').value);
            profileData.append('phone', document.getElementById('phone').value);
            profileData.append('country_code', document.getElementById('country_code').value);

            const profileValidation = await handleFetch('logic/validate_profile.php', profileData, button);

            if (profileValidation.is_in_use) {
                const fieldInUse = profileValidation.field;
                const message = fieldInUse === 'username' ? 'Este nombre de usuario ya está en uso.' : 'Este número de teléfono ya está en uso.';
                showError(message, [fieldInUse]);
                return;
            }

            const fullFormData = new FormData(form);
            const registrationResult = await handleFetch('logic/register_process.php', fullFormData, button);

            if (registrationResult.success) {
                goToStage('stage-3');
            } else {
                showError(registrationResult.message || 'Ocurrió un error inesperado durante el registro.');
            }
        }

        if (action === 'submit-verification') {
            if (!validateStage(currentStage.id)) return;
            
            const verificationData = new FormData();
            verificationData.append('verification_code', document.getElementById('verification_code').value);
            
            const verificationResult = await handleFetch('logic/verify_code.php', verificationData, button);

            if (verificationResult.success) {
                currentStage.innerHTML = `
                    <h1>¡Cuenta verificada!</h1>
                    <p class="verification-text">${verificationResult.message}</p>
                    <a href="../login/" class="continue-btn" style="text-decoration: none; text-align: center; line-height: 52px;"><span>Ir a Iniciar Sesión</span></a>
                `;
            } else {
                showError(verificationResult.message || 'Error al verificar el código.');
            }
        }
    });

    // --- FUNCIONALIDAD EXTRA (INTERACCIÓN CON INPUTS) ---
    form.addEventListener('focus', function(e) {
        if (e.target.matches('.input-field')) {
            hideError();
        }
    }, true);

    form.addEventListener('input', function(e) {
        const input = e.target;
        if (input.id === 'username') input.value = input.value.replace(/[^a-zA-Z0-9_]/g, '');
        if (input.id === 'phone' || input.id === 'verification_code') input.value = input.value.replace(/[^0-9]/g, '');
    });

    // --- VISIBILIDAD DE CONTRASEÑA ---
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        const passwordInput = document.getElementById('password');
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.textContent = isPassword ? 'visibility' : 'visibility_off';
        });
    }
    
    // --- SELECTOR DE CÓDIGO DE PAÍS ---
    const phoneGroup = document.getElementById('phone-group');
    if (phoneGroup) {
        const countrySelector = document.getElementById('country-selector');
        const countryDropdown = document.getElementById('country-dropdown');
        
        if(countrySelector && countryDropdown) {
            const countryLinks = countryDropdown.querySelectorAll('.menu-link');
            const selectedCode = document.getElementById('selected-code');
            const countryCodeInput = document.getElementById('country_code');
            
            countrySelector.addEventListener('click', () => {
                countryDropdown.classList.toggle('disabled');
                countryDropdown.classList.toggle('active');
            });
            
            countryLinks.forEach(link => {
                link.addEventListener('click', () => {
                    selectedCode.textContent = link.getAttribute('data-code');
                    countryCodeInput.value = link.getAttribute('data-code');
                    countryDropdown.classList.add('disabled');
                    countryDropdown.classList.remove('active');
                });
            });
    
            window.addEventListener('click', e => {
                if (!phoneGroup.contains(e.target)) {
                    countryDropdown.classList.add('disabled');
                    countryDropdown.classList.remove('active');
                }
            });
        }
    }
});