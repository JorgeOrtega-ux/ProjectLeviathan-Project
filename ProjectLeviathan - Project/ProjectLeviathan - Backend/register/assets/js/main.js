document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const stages = document.querySelectorAll('.register-stage');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');

    const fields = {
        email: { max: 126, name: 'El correo electrónico' },
        password: { min: 8, max: 30, name: 'La contraseña' },
        username: { min: 4, max: 25, name: 'El nombre de usuario' },
        phone: { min: 10, max: 10, name: 'El número de teléfono' },
        verification_code: { min: 6, max: 6, name: 'El código de verificación' }
    };

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

    function hideError() {
        errorContainer.classList.add('disabled');
        errorContainer.classList.remove('active');
        errorText.textContent = '';
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
    }

    function goToStage(stageId) {
        stages.forEach(stage => {
            stage.classList.add('disabled');
            stage.classList.remove('active');
        });
        const newStage = document.getElementById(`stage-${stageId}`);
        if (newStage) {
            newStage.classList.remove('disabled');
            newStage.classList.add('active');
        }
    }

    function validateStage(stageId) {
        const stage = document.getElementById(stageId);
        const inputs = stage.querySelectorAll('input[required]');
        const emptyFields = [];

        inputs.forEach(input => {
            if (!input.value.trim()) {
                emptyFields.push(input.id);
            }
        });

        if (emptyFields.length > 0) {
            showError('Por favor, completa todos los campos requeridos.', emptyFields);
            return false;
        }
        
        for (const input of inputs) {
            const fieldInfo = fields[input.id];
            if (input.id === 'email') {
                const emailValue = input.value.toLowerCase();
                if (!emailValue.endsWith('@gmail.com') && !emailValue.endsWith('@outlook.com')) {
                    showError('Solo se permiten correos de @gmail.com o @outlook.com.', ['email']);
                    return false;
                }
            }
            if (fieldInfo) {
                if (fieldInfo.min && fieldInfo.max && fieldInfo.min === fieldInfo.max) {
                    if (input.value.length !== fieldInfo.min) {
                        showError(`${fieldInfo.name} debe tener exactamente ${fieldInfo.min} caracteres.`, [input.id]);
                        return false;
                    }
                } else {
                    if (fieldInfo.min && input.value.length < fieldInfo.min) {
                        showError(`${fieldInfo.name} debe tener al menos ${fieldInfo.min} caracteres.`, [input.id]);
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    // --- MANEJADORES DE EVENTOS ---
    form.addEventListener('click', function(e) {
        if (e.target.matches('[data-next-stage]')) {
            if (validateStage(e.target.closest('.register-stage').id)) {
                hideError();
                goToStage(e.target.getAttribute('data-next-stage'));
            }
        }
    });
    
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

    form.addEventListener('keydown', function(e) {
        const input = e.target;
        const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
        if (input.id === 'phone' || input.id === 'verification_code') {
            if (!/[0-9]/.test(e.key) && !controlKeys.includes(e.key)) e.preventDefault();
        }
        if (input.id === 'username') {
            if (!/[a-zA-Z0-9_]/.test(e.key) && !controlKeys.includes(e.key)) e.preventDefault();
        }
    });

    // --- FUNCIONALIDAD EXTRA ---
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        const passwordInput = document.getElementById('password');
        togglePassword.addEventListener('click', () => {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            togglePassword.textContent = passwordInput.type === 'password' ? 'visibility' : 'visibility_off';
        });
    }
    
    const phoneGroup = document.getElementById('phone-group');
    if (phoneGroup) {
        const countrySelector = document.getElementById('country-selector');
        const countryDropdown = document.getElementById('country-dropdown');
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
});