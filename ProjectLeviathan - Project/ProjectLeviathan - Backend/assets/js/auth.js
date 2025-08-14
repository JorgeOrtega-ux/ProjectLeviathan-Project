document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    let logicUrl = '';

    // --- SELECCIÓN DINÁMICA DE LA RUTA ---
    // Determina la ruta correcta al procesador PHP basado en el formulario que existe en la página.
    if (loginForm) {
        logicUrl = 'config/auth_process.php'; // Ruta para /index.php
    } else if (registerForm || forgotPasswordForm) {
        logicUrl = '../config/auth_process.php'; // Ruta para /register/ y /forgot-password/
    }

    // --- FUNCIONES COMUNES ---
    const fetchCsrfToken = async (csrfTokenInput, errorContainer, errorText) => {
        try {
            const formData = new FormData();
            formData.append('action', 'get_csrf_token');
            // Usamos la URL determinada dinámicamente
            const response = await fetch(logicUrl, { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success && result.csrf_token) {
                if (csrfTokenInput) csrfTokenInput.value = result.csrf_token;
            } else {
                showError('No se pudo establecer una conexión segura. Recarga la página.', errorContainer, errorText);
            }
        } catch (error) {
            showError('Error de conexión al inicializar. Por favor, recarga.', errorContainer, errorText);
        }
    };

    const showError = (message, errorContainer, errorText, fieldIds = []) => {
        if (errorText) errorText.textContent = message;
        if (errorContainer) {
            errorContainer.classList.remove('disabled');
            errorContainer.classList.add('active');
        }
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
        fieldIds.forEach(id => {
            const fieldElement = document.getElementById(id);
            if (fieldElement) {
                const elementToBorder = fieldElement.closest('.phone-group') || fieldElement;
                elementToBorder.classList.add('error-border');
            }
        });
    };

    const handleFetch = async (url, formData, button) => {
        button.disabled = true;
        button.classList.add('btn-loading');

        try {
            const csrfTokenInput = document.getElementById('csrf_token');
            if (csrfTokenInput) formData.append('csrf_token', csrfTokenInput.value);

            const response = await fetch(url, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: 'No se pudo conectar con el servidor. Revisa tu conexión.' };
        } finally {
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    };

    // --- LÓGICA DE INICIO DE SESIÓN ---
    if (loginForm) {
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        const togglePassword = document.getElementById('toggle-password');
        const csrfTokenInput = document.getElementById('csrf_token');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const validateLoginForm = () => {
            const fieldsToError = [];
            if (!emailInput.value.trim()) fieldsToError.push('email');
            if (!passwordInput.value.trim()) fieldsToError.push('password');

            if (fieldsToError.length > 0) {
                const message = fieldsToError.length > 1
                    ? 'Por favor, completa todos los campos requeridos.'
                    : 'Por favor, completa el campo requerido.';
                showError(message, errorContainer, errorText, fieldsToError);
                return false;
            }
            return true;
        };

        const handleLogin = async (e) => {
            e.preventDefault();
            if (!validateLoginForm()) return;

            const button = loginForm.querySelector('.continue-btn');
            if (button.classList.contains('btn-loading')) return;

            const formData = new FormData(loginForm);
            formData.append('action', 'login');

            // Usamos la URL correcta que se determinó al inicio
            const result = await handleFetch(logicUrl, formData, button);

            if (result.redirect_url) {
                let redirectUrl = result.redirect_url;
                if (result.reason) {
                    redirectUrl += `?reason=${encodeURIComponent(result.reason)}`;
                }
                window.location.href = redirectUrl;
            } else if (result.success) {
                window.location.href = '../ProjectLeviathan - Frontend/';
            } else {
                showError(result.message || 'Ocurrió un error inesperado.', errorContainer, errorText, ['email', 'password']);
            }
        };

        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                togglePassword.textContent = isPassword ? 'visibility_off' : 'visibility';
            });
        }

        loginForm.addEventListener('focusin', (e) => {
            if (e.target.matches('.input-field')) {
                e.target.classList.remove('error-border');
                if (loginForm.querySelectorAll('.error-border').length === 0) {
                    if (errorContainer) errorContainer.classList.add('disabled');
                }
            }
        });

        loginForm.addEventListener('submit', handleLogin);
        fetchCsrfToken(csrfTokenInput, errorContainer, errorText);
    }

    // --- LÓGICA DE REGISTRO ---
    if (registerForm) {
        const stages = document.querySelectorAll('.register-stage');
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        const togglePassword = document.getElementById('toggle-password');
        const phoneGroup = document.getElementById('phone-group');
        const csrfTokenInput = document.getElementById('csrf_token');

        const fields = {
            email: { name: 'Correo electrónico' },
            password: { name: 'La contraseña', min: 8, max: 30 },
            username: { name: 'El nombre de usuario', min: 4, max: 25 },
            phone: { name: 'El número de teléfono', min: 10, max: 10 },
            verification_code: { name: 'El código de verificación', min: 6, max: 6 }
        };

        const goToStage = (stageId) => {
            stages.forEach(stage => {
                stage.classList.toggle('active', stage.id === stageId);
                stage.classList.toggle('disabled', stage.id !== stageId);
            });
        };

        const validateStage = (stageId) => {
            const stage = document.getElementById(stageId);
            if (!stage) return false;

            const inputs = Array.from(stage.querySelectorAll('input[required]'));
            const emptyFields = [];

            for (const input of inputs) {
                if (!input.value.trim()) emptyFields.push(input.id);
            }

            if (emptyFields.length > 0) {
                const message = emptyFields.length > 1 ? 'Por favor, completa todos los campos requeridos.' : 'Por favor, completa el campo requerido.';
                showError(message, errorContainer, errorText, emptyFields);
                return false;
            }

            for (const input of inputs) {
                const value = input.value.trim();
                const fieldInfo = fields[input.id];

                if (fieldInfo.min && fieldInfo.max && (value.length < fieldInfo.min || value.length > fieldInfo.max)) {
                    const errorMessage = (fieldInfo.min === fieldInfo.max)
                        ? `${fieldInfo.name} debe tener exactamente ${fieldInfo.min} caracteres.`
                        : `${fieldInfo.name} debe tener entre ${fieldInfo.min} y ${fieldInfo.max} caracteres.`;
                    showError(errorMessage, errorContainer, errorText, [input.id]);
                    return false;
                }

                if (input.id === 'email' && !/^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i.test(value)) {
                    showError('Solo se permiten correos de @gmail.com o @outlook.com.', errorContainer, errorText, ['email']);
                    return false;
                }
            }
            return true;
        };

        registerForm.addEventListener('click', async function (e) {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const currentStage = button.closest('.register-stage');

            if (button.classList.contains('btn-loading')) return;
            if (!validateStage(currentStage.id)) return;

            const formData = new FormData(registerForm);

            if (action === 'next-stage') {
                formData.append('action', 'validate_step1');
                const result = await handleFetch(logicUrl, formData, button);
                if (result.success) {
                    goToStage('stage-2');
                } else {
                    // Verificar si es un error de límite de IP (no mostrar borde en email)
                    const isIpLimitError = result.message && result.message.includes('límite de cuentas para esta red');
                    const fieldsWithError = isIpLimitError ? [] : ['email'];
                    showError(result.message || 'Error al validar el correo.', errorContainer, errorText, fieldsWithError);
                }
            }

            if (action === 'submit-register') {
                formData.append('action', 'generate_code');
                const result = await handleFetch(logicUrl, formData, button);
                if (result.success) {
                    const phone = document.getElementById('phone').value;
                    const countryCode = document.getElementById('country_code').value;
                    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                    document.getElementById('verification-phone').textContent = `${countryCode} ${formattedPhone}`;
                    goToStage('stage-3');
                } else {
                    showError(result.message || 'Error al validar el perfil.', errorContainer, errorText);
                }
            }

            if (action === 'submit-verification') {
                formData.append('action', 'verify_account');
                const result = await handleFetch(logicUrl, formData, button);
                if (result.success && result.redirect_url) {
                    window.location.href = result.redirect_url;
                } else {
                    showError(result.message || 'Error al verificar el código.', errorContainer, errorText, ['verification_code']);
                }
            }
        });

        registerForm.addEventListener('focusin', e => {
            if (e.target.matches('.input-field, .phone-field')) {
                const elementToClean = e.target.closest('.phone-group') || e.target;
                elementToClean.classList.remove('error-border');
                if (registerForm.querySelectorAll('.error-border').length === 0) {
                    errorContainer.classList.add('disabled');
                }
            }
        });

        registerForm.addEventListener('input', e => {
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
                countrySelector.addEventListener('click', () => countryDropdown.classList.toggle('disabled'));
                countryDropdown.querySelectorAll('.menu-link').forEach(link => {
                    link.addEventListener('click', () => {
                        document.getElementById('selected-code').textContent = link.dataset.code;
                        document.getElementById('country_code').value = link.dataset.code;
                        countryDropdown.classList.add('disabled');
                    });
                });
                window.addEventListener('click', e => {
                    if (!phoneGroup.contains(e.target)) countryDropdown.classList.add('disabled');
                });
            }
        }

        fetchCsrfToken(csrfTokenInput, errorContainer, errorText);
    }

    // --- LÓGICA DE RECUPERAR CONTRASEÑA ---
    if (forgotPasswordForm) {
        const stages = document.querySelectorAll('.register-stage');
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        const csrfTokenInput = document.getElementById('csrf_token');

        const fields = {
            email: { name: 'Correo electrónico' },
            verification_code: { name: 'El código', min: 6, max: 6 },
            password: { name: 'La nueva contraseña', min: 8, max: 30 },
            confirm_password: { name: 'La confirmación de contraseña' }
        };

        const goToStage = (stageId) => {
            stages.forEach(stage => {
                stage.classList.toggle('active', stage.id === stageId);
                stage.classList.toggle('disabled', stage.id !== stageId);
            });
        };

        const validateStage = (stageId) => {
            const stage = document.getElementById(stageId);
            const inputs = Array.from(stage.querySelectorAll('input[required]'));
            const emptyFields = [];

            for (const input of inputs) {
                if (!input.value.trim()) emptyFields.push(input.id);
            }

            if (emptyFields.length > 0) {
                const message = emptyFields.length > 1 ? 'Por favor, completa todos los campos requeridos.' : 'Por favor, completa el campo requerido.';
                showError(message, errorContainer, errorText, emptyFields);
                return false;
            }

            for (const input of inputs) {
                const value = input.value.trim();
                const fieldInfo = fields[input.id];

                if (fieldInfo.min && (value.length < fieldInfo.min)) {
                    const message = `El campo debe tener al menos ${fieldInfo.min} caracteres.`;
                    showError(message, errorContainer, errorText, [input.id]);
                    return false;
                }

                if (input.id === 'confirm_password' && value !== document.getElementById('password').value) {
                    showError('Las contraseñas no coinciden.', errorContainer, errorText, ['password', 'confirm_password']);
                    return false;
                }
            }
            return true;
        };

        forgotPasswordForm.addEventListener('click', async function (e) {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            if (button.classList.contains('btn-loading')) return;

            const action = button.getAttribute('data-action');
            const currentStage = button.closest('.register-stage');

            if (!validateStage(currentStage.id)) return;

            const formData = new FormData(forgotPasswordForm);
            let result;

            switch (action) {
                case 'send-code':
                    formData.append('action', 'send_code');
                    result = await handleFetch(logicUrl, formData, button);
                    if (result.success) {
                        if (result.phone_number) {
                            const phone = result.phone_number.slice(-10);
                            const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                            document.getElementById('verification-phone').textContent = `(${formattedPhone})`;
                        }
                        goToStage('stage-2');
                    } else {
                        showError(result.message || 'Error al enviar el código.', errorContainer, errorText, ['email']);
                    }
                    break;
                case 'verify-code':
                    formData.append('action', 'verify_code');
                    result = await handleFetch(logicUrl, formData, button);
                    if (result.success) {
                        goToStage('stage-3');
                    } else {
                        showError(result.message || 'Error al verificar el código.', errorContainer, errorText, ['verification_code']);
                    }
                    break;
                case 'reset-password':
                    formData.append('action', 'reset_password');
                    result = await handleFetch(logicUrl, formData, button);
                    if (result.success && result.redirect_url) {
                        window.location.href = result.redirect_url;
                    } else {
                        showError(result.message || 'Error al restablecer la contraseña.', errorContainer, errorText, ['password', 'confirm_password']);
                    }
                    break;
            }
        });

        forgotPasswordForm.addEventListener('focusin', (e) => {
            if (e.target.matches('.input-field')) {
                e.target.classList.remove('error-border');
                if (forgotPasswordForm.querySelectorAll('.error-border').length === 0) {
                    errorContainer.classList.add('disabled');
                }
            }
        });

        fetchCsrfToken(csrfTokenInput, errorContainer, errorText);
    }
});