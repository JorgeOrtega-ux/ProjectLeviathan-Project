import { initDragController } from './drag-controller.js';
import { initUrlManager, navigateToUrl, getCurrentUrlState, setupPopStateHandler, setInitialHistoryState } from './url-manager.js';

function initMainController() {
    const closeOnClickOutside = true;
    const closeOnEscape = true;
    const allowMultipleActiveModules = false;
    let isAnimating = false;
    
    const popperInstances = {};

    initUrlManager();
    const initialState = getCurrentUrlState();
    
    let isSectionHomeActive = initialState ? initialState.section === 'home' : true;
    let isSectionExploreActive = initialState ? initialState.section === 'explore' : false;
    let isSectionSettingsActive = initialState ? initialState.section === 'settings' : false;
    let isSectionHelpActive = initialState ? initialState.section === 'help' : false;
    
    let isSectionProfileActive = initialState ? initialState.subsection === 'profile' : false;
    let isSectionLoginActive = initialState ? initialState.subsection === 'login' : false;
    let isSectionAccessibilityActive = initialState ? initialState.subsection === 'accessibility' : false;
    
    let isSectionPrivacyActive = initialState ? initialState.subsection === 'privacy' : false;
    let isSectionTermsActive = initialState ? initialState.subsection === 'terms' : false;
    let isSectionCookiesActive = initialState ? initialState.subsection === 'cookies' : false;
    let isSectionSuggestionsActive = initialState ? initialState.subsection === 'suggestions' : false;

    const toggleOptionsButton = document.querySelector('[data-action="toggleModuleOptions"]');
    const moduleOptions = document.querySelector('[data-module="moduleOptions"]');
    const toggleSurfaceButton = document.querySelector('[data-action="toggleModuleSurface"]');
    const moduleSurface = document.querySelector('[data-module="moduleSurface"]');
    const surfaceMain = document.querySelector('[data-surface-type="main"]');
    const surfaceSettings = document.querySelector('[data-surface-type="settings"]');
    const surfaceHelp = document.querySelector('[data-surface-type="help"]');
    const customSelectorButtons = document.querySelectorAll('[data-action="toggleSelector"]');
    
    const sectionHome = document.querySelector('[data-section="sectionHome"]');
    const sectionExplore = document.querySelector('[data-section="sectionExplore"]');
    const sectionSettings = document.querySelector('[data-section="sectionSettings"]');
    const sectionHelp = document.querySelector('[data-section="sectionHelp"]');
    
    const sectionProfile = document.querySelector('[data-section="sectionProfile"]');
    const sectionLogin = document.querySelector('[data-section="sectionLogin"]');
    const sectionAccessibility = document.querySelector('[data-section="sectionAccessibility"]');
    
    const sectionPrivacy = document.querySelector('[data-section="sectionPrivacy"]');
    const sectionTerms = document.querySelector('[data-section="sectionTerms"]');
    const sectionCookies = document.querySelector('[data-section="sectionCookies"]');
    const sectionSuggestions = document.querySelector('[data-section="sectionSuggestions"]');
    
    const toggleSectionHomeButton = document.querySelector('[data-action="toggleSectionHome"]');
    const toggleSectionExploreButton = document.querySelector('[data-action="toggleSectionExplore"]');
    
    const toggleSectionSettingsButton = document.querySelector('[data-action="toggleSectionSettings"]');
    const toggleSectionHelpButton = document.querySelector('[data-action="toggleSectionHelp"]');
    
    const toggleSectionHomeFromSettingsButton = document.querySelector('[data-action="toggleSectionHomeFromSettings"]');
    const toggleSectionProfileButton = document.querySelector('[data-action="toggleSectionProfile"]');
    const toggleSectionLoginButton = document.querySelector('[data-action="toggleSectionLogin"]');
    const toggleSectionAccessibilityButton = document.querySelector('[data-action="toggleSectionAccessibility"]');
    
    const toggleSectionHomeFromHelpButton = document.querySelector('[data-action="toggleSectionHomeFromHelp"]');
    const toggleSectionPrivacyButton = document.querySelector('[data-action="toggleSectionPrivacy"]');
    const toggleSectionTermsButton = document.querySelector('[data-action="toggleSectionTerms"]');
    const toggleSectionCookiesButton = document.querySelector('[data-action="toggleSectionCookies"]');
    const toggleSectionSuggestionsButton = document.querySelector('[data-action="toggleSectionSuggestions"]');

    const updatePasswordModal = document.querySelector('[data-module="updatePasswordModal"]');
    const openUpdatePasswordModalButton = document.querySelector('[data-action="openUpdatePasswordModal"]');
    const closeUpdatePasswordModalButtons = document.querySelectorAll('[data-action="closeUpdatePasswordModal"]');
    const paneConfirmPassword = document.querySelector('[data-pane="confirmPassword"]');
    const paneSetNewPassword = document.querySelector('[data-pane="setNewPassword"]');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmCurrentPasswordButton = document.querySelector('[data-action="confirmCurrentPassword"]');
    const saveNewPasswordButton = document.querySelector('[data-action="saveNewPassword"]');
    const confirmErrorContainer = paneConfirmPassword.querySelector('.dialog-error-message');
    const newErrorContainer = paneSetNewPassword.querySelector('.dialog-error-message');
    
    const logoutButton = document.querySelector('[data-action="logout"]');

    // Elementos para el modal de eliminar cuenta
    const deleteAccountModal = document.querySelector('[data-module="deleteAccountModal"]');
    const openDeleteAccountModalButton = document.querySelector('[data-action="openDeleteAccountModal"]');
    const closeDeleteAccountModalButtons = document.querySelectorAll('[data-action="closeDeleteAccountModal"]');
    const confirmDeleteAccountButton = document.querySelector('[data-action="confirmDeleteAccount"]');
    const deletePasswordInput = document.getElementById('delete-confirm-password');


    if (!toggleOptionsButton || !moduleOptions || !toggleSurfaceButton || !moduleSurface || !sectionHome || !sectionExplore || !sectionSettings || !sectionHelp) return;

    const menuContentOptions = moduleOptions.querySelector('.menu-content');

    setInitialHistoryState();
    setupPopStateHandler((section, subsection, updateHistory) => {
        handleNavigationChange(section, subsection, updateHistory);
    });

    const updateLogState = () => {
        const toState = (active) => active ? '✅ Activo' : '❌ Inactivo';
        const tableData = {
            '── Sections ──': { section: 'Home', status: toState(isSectionHomeActive) },
            '   ': { section: 'Explore', status: toState(isSectionExploreActive) },
            '    ': { section: 'Settings', status: toState(isSectionSettingsActive) },
            '     ': { section: 'Help', status: toState(isSectionHelpActive) },
            '── Sub-sections (Settings) ──': { section: 'Profile', status: toState(isSectionProfileActive) },
            '      ': { section: 'Login', status: toState(isSectionLoginActive) },
            '       ': { section: 'Accessibility', status: toState(isSectionAccessibilityActive) },
            '── Sub-sections (Help) ──': { section: 'Privacy Policy', status: toState(isSectionPrivacyActive) },
            '         ': { section: 'Terms & Conditions', status: toState(isSectionTermsActive) },
            '          ': { section: 'Cookies Policy', status: toState(isSectionCookiesActive) },
            '           ': { section: 'Suggestions', status: toState(isSectionSuggestionsActive) },
        };
        console.group("ProjectLeviathan - State Overview");
        console.table(tableData);
        console.groupEnd();
    };

    const resetPasswordModal = () => {
        if(currentPasswordInput) currentPasswordInput.value = '';
        if(newPasswordInput) newPasswordInput.value = '';
        if(confirmPasswordInput) confirmPasswordInput.value = '';
        
        if(confirmErrorContainer) confirmErrorContainer.style.display = 'none';
        if(newErrorContainer) newErrorContainer.style.display = 'none';

        paneConfirmPassword.classList.remove('disabled');
        paneConfirmPassword.classList.add('active');
        paneSetNewPassword.classList.add('disabled');
        paneSetNewPassword.classList.remove('active');
    };

    const openUpdatePasswordModal = () => {
        if (!updatePasswordModal) return;
        resetPasswordModal();
        updatePasswordModal.classList.remove('disabled');
        requestAnimationFrame(() => {
            updatePasswordModal.classList.add('active');
        });
    };

    const closeUpdatePasswordModal = () => {
        if (!updatePasswordModal || !updatePasswordModal.classList.contains('active')) return false;
        updatePasswordModal.classList.remove('active');
        updatePasswordModal.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && !updatePasswordModal.classList.contains('active')) {
                updatePasswordModal.classList.add('disabled');
            }
        }, { once: true });
        return true;
    };

    const showNewPasswordPane = async () => {
        const formData = new FormData();
        formData.append('action', 'update_password');
        formData.append('current_password', currentPasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        const result = await sendPasswordRequest(formData, confirmErrorContainer);

        if (result.success) {
            confirmErrorContainer.style.display = 'none';
            paneConfirmPassword.classList.add('disabled');
            paneConfirmPassword.classList.remove('active');
            paneSetNewPassword.classList.remove('disabled');
            paneSetNewPassword.classList.add('active');
        } else {
            confirmErrorContainer.textContent = result.message;
            confirmErrorContainer.style.display = 'block';
        }
    };
    
    const saveNewPassword = async () => {
        const formData = new FormData();
        formData.append('action', 'update_password');
        formData.append('current_password', currentPasswordInput.value);
        formData.append('new_password', newPasswordInput.value);
        formData.append('confirm_password', confirmPasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        const result = await sendPasswordRequest(formData, newErrorContainer);

        if (result.success) {
            alert(result.message);
            closeUpdatePasswordModal();
        } else {
            newErrorContainer.textContent = result.message;
            newErrorContainer.style.display = 'block';
        }
    };

    const sendPasswordRequest = async (formData, errorContainer) => {
        errorContainer.style.display = 'none';
        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            errorContainer.textContent = 'Error de conexión. Inténtalo de nuevo.';
            errorContainer.style.display = 'block';
            return { success: false, message: 'Error de conexión.' };
        }
    };

    const openDeleteAccountModal = () => {
        if (!deleteAccountModal) return;
        const errorContainer = deleteAccountModal.querySelector('.dialog-error-message');
        if (deletePasswordInput) deletePasswordInput.value = '';
        if (errorContainer) errorContainer.style.display = 'none';

        deleteAccountModal.classList.remove('disabled');
        requestAnimationFrame(() => {
            deleteAccountModal.classList.add('active');
        });
    };

    const closeDeleteAccountModal = () => {
        if (!deleteAccountModal || !deleteAccountModal.classList.contains('active')) return false;
        deleteAccountModal.classList.remove('active');
        deleteAccountModal.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && !deleteAccountModal.classList.contains('active')) {
                deleteAccountModal.classList.add('disabled');
            }
        }, { once: true });
        return true;
    };

    const handleDeleteAccount = async () => {
        if (!deletePasswordInput) return;
        const errorContainer = deleteAccountModal.querySelector('.dialog-error-message');

        const formData = new FormData();
        formData.append('action', 'delete_account');
        formData.append('password', deletePasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert('Tu cuenta ha sido eliminada.');
                window.location.href = result.redirect_url;
            } else {
                if(errorContainer) {
                    errorContainer.textContent = result.message || 'Ocurrió un error.';
                    errorContainer.style.display = 'block';
                }
            }
        } catch (error) {
            if(errorContainer) {
                errorContainer.textContent = 'Error de conexión. Inténtalo de nuevo.';
                errorContainer.style.display = 'block';
            }
        }
    };

    const setMenuOptionsClosed = () => {
        moduleOptions.classList.add('disabled');
        moduleOptions.classList.remove('active', 'fade-out');
        menuContentOptions.classList.add('disabled');
        menuContentOptions.classList.remove('active');
    };

    const setMenuOptionsOpen = () => {
        moduleOptions.classList.remove('disabled');
        moduleOptions.classList.add('active');
        menuContentOptions.classList.remove('disabled');
    };

    const closeMenuOptions = () => {
        if (isAnimating || !moduleOptions.classList.contains('active')) return false;

        if (window.innerWidth <= 468 && menuContentOptions) {
            isAnimating = true;
            menuContentOptions.removeAttribute('style');
            moduleOptions.classList.remove('fade-in');
            moduleOptions.classList.add('fade-out');
            menuContentOptions.classList.remove('active');

            moduleOptions.addEventListener('animationend', (e) => {
                if (e.animationName === 'fadeOut') {
                    setMenuOptionsClosed();
                    isAnimating = false;
                }
            }, { once: true });
        } else {
            setMenuOptionsClosed();
        }
        return true;
    };

    const openMenuOptions = () => {
        if (isAnimating || moduleOptions.classList.contains('active')) return false;

        if (!allowMultipleActiveModules) {
            closeAllModules();
        }
        
        setMenuOptionsOpen();

        if (window.innerWidth <= 468 && menuContentOptions) {
            isAnimating = true;
            moduleOptions.classList.remove('fade-out');
            moduleOptions.classList.add('fade-in');

            requestAnimationFrame(() => {
                menuContentOptions.classList.add('active');
            });

            moduleOptions.addEventListener('animationend', (e) => {
                if (e.animationName === 'fadeIn') {
                    moduleOptions.classList.remove('fade-in');
                    isAnimating = false;
                }
            }, { once: true });
        } else {
            menuContentOptions.classList.add('active');
        }
        return true;
    };

    const setMenuSurfaceClosed = () => {
        moduleSurface.classList.add('disabled');
        moduleSurface.classList.remove('active');
    };

    const setMenuSurfaceOpen = () => {
        if (!allowMultipleActiveModules) {
            closeAllModules();
        }
        moduleSurface.classList.remove('disabled');
        moduleSurface.classList.add('active');

        if (isSectionSettingsActive) {
            surfaceMain.classList.add('disabled');
            surfaceMain.classList.remove('active');
            surfaceHelp.classList.add('disabled');
            surfaceHelp.classList.remove('active');
            surfaceSettings.classList.remove('disabled');
            surfaceSettings.classList.add('active');
        } else if (isSectionHelpActive) {
            surfaceMain.classList.add('disabled');
            surfaceMain.classList.remove('active');
            surfaceSettings.classList.add('disabled');
            surfaceSettings.classList.remove('active');
            surfaceHelp.classList.remove('disabled');
            surfaceHelp.classList.add('active');
        } else {
            surfaceSettings.classList.add('disabled');
            surfaceSettings.classList.remove('active');
            surfaceHelp.classList.add('disabled');
            surfaceHelp.classList.remove('active');
            surfaceMain.classList.remove('disabled');
            surfaceMain.classList.add('active');
        }
    };

    const closeMenuSurface = () => {
        if (!moduleSurface.classList.contains('active')) return false;
        setMenuSurfaceClosed();
        return true;
    };

    const openMenuSurface = () => {
        if (moduleSurface.classList.contains('active')) return false;
        setMenuSurfaceOpen();
        return true;
    };

    const closeAllSelectors = () => {
        let closed = false;
        document.querySelectorAll('[data-module="moduleSelector"].active').forEach(selector => {
            const button = document.querySelector(`[aria-controls="${selector.id}"]`);
            if (button) {
                button.classList.remove('active');
            }
            selector.classList.add('disabled');
            selector.classList.remove('active');
            
            const popperId = selector.id;
            if (popperInstances[popperId]) {
                popperInstances[popperId].destroy();
                delete popperInstances[popperId];
            }
            closed = true;
        });
        return closed;
    };
    
    const closeAllModules = () => {
        closeAllSelectors();
        closeMenuOptions();
        closeMenuSurface();
        closeUpdatePasswordModal();
        closeDeleteAccountModal();
    };

    const updateMainMenuButtons = (activeButton) => {
        [toggleSectionHomeButton, toggleSectionExploreButton].forEach(button => {
            if (button) button.classList.remove('active');
        });
        if (activeButton) {
            activeButton.classList.add('active');
        }
    };

    const updateSettingsMenuButtons = (activeButton) => {
        [toggleSectionProfileButton, toggleSectionLoginButton, toggleSectionAccessibilityButton].forEach(button => {
            if (button) button.classList.remove('active');
        });
        if (activeButton) {
            activeButton.classList.add('active');
        }
    };

    const updateHelpMenuButtons = (activeButton) => {
        [toggleSectionPrivacyButton, toggleSectionTermsButton, toggleSectionCookiesButton, toggleSectionSuggestionsButton].forEach(button => {
            if (button) button.classList.remove('active');
        });
        if (activeButton) {
            activeButton.classList.add('active');
        }
    };

    const setSectionActive = (sectionToShow, sectionsToHide, activeStateSetter, updateUrl = true) => {
        sectionToShow.classList.remove('disabled');
        sectionToShow.classList.add('active');
        sectionsToHide.forEach(section => {
            section.classList.add('disabled');
            section.classList.remove('active');
        });

        isSectionHomeActive = activeStateSetter === 'home';
        isSectionExploreActive = activeStateSetter === 'explore';
        isSectionSettingsActive = activeStateSetter === 'settings';
        isSectionHelpActive = activeStateSetter === 'help';

        if (activeStateSetter !== 'settings') {
            isSectionProfileActive = false;
            isSectionLoginActive = false;
            isSectionAccessibilityActive = false;
        }

        if (activeStateSetter !== 'help') {
            isSectionPrivacyActive = false;
            isSectionTermsActive = false;
            isSectionCookiesActive = false;
            isSectionSuggestionsActive = false;
        }

        if (isSectionSettingsActive) {
            surfaceMain.classList.add('disabled');
            surfaceMain.classList.remove('active');
            surfaceHelp.classList.add('disabled');
            surfaceHelp.classList.remove('active');
            surfaceSettings.classList.remove('disabled');
            surfaceSettings.classList.add('active');
        } else if (isSectionHelpActive) {
            surfaceMain.classList.add('disabled');
            surfaceMain.classList.remove('active');
            surfaceSettings.classList.add('disabled');
            surfaceSettings.classList.remove('active');
            surfaceHelp.classList.remove('disabled');
            surfaceHelp.classList.add('active');
        } else {
            surfaceSettings.classList.add('disabled');
            surfaceSettings.classList.remove('active');
            surfaceHelp.classList.add('disabled');
            surfaceHelp.classList.remove('active');
            surfaceMain.classList.remove('disabled');
            surfaceMain.classList.add('active');
        }

        if (updateUrl) {
            let subsection = null;
            if (isSectionSettingsActive) {
                subsection = isSectionProfileActive ? 'profile' :
                    isSectionLoginActive ? 'login' : 'accessibility';
            } else if (isSectionHelpActive) {
                subsection = isSectionPrivacyActive ? 'privacy' :
                    isSectionTermsActive ? 'terms' :
                    isSectionCookiesActive ? 'cookies' : 'suggestions';
            }
            navigateToUrl(activeStateSetter, subsection);
        }
    };

    const setSubSectionActive = (sectionToShow, sectionsToHide, buttonToActivate, buttonsToDeactivate, activeStateSetter, updateUrl = true) => {
        sectionToShow.classList.remove('disabled');
        sectionToShow.classList.add('active');
        sectionsToHide.forEach(section => {
            section.classList.add('disabled');
            section.classList.remove('active');
        });

        buttonToActivate.classList.add('active');
        buttonsToDeactivate.forEach(button => {
            button.classList.remove('active');
        });

        isSectionProfileActive = activeStateSetter === 'profile';
        isSectionLoginActive = activeStateSetter === 'login';
        isSectionAccessibilityActive = activeStateSetter === 'accessibility';

        isSectionPrivacyActive = activeStateSetter === 'privacy';
        isSectionTermsActive = activeStateSetter === 'terms';
        isSectionCookiesActive = activeStateSetter === 'suggestions';
        isSectionSuggestionsActive = activeStateSetter === 'suggestions';

        if (updateUrl) {
            const mainSection = isSectionSettingsActive ? 'settings' : 'help';
            navigateToUrl(mainSection, activeStateSetter);
        }
    };
    
    const resetUIComponents = () => {
        closeAllModules();

        document.querySelectorAll('.profile-card-item .edit-state').forEach(editState => {
            if (!editState.classList.contains('hidden')) {
                editState.classList.add('hidden');
                const parent = editState.closest('.profile-card-item');
                if (parent) {
                    const viewState = parent.querySelector('.view-state');
                    if (viewState && viewState.classList.contains('hidden')) {
                        viewState.classList.remove('hidden');
                    }
                }
            }
        });
    };
    
    const loadAccountDates = async () => {
        const creationDateElem = document.getElementById('account-creation-date');
        const lastUpdateElem = document.getElementById('last-password-update');

        if (!creationDateElem || !lastUpdateElem) return;

        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_account_dates`);
            const data = await response.json();

            if (data.success) {
                creationDateElem.textContent = data.creation_date;
                lastUpdateElem.textContent = data.last_password_update;
            } else {
                creationDateElem.textContent = 'No disponible';
                lastUpdateElem.textContent = 'No disponible';
            }
        } catch (error) {
            creationDateElem.textContent = 'Error al cargar';
            lastUpdateElem.textContent = 'Error al cargar';
        }
    };

    const handleNavigationChange = (section, subsection = null, updateUrl = true) => {
        resetUIComponents();
        
        if (section === 'home') {
            setSectionActive(sectionHome, [sectionExplore, sectionSettings, sectionHelp], 'home', updateUrl);
            updateMainMenuButtons(toggleSectionHomeButton);
        } else if (section === 'explore') {
            setSectionActive(sectionExplore, [sectionHome, sectionSettings, sectionHelp], 'explore', updateUrl);
            updateMainMenuButtons(toggleSectionExploreButton);
        } else if (section === 'settings') {
            setSectionActive(sectionSettings, [sectionHome, sectionExplore, sectionHelp], 'settings', false);

            const sub = subsection || 'profile';
            if (sub === 'profile') {
                setSubSectionActive(sectionProfile, [sectionLogin, sectionAccessibility],
                    toggleSectionProfileButton, [toggleSectionLoginButton, toggleSectionAccessibilityButton], 'profile', updateUrl);
            } else if (sub === 'login') {
                setSubSectionActive(sectionLogin, [sectionProfile, sectionAccessibility],
                    toggleSectionLoginButton, [toggleSectionProfileButton, toggleSectionAccessibilityButton], 'login', updateUrl);
                loadAccountDates();
            } else if (sub === 'accessibility') {
                setSubSectionActive(sectionAccessibility, [sectionProfile, sectionLogin],
                    toggleSectionAccessibilityButton, [toggleSectionProfileButton, toggleSectionLoginButton], 'accessibility', updateUrl);
            }
        } else if (section === 'help') {
            setSectionActive(sectionHelp, [sectionHome, sectionExplore, sectionSettings], 'help', false);

            const sub = subsection || 'privacy';
            if (sub === 'privacy') {
                setSubSectionActive(sectionPrivacy, [sectionTerms, sectionCookies, sectionSuggestions],
                    toggleSectionPrivacyButton, [toggleSectionTermsButton, toggleSectionCookiesButton, toggleSectionSuggestionsButton], 'privacy', updateUrl);
            } else if (sub === 'terms') {
                setSubSectionActive(sectionTerms, [sectionPrivacy, sectionCookies, sectionSuggestions],
                    toggleSectionTermsButton, [toggleSectionPrivacyButton, toggleSectionCookiesButton, toggleSectionSuggestionsButton], 'terms', updateUrl);
            } else if (sub === 'cookies') {
                setSubSectionActive(sectionCookies, [sectionPrivacy, sectionTerms, sectionSuggestions],
                    toggleSectionCookiesButton, [toggleSectionPrivacyButton, toggleSectionTermsButton, toggleSectionSuggestionsButton], 'cookies', updateUrl);
            } else if (sub === 'suggestions') {
                setSubSectionActive(sectionSuggestions, [sectionPrivacy, sectionTerms, sectionCookies],
                    toggleSectionSuggestionsButton, [toggleSectionPrivacyButton, toggleSectionTermsButton, toggleSectionCookiesButton], 'suggestions', updateUrl);
            }
        }

        if (window.innerWidth <= 468) {
            closeMenuSurface();
            closeMenuOptions();
        }

        updateLogState();
    };

    const handleResize = () => {
        if (moduleOptions.classList.contains('active')) {
            if (window.innerWidth <= 468) {
                if (!menuContentOptions.classList.contains('active')) {
                    menuContentOptions.classList.add('active');
                }
            } else {
                menuContentOptions.classList.remove('active');
                menuContentOptions.removeAttribute('style');
            }
        }
    };

    const handleProfileUpdate = async (button) => {
        const field = button.dataset.field;
        const parentItem = button.closest('.profile-card-item');
        const editState = parentItem.querySelector('.edit-state');
        const viewState = parentItem.querySelector('.view-state');
        const input = editState.querySelector('.edit-input');
        const errorSpan = editState.querySelector('.edit-error-message');
        const newValue = input.value;

        errorSpan.style.display = 'none';
        errorSpan.textContent = '';

        if (field === 'email') {
            const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i;
            if (!emailRegex.test(newValue)) {
                errorSpan.textContent = 'Solo se permiten correos de @gmail.com o @outlook.com.';
                errorSpan.style.display = 'block';
                return;
            }
        }

        const formData = new FormData();
        formData.append('action', 'update_profile');
        formData.append('field', field);
        formData.append('value', newValue);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const displaySpan = viewState.querySelector('.profile-card-info span');
                displaySpan.textContent = result.newValue;

                editState.classList.add('hidden');
                viewState.classList.remove('hidden');
            } else {
                errorSpan.textContent = result.message || 'Ocurrió un error desconocido.';
                errorSpan.style.display = 'block';
            }
        } catch (error) {
            errorSpan.textContent = 'Error de conexión. Inténtalo de nuevo.';
            errorSpan.style.display = 'block';
        }
    };
    
    function setupEventListeners() {
        toggleOptionsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (moduleOptions.classList.contains('active')) {
                closeMenuOptions();
            } else {
                openMenuOptions();
            }
        });

        toggleSurfaceButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (moduleSurface.classList.contains('active')) {
                closeMenuSurface();
            } else {
                openMenuSurface();
            }
        });

        customSelectorButtons.forEach((button, index) => {
            const parentControlGroup = button.closest('.profile-control-group');
            if (!parentControlGroup) return;

            const selectorDropdown = parentControlGroup.querySelector('[data-module="moduleSelector"]');
            if (!selectorDropdown) return;

            const popperId = `selector-${index}`;
            selectorDropdown.id = popperId;
            button.setAttribute('aria-controls', popperId);

            const menuLinks = selectorDropdown.querySelectorAll('.menu-link');
            const selectedValueSpan = button.querySelector('.selected-value-text');
            const selectedValueIconLeft = button.querySelector('.selected-value-icon.left .material-symbols-rounded');

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isAlreadyActive = selectorDropdown.classList.contains('active');

                if (!allowMultipleActiveModules) {
                    closeAllModules();
                }

                if (isAlreadyActive) {
                    closeAllSelectors();
                } else {
                    selectorDropdown.classList.remove('disabled');
                    selectorDropdown.classList.add('active');
                    button.classList.add('active');
                    
                    popperInstances[popperId] = Popper.createPopper(button, selectorDropdown, {
                        placement: 'bottom-start',
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [0, 8],
                                },
                            },
                        ],
                    });
                }
            });

            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const newText = link.querySelector('.menu-link-text span').textContent;
                    if (selectedValueSpan) {
                        selectedValueSpan.textContent = newText;
                    }
                    
                    const newIcon = link.querySelector('.menu-link-icon .material-symbols-rounded');
                    if (selectedValueIconLeft && newIcon) {
                        selectedValueIconLeft.textContent = newIcon.textContent;
                    }

                    selectorDropdown.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    closeAllSelectors();
                });
            });
        });

        document.querySelectorAll('[data-action="toggleEditState"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const parent = e.target.closest('.profile-card-item');
                parent.querySelector('.view-state').classList.add('hidden');
                parent.querySelector('.edit-state').classList.remove('hidden');
            });
        });

        document.querySelectorAll('[data-action="toggleViewState"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const parent = e.target.closest('.profile-card-item');
                parent.querySelector('.edit-state').classList.add('hidden');
                parent.querySelector('.view-state').classList.remove('hidden');
                const errorSpan = parent.querySelector('.edit-error-message');
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                    errorSpan.textContent = '';
                }
            });
        });

        document.querySelectorAll('[data-action="saveProfile"]').forEach(button => {
            button.addEventListener('click', (e) => {
                handleProfileUpdate(e.target);
            });
        });
        
        const generalContentTop = document.querySelector('.general-content-top');
        const scrollableSections = document.querySelectorAll('.section-content.overflow-y');

        scrollableSections.forEach(section => {
            section.addEventListener('scroll', () => {
                if (generalContentTop) {
                    if (section.scrollTop > 0) {
                        generalContentTop.classList.add('shadow');
                    } else {
                        generalContentTop.classList.remove('shadow');
                    }
                }
            });
        });

        if (openUpdatePasswordModalButton) {
            openUpdatePasswordModalButton.addEventListener('click', openUpdatePasswordModal);
        }

        closeUpdatePasswordModalButtons.forEach(button => {
            button.addEventListener('click', closeUpdatePasswordModal);
        });

        if (confirmCurrentPasswordButton) {
            confirmCurrentPasswordButton.addEventListener('click', showNewPasswordPane);
        }
        
        if (saveNewPasswordButton) {
            saveNewPasswordButton.addEventListener('click', saveNewPassword);
        }

        if (openDeleteAccountModalButton) {
            openDeleteAccountModalButton.addEventListener('click', openDeleteAccountModal);
        }

        closeDeleteAccountModalButtons.forEach(button => {
            button.addEventListener('click', closeDeleteAccountModal);
        });

        if (confirmDeleteAccountButton) {
            confirmDeleteAccountButton.addEventListener('click', handleDeleteAccount);
        }

        if (toggleSectionHomeButton) {
            toggleSectionHomeButton.addEventListener('click', () => {
                if (!isSectionHomeActive) handleNavigationChange('home');
            });
        }
        if (toggleSectionExploreButton) {
            toggleSectionExploreButton.addEventListener('click', () => {
                if (!isSectionExploreActive) handleNavigationChange('explore');
            });
        }
        if (toggleSectionSettingsButton) {
            toggleSectionSettingsButton.addEventListener('click', () => {
                handleNavigationChange('settings', 'profile');
                closeMenuOptions();
            });
        }
        if (toggleSectionHelpButton) {
            toggleSectionHelpButton.addEventListener('click', () => {
                handleNavigationChange('help', 'privacy');
                closeMenuOptions();
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                const backendLogoutUrl = window.PROJECT_CONFIG.baseUrl.replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/logout.php');
                window.location.href = backendLogoutUrl;
            });
        }

        if (toggleSectionHomeFromSettingsButton) {
            toggleSectionHomeFromSettingsButton.addEventListener('click', () => handleNavigationChange('home'));
        }
        if (toggleSectionProfileButton) {
            toggleSectionProfileButton.addEventListener('click', () => {
                if (!isSectionProfileActive) handleNavigationChange('settings', 'profile');
            });
        }
        if (toggleSectionLoginButton) {
            toggleSectionLoginButton.addEventListener('click', () => {
                if (!isSectionLoginActive) handleNavigationChange('settings', 'login');
            });
        }
        if (toggleSectionAccessibilityButton) {
            toggleSectionAccessibilityButton.addEventListener('click', () => {
                if (!isSectionAccessibilityActive) handleNavigationChange('settings', 'accessibility');
            });
        }
        if (toggleSectionHomeFromHelpButton) {
            toggleSectionHomeFromHelpButton.addEventListener('click', () => handleNavigationChange('home'));
        }
        if (toggleSectionPrivacyButton) {
            toggleSectionPrivacyButton.addEventListener('click', () => {
                if (!isSectionPrivacyActive) handleNavigationChange('help', 'privacy');
            });
        }
        if (toggleSectionTermsButton) {
            toggleSectionTermsButton.addEventListener('click', () => {
                if (!isSectionTermsActive) handleNavigationChange('help', 'terms');
            });
        }
        if (toggleSectionCookiesButton) {
            toggleSectionCookiesButton.addEventListener('click', () => {
                if (!isSectionCookiesActive) handleNavigationChange('help', 'cookies');
            });
        }
        if (toggleSectionSuggestionsButton) {
            toggleSectionSuggestionsButton.addEventListener('click', () => {
                if (!isSectionSuggestionsActive) handleNavigationChange('help', 'suggestions');
            });
        }

        if (closeOnClickOutside) {
            document.addEventListener('click', (e) => {
                if (isAnimating) return;
                
                const moduleOptionsIsOpen = moduleOptions.classList.contains('active');
                const activeSelector = document.querySelector('[data-module="moduleSelector"].active');

                if (moduleOptionsIsOpen) {
                    if (window.innerWidth <= 468) {
                        if (e.target === moduleOptions) {
                            closeMenuOptions();
                        }
                    } else if (!moduleOptions.contains(e.target) && !toggleOptionsButton.contains(e.target)) {
                        closeMenuOptions();
                    }
                }
                
                if (activeSelector) {
                    const selectorButton = document.querySelector(`[aria-controls="${activeSelector.id}"]`);
                    if (selectorButton && !selectorButton.contains(e.target) && !activeSelector.contains(e.target)) {
                        closeAllSelectors();
                    }
                }
                
                if (moduleSurface.classList.contains('active') && !moduleSurface.contains(e.target) && !toggleSurfaceButton.contains(e.target)) {
                    closeMenuSurface();
                }

                if (updatePasswordModal.classList.contains('active')) {
                    const dialogContent = updatePasswordModal.querySelector('.dialog-content');
                    if (dialogContent && !dialogContent.contains(e.target)) {
                        closeUpdatePasswordModal();
                    }
                }

                if (deleteAccountModal && deleteAccountModal.classList.contains('active')) {
                    const dialogContent = deleteAccountModal.querySelector('.dialog-content');
                    if (dialogContent && !dialogContent.contains(e.target)) {
                        closeDeleteAccountModal();
                    }
                }
            });
        }

        if (closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeAllModules();
                }
            });
        }

        window.addEventListener('resize', handleResize);
    }
    
    // -- SOLUCIÓN AL PROBLEMA DE RECARGA --
    // Se añade esta lógica para comprobar el estado inicial de la página
    // y cargar los datos si es necesario.
    const initializePageData = () => {
        const initialState = getCurrentUrlState();
        if (initialState && initialState.section === 'settings' && initialState.subsection === 'login') {
            loadAccountDates();
        }
    };
    
    setupEventListeners();
    initializePageData(); // <--- LLAMADA A LA NUEVA FUNCIÓN
    
    const handleDragClose = () => {
        if (moduleOptions.classList.contains('active')) {
            closeMenuOptions();
        }
    };

    initDragController(handleDragClose, () => isAnimating);
    
    updateLogState();
    console.log('ProjectLeviathan initialized with URL routing and dynamic modules support');
}

export { initMainController };