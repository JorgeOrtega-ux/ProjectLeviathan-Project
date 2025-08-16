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

    // Elementos Generales
    const toggleOptionsButton = document.querySelector('[data-action="toggleModuleOptions"]');
    const moduleOptions = document.querySelector('[data-module="moduleOptions"]');
    const toggleSurfaceButton = document.querySelector('[data-action="toggleModuleSurface"]');
    const moduleSurface = document.querySelector('[data-module="moduleSurface"]');
    const surfaceMain = document.querySelector('[data-surface-type="main"]');
    const surfaceSettings = document.querySelector('[data-surface-type="settings"]');
    const surfaceHelp = document.querySelector('[data-surface-type="help"]');
    const customSelectorButtons = document.querySelectorAll('[data-action="toggleSelector"]');
    const logoutButton = document.querySelector('[data-action="logout"]');

    // Secciones y Sub-secciones
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

    // Botones de Navegación
    const toggleSectionHomeButton = document.querySelector('[data-action="toggleSectionHome"]');
    const toggleSectionExploreButtons = document.querySelectorAll('[data-action="toggleSectionExplore"]');
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

    // --- REFACTORIZACIÓN DEL MODAL ---
    const accountActionModal = document.querySelector('[data-module="accountActionModal"]');
    // Diálogo de Actualizar Contraseña
    const updatePasswordDialog = accountActionModal?.querySelector('[data-dialog="updatePassword"]');
    const openUpdatePasswordModalButton = document.querySelector('[data-action="openUpdatePasswordModal"]');
    const closeAccountActionModalButtons = document.querySelectorAll('[data-action="closeAccountActionModal"]');
    const paneConfirmPassword = updatePasswordDialog?.querySelector('[data-pane="confirmPassword"]');
    const paneSetNewPassword = updatePasswordDialog?.querySelector('[data-pane="setNewPassword"]');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmCurrentPasswordButton = document.querySelector('[data-action="confirmCurrentPassword"]');
    const saveNewPasswordButton = document.querySelector('[data-action="saveNewPassword"]');
    const confirmErrorContainer = paneConfirmPassword?.querySelector('.dialog-error-message');
    const newErrorContainer = paneSetNewPassword?.querySelector('.dialog-error-message');
    // Diálogo de Eliminar Cuenta
    const deleteAccountDialog = accountActionModal?.querySelector('[data-dialog="deleteAccount"]');
    const openDeleteAccountModalButton = document.querySelector('[data-action="openDeleteAccountModal"]');
    const confirmDeleteAccountButton = document.querySelector('[data-action="confirmDeleteAccount"]');
    const deletePasswordInput = document.getElementById('delete-confirm-password');
    const deleteErrorContainer = deleteAccountDialog?.querySelector('.dialog-error-message');
    // --- FIN DE LA REFACTORIZACIÓN ---
    
    // --- LÓGICA PARA EXPLORAR ---
    const exploreTabs = document.querySelector('.explore-tabs');
    const searchInput = document.getElementById('community-search-input');
    const municipalitiesGrid = document.querySelector('.explore-content-section[data-section-id="municipalities"] .community-cards-grid');
    const universitiesGrid = document.querySelector('.explore-content-section[data-section-id="universities"] .community-cards-grid');
    const loadMoreMunicipalitiesButton = document.querySelector('.load-more-button[data-type="municipalities"]');
    const loadMoreUniversitiesButton = document.querySelector('.load-more-button[data-type="universities"]');

    const ITEMS_PER_PAGE = 12;
    let allMunicipalities = [];
    let allUniversities = [];
    let displayedMunicipalitiesCount = 0;
    let displayedUniversitiesCount = 0;
    let currentUniversityFilter = 'all';


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

    // --- LÓGICA DEL MODAL UNIFICADO (SIN ANIMACIÓN) ---
    const resetPasswordModal = () => {
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        if (confirmErrorContainer) confirmErrorContainer.style.display = 'none';
        if (newErrorContainer) newErrorContainer.style.display = 'none';
        paneConfirmPassword?.classList.remove('disabled');
        paneConfirmPassword?.classList.add('active');
        paneSetNewPassword?.classList.add('disabled');
        paneSetNewPassword?.classList.remove('active');
    };

    const resetDeleteAccountModal = () => {
        if (deletePasswordInput) deletePasswordInput.value = '';
        if (deleteErrorContainer) deleteErrorContainer.style.display = 'none';
    };

    const openAccountActionModal = (dialogType) => {
        if (!accountActionModal) return;
        let targetDialog;

        if (dialogType === 'updatePassword') {
            resetPasswordModal();
            targetDialog = updatePasswordDialog;
        } else if (dialogType === 'deleteAccount') {
            resetDeleteAccountModal();
            targetDialog = deleteAccountDialog;
        } else {
            return;
        }

        accountActionModal.classList.remove('disabled');
        accountActionModal.classList.add('active');
        targetDialog?.classList.remove('disabled');
        targetDialog?.classList.add('active');
    };

    const closeAccountActionModal = () => {
        if (!accountActionModal) return false;
        
        accountActionModal.classList.add('disabled');
        accountActionModal.classList.remove('active');
        
        accountActionModal.querySelectorAll('.dialog-pane').forEach(pane => {
            pane.classList.add('disabled');
            pane.classList.remove('active');
        });

        return true;
    };
    // --- FIN DE LÓGICA DEL MODAL UNIFICADO ---


    const showNewPasswordPane = async () => {
        const formData = new FormData();
        formData.append('action', 'update_password');
        formData.append('current_password', currentPasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        const result = await sendPasswordRequest(formData, confirmErrorContainer);

        if (result.success) {
            confirmErrorContainer.style.display = 'none';
            paneConfirmPassword.classList.remove('active');
            paneConfirmPassword.classList.add('disabled');
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
            closeAccountActionModal();
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

    const handleDeleteAccount = async () => {
        if (!deletePasswordInput || !deleteErrorContainer) return;

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
                deleteErrorContainer.textContent = result.message || 'Ocurrió un error.';
                deleteErrorContainer.style.display = 'block';
            }
        } catch (error) {
            deleteErrorContainer.textContent = 'Error de conexión. Inténtalo de nuevo.';
            deleteErrorContainer.style.display = 'block';
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
        closeAccountActionModal();
    };

    // --- INICIO DE LA MODIFICACIÓN ROBUSTA ---
    const updateMainMenuButtons = (activeAction) => {
        const mainMenuLinks = surfaceMain.querySelectorAll('.menu-link');
        mainMenuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.action === activeAction);
        });
    };

    const updateSettingsMenuButtons = (activeAction) => {
        const settingsMenuLinks = surfaceSettings.querySelectorAll('.menu-link');
        settingsMenuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.action === activeAction);
        });
    };

    const updateHelpMenuButtons = (activeAction) => {
        const helpMenuLinks = surfaceHelp.querySelectorAll('.menu-link');
        helpMenuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.action === activeAction);
        });
    };
    // --- FIN DE LA MODIFICACIÓN ROBUSTA ---

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

    const setSubSectionActive = (sectionToShow, sectionsToHide, activeStateSetter, updateUrl = true) => {
        sectionToShow.classList.remove('disabled');
        sectionToShow.classList.add('active');
        sectionsToHide.forEach(section => {
            section.classList.add('disabled');
            section.classList.remove('active');
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
        const wasExploreActive = isSectionExploreActive;

        resetUIComponents();

        if (section === 'home') {
            setSectionActive(sectionHome, [sectionExplore, sectionSettings, sectionHelp], 'home', updateUrl);
            updateMainMenuButtons('toggleSectionHome');
            loadHomeContent(); // --- ACTUALIZACIÓN: Cargar contenido de Home al navegar ---
        } else if (section === 'explore') {
            setSectionActive(sectionExplore, [sectionHome, sectionSettings, sectionHelp], 'explore', updateUrl);
            updateMainMenuButtons('toggleSectionExplore');
            
            if (allMunicipalities.length === 0) loadMunicipalityGroups();
            if (allUniversities.length === 0) loadUniversityGroups(currentUniversityFilter);
            
            populateMunicipalityFilter();
        } else if (section === 'settings') {
            setSectionActive(sectionSettings, [sectionHome, sectionExplore, sectionHelp], 'settings', false);

            const sub = subsection || 'profile';
            if (sub === 'profile') {
                setSubSectionActive(sectionProfile, [sectionLogin, sectionAccessibility], 'profile', updateUrl);
                updateSettingsMenuButtons('toggleSectionProfile');
            } else if (sub === 'login') {
                setSubSectionActive(sectionLogin, [sectionProfile, sectionAccessibility], 'login', updateUrl);
                updateSettingsMenuButtons('toggleSectionLogin');
                loadAccountDates();
            } else if (sub === 'accessibility') {
                setSubSectionActive(sectionAccessibility, [sectionProfile, sectionLogin], 'accessibility', updateUrl);
                updateSettingsMenuButtons('toggleSectionAccessibility');
            }
        } else if (section === 'help') {
            setSectionActive(sectionHelp, [sectionHome, sectionExplore, sectionSettings], 'help', false);

            const sub = subsection || 'privacy';
            if (sub === 'privacy') {
                setSubSectionActive(sectionPrivacy, [sectionTerms, sectionCookies, sectionSuggestions], 'privacy', updateUrl);
                updateHelpMenuButtons('toggleSectionPrivacy');
            } else if (sub === 'terms') {
                setSubSectionActive(sectionTerms, [sectionPrivacy, sectionCookies, sectionSuggestions], 'terms', updateUrl);
                updateHelpMenuButtons('toggleSectionTerms');
            } else if (sub === 'cookies') {
                setSubSectionActive(sectionCookies, [sectionPrivacy, sectionTerms, sectionSuggestions], 'cookies', updateUrl);
                updateHelpMenuButtons('toggleSectionCookies');
            } else if (sub === 'suggestions') {
                setSubSectionActive(sectionSuggestions, [sectionPrivacy, sectionTerms, sectionCookies], 'suggestions', updateUrl);
                updateHelpMenuButtons('toggleSectionSuggestions');
            }
        }

        if (wasExploreActive && section !== 'explore') {
            resetExploreSection();
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
        
        if (field === 'username') {
            const usernameRegex = /^[a-zA-Z0-9_]{4,25}$/;
            if (!usernameRegex.test(newValue)) {
                errorSpan.textContent = 'El nombre debe tener entre 4 y 25 caracteres, y solo puede contener letras, números y guiones bajos.';
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
    
    const handlePreferenceUpdate = async (field, value) => {
        const formData = new FormData();
        formData.append('action', 'update_preference');
        formData.append('field', field);
        formData.append('value', value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                if (window.PROJECT_CONFIG.userPreferences) {
                    window.PROJECT_CONFIG.userPreferences[field] = String(value);
                }
            } else {
                console.error('Failed to save preference:', result.message);
            }
        } catch (error) {
            console.error('Connection error while saving preference:', error);
        }
    };

    const initializePreferenceControls = () => {
        const prefs = window.PROJECT_CONFIG.userPreferences || {};

        document.querySelectorAll('[data-preference-field]').forEach(container => {
            const field = container.dataset.preferenceField;
            const value = prefs[field];

            const toggle = container.querySelector('.toggle-switch input[type="checkbox"]');
            if (toggle) {
                toggle.checked = (value == true);
            }

            const selectorButton = container.querySelector('.selector-input');
            if (selectorButton) {
                const menuList = container.querySelector('.menu-list');
                const activeLink = menuList.querySelector(`.menu-link[data-value="${value}"]`) || menuList.querySelector('.menu-link.active');

                if (activeLink) {
                    const textSpan = selectorButton.querySelector('.selected-value-text');
                    const iconSpan = selectorButton.querySelector('.selected-value-icon.left .material-symbols-rounded');
                    
                    textSpan.textContent = activeLink.querySelector('.menu-link-text span').textContent;
                    if (iconSpan && activeLink.querySelector('.menu-link-icon .material-symbols-rounded')) {
                        iconSpan.textContent = activeLink.querySelector('.menu-link-icon .material-symbols-rounded').textContent;
                    }
                }
            }
        });
    };

    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (themeValue) => {
        const docEl = document.documentElement;
        let isDark;

        if (themeValue === 'system') {
            isDark = themeMediaQuery.matches;
        } else {
            isDark = themeValue === 'dark';
        }

        docEl.classList.remove(isDark ? 'light-theme' : 'dark-theme');
        docEl.classList.add(isDark ? 'dark-theme' : 'light-theme');
    };

    const handleSystemThemeChange = (e) => {
        const currentThemePref = window.PROJECT_CONFIG.userPreferences.theme;
        if (currentThemePref === 'system') {
            applyTheme('system');
        }
    };
    
    // --- LÓGICA PARA EXPLORAR (CON CARGAR MÁS) ---
    const resetExploreSection = () => {
        allMunicipalities = [];
        allUniversities = [];
        displayedMunicipalitiesCount = 0;
        displayedUniversitiesCount = 0;
        currentUniversityFilter = 'all';

        if (municipalitiesGrid) municipalitiesGrid.innerHTML = '';
        if (universitiesGrid) universitiesGrid.innerHTML = '';
        if (searchInput) searchInput.value = '';

        if (exploreTabs) {
            exploreTabs.querySelector('.tab-item[data-tab="municipalities"]').classList.add('active');
            exploreTabs.querySelector('.tab-item[data-tab="universities"]').classList.remove('active');
        }
        
        document.querySelector('.explore-content-section[data-section-id="municipalities"]').classList.add('active');
        document.querySelector('.explore-content-section[data-section-id="universities"]').classList.remove('active');

        const universityFilterButton = document.getElementById('university-municipality-selector-button');
        const universityFilterDropdown = document.getElementById('university-municipality-selector-dropdown');
        if (universityFilterButton && universityFilterDropdown) {
            universityFilterButton.querySelector('.selected-value-text').textContent = 'Filtrar por municipio';
            universityFilterDropdown.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
            const allOption = universityFilterDropdown.querySelector('.menu-link[data-value="all"]');
            if (allOption) allOption.classList.add('active');
        }
    };

    const displayGroups = (sourceArray, gridElement, countState, buttonElement) => {
        gridElement.innerHTML = '';
        const groupsToDisplay = sourceArray.slice(0, countState);
        
        if (groupsToDisplay.length === 0 && sourceArray.length > 0) {
             gridElement.innerHTML = '<p class="empty-grid-message">No se encontraron más comunidades.</p>';
        } else if (sourceArray.length === 0) {
             gridElement.innerHTML = '<p class="empty-grid-message">No hay comunidades para mostrar.</p>';
        } else {
            renderGroupCards(groupsToDisplay, gridElement);
        }
        
        if (countState >= sourceArray.length) {
            buttonElement.classList.add('hidden');
        } else {
            buttonElement.classList.remove('hidden');
        }
    };

    const loadMunicipalityGroups = async () => {
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_municipality_groups`);
            const data = await response.json();
            if (data.success) {
                allMunicipalities = data.groups;
                displayedMunicipalitiesCount = ITEMS_PER_PAGE;
                displayGroups(allMunicipalities, municipalitiesGrid, displayedMunicipalitiesCount, loadMoreMunicipalitiesButton);
            } else {
                municipalitiesGrid.innerHTML = `<p>${data.message || 'Error al cargar grupos.'}</p>`;
            }
        } catch (error) {
            municipalitiesGrid.innerHTML = '<p>Error de conexión.</p>';
        }
    };

    const loadUniversityGroups = async (municipalityId) => {
        currentUniversityFilter = municipalityId;
        universitiesGrid.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_university_groups&municipality_id=${municipalityId}`);
            const data = await response.json();
            
            if (data.success) {
                allUniversities = data.groups;
                displayedUniversitiesCount = ITEMS_PER_PAGE;
                displayGroups(allUniversities, universitiesGrid, displayedUniversitiesCount, loadMoreUniversitiesButton);
            } else {
                universitiesGrid.innerHTML = `<p>${data.message || 'Error al cargar universidades.'}</p>`;
            }
        } catch (error) {
            console.error('Error al cargar universidades:', error);
            universitiesGrid.innerHTML = '<p>Error de conexión.</p>';
        }
    };

    const populateMunicipalityFilter = async () => {
        const universityMunicipalitySelectorDropdown = document.getElementById('university-municipality-selector-dropdown');
        if (!universityMunicipalitySelectorDropdown) return;
        
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_municipalities`);
            const data = await response.json();
            if(data.success) {
                const menuList = universityMunicipalitySelectorDropdown.querySelector('.menu-list');
                if (!menuList) return;
                menuList.innerHTML = '';
                
                let totalUniversities = 0;
                data.municipalities.forEach(municipality => {
                    totalUniversities += parseInt(municipality.university_count, 10);
                });

                const allOption = document.createElement('div');
                allOption.className = 'menu-link active';
                allOption.dataset.value = 'all';
                allOption.innerHTML = `
                    <div class="menu-link-icon"><span class="material-symbols-rounded">public</span></div>
                    <div class="menu-link-text">
                        <span>Todos los municipios</span>
                        <span class="menu-link-badge">${totalUniversities}</span>
                    </div>
                `;
                menuList.appendChild(allOption);

                data.municipalities.forEach(municipality => {
                    const option = document.createElement('div');
                    option.className = 'menu-link';
                    option.dataset.value = municipality.id;
                    option.innerHTML = `
                        <div class="menu-link-icon"><span class="material-symbols-rounded">location_city</span></div>
                        <div class="menu-link-text">
                            <span>${municipality.group_title}</span>
                            <span class="menu-link-badge">${municipality.university_count}</span>
                        </div>
                    `;
                    menuList.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error populating municipality filter:', error);
        }
    };

    const renderGroupCards = (groups, grid) => {
        grid.innerHTML = ''; // Limpiar antes de renderizar
        groups.forEach(group => {
            const isMember = group.is_member;
            const buttonText = isMember ? 'Abandonar' : 'Unirse';
            const buttonClass = isMember ? 'join-button leave' : 'join-button';
            const card = document.createElement('div');
            card.className = 'community-card';
            card.dataset.groupUuid = group.uuid;
            card.dataset.groupName = group.group_title.toLowerCase();

            const groupType = grid === universitiesGrid ? 'university' : 'municipality';
            card.dataset.groupType = groupType;
            
            const icon = grid === universitiesGrid ? 'school' : 'groups';

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon-wrapper">
                        <span class="material-symbols-rounded">${icon}</span>
                    </div>
                    <div class="card-header-info">
                        <h3 class="card-title">${group.group_title}</h3>
                        <p class="card-subtitle">${group.group_subtitle}</p>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-footer">
                        <div class="card-stats">
                            <div class="info-pill">
                                <span class="material-symbols-rounded">${group.privacy === 'public' ? 'public' : 'lock'}</span>
                                <span>${group.privacy === 'public' ? 'Público' : 'Privado'}</span>
                            </div>
                            <div class="info-pill">
                                <span class="material-symbols-rounded">group</span>
                                <span data-member-count>${group.members}</span>
                            </div>
                        </div>
                        <button class="${buttonClass}" data-privacy="${group.privacy}">${buttonText}</button>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
    };
    // --- FIN DE LÓGICA PARA EXPLORAR ---
    
    // --- INICIO DE LA LÓGICA DINÁMICA PARA HOME ---
    const loadHomeContent = async () => {
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_user_groups`);
            const data = await response.json();
            if (data.success && data.groups.length > 0) {
                renderDashboardView(data.groups);
            } else {
                renderDiscoveryView();
            }
        } catch (error) {
            console.error("Error loading user groups, showing discovery view.", error);
            renderDiscoveryView();
        }
    };
    
    const refreshHomeView = () => {
        if (isSectionHomeActive) {
            loadHomeContent();
        }
    };

    const renderDashboardView = (groups) => {
        const homeTabs = document.getElementById('home-tabs');
        const homeGrid = document.getElementById('home-grid');

        homeTabs.innerHTML = `
            <div class="tab-item active" data-tab="my-communities">
                <span class="material-symbols-rounded">groups</span>
                <span>Mis Comunidades</span>
            </div>
            <div class="tab-item" data-tab="activity-feed">
                <span class="material-symbols-rounded">feed</span>
                <span>Actividad Reciente</span>
            </div>
        `;

        let gridHTML = '';
        groups.forEach(group => {
            const icon = group.group_type === 'university' ? 'school' : 'groups';
            gridHTML += `
                <div class="home-community-card">
                    <div class="home-card-header">
                        <div class="home-card-icon-wrapper">
                            <span class="material-symbols-rounded">${icon}</span>
                        </div>
                        <div class="home-card-info">
                            <h3 class="home-card-title">${group.group_title}</h3>
                            <p class="home-card-subtitle">${group.group_subtitle}</p>
                        </div>
                    </div>
                    <div class="home-card-footer">
                        <span class="home-card-members">${group.members} miembros</span>
                        <button class="home-card-join-button view">Ver</button>
                    </div>
                </div>
            `;
        });
        homeGrid.innerHTML = gridHTML;
    };

    const renderDiscoveryView = () => {
        const homeTabs = document.getElementById('home-tabs');
        const homeGrid = document.getElementById('home-grid');

        homeTabs.innerHTML = `
            <div class="tab-item active" data-tab="recommendations">
                <span class="material-symbols-rounded">recommend</span>
                <span>Recomendaciones</span>
            </div>
            <div class="tab-item" data-tab="trending">
                <span class="material-symbols-rounded">local_fire_department</span>
                <span>Tendencias</span>
            </div>
        `;

        homeGrid.innerHTML = `
            <div class="home-community-card">
                <div class="home-card-header">
                    <div class="home-card-icon-wrapper">
                        <span class="material-symbols-rounded">groups</span>
                    </div>
                    <div class="home-card-info">
                        <h3 class="home-card-title">Comunidad de Victoria</h3>
                        <p class="home-card-subtitle">Espacio para los residentes de la capital.</p>
                    </div>
                </div>
                <div class="home-card-footer">
                    <span class="home-card-members">1,234 miembros</span>
                    <button class="home-card-join-button">Unirse</button>
                </div>
            </div>
            <div class="home-community-card">
                 <div class="home-card-header">
                    <div class="home-card-icon-wrapper">
                        <span class="material-symbols-rounded">school</span>
                    </div>
                    <div class="home-card-info">
                        <h3 class="home-card-title">Universidad Politécnica</h3>
                        <p class="home-card-subtitle">Comunidad oficial de estudiantes.</p>
                    </div>
                </div>
                <div class="home-card-footer">
                    <span class="home-card-members">567 miembros</span>
                    <button class="home-card-join-button">Unirse</button>
                </div>
            </div>
        `;
    };
    // --- FIN DE LA LÓGICA DINÁMICA ---

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

        const usernameInput = document.querySelector('[data-section="name"] .edit-input');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
            });
        }
        
        if (exploreTabs) {
            exploreTabs.addEventListener('click', (e) => {
                const tabItem = e.target.closest('.tab-item');
                if (!tabItem || tabItem.classList.contains('active')) return;

                exploreTabs.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
                tabItem.classList.add('active');

                const targetTab = tabItem.dataset.tab;
                document.querySelectorAll('.explore-content-section').forEach(section => {
                    section.classList.toggle('active', section.dataset.sectionId === targetTab);
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.community-card').forEach(card => {
                    const groupName = card.dataset.groupName;
                    card.style.display = groupName.includes(searchTerm) ? 'flex' : 'none';
                });
            });
        }

        if (loadMoreMunicipalitiesButton) {
            loadMoreMunicipalitiesButton.addEventListener('click', () => {
                displayedMunicipalitiesCount += ITEMS_PER_PAGE;
                displayGroups(allMunicipalities, municipalitiesGrid, displayedMunicipalitiesCount, loadMoreMunicipalitiesButton);
            });
        }

        if (loadMoreUniversitiesButton) {
            loadMoreUniversitiesButton.addEventListener('click', () => {
                displayedUniversitiesCount += ITEMS_PER_PAGE;
                displayGroups(allUniversities, universitiesGrid, displayedUniversitiesCount, loadMoreUniversitiesButton);
            });
        }

        document.querySelectorAll('[data-action="toggleSelector"]').forEach((button, index) => {
            const parentControlGroup = button.closest('.profile-control-group, .explore-control-group');
            if (!parentControlGroup) return;

            const selectorDropdown = parentControlGroup.querySelector('[data-module="moduleSelector"]');
            if (!selectorDropdown) return;

            if (!selectorDropdown.id) {
                selectorDropdown.id = `selector-dropdown-${index}`;
            }
            const popperId = selectorDropdown.id;
            button.setAttribute('aria-controls', popperId);

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
                        modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
                    });
                }
            });

            selectorDropdown.addEventListener('click', (e) => {
                const link = e.target.closest('.menu-link');
                if (!link) return;

                const newTextSpan = link.querySelector('.menu-link-text span');
                const newText = newTextSpan ? newTextSpan.textContent : '';

                if (button.querySelector('.selected-value-text')) {
                    button.querySelector('.selected-value-text').textContent = newText;
                }

                const newIcon = link.querySelector('.menu-link-icon .material-symbols-rounded');
                const selectedValueIconLeft = button.querySelector('.selected-value-icon.left .material-symbols-rounded');
                if (selectedValueIconLeft && newIcon) {
                    selectedValueIconLeft.textContent = newIcon.textContent;
                }

                selectorDropdown.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const parentItem = button.closest('[data-preference-field]');
                if (parentItem) {
                    const preferenceField = parentItem.dataset.preferenceField;
                    const newValue = link.dataset.value;
                    handlePreferenceUpdate(preferenceField, newValue);
                    if (preferenceField === 'theme') {
                        applyTheme(newValue);
                    }
                }
                
                if (button.id === 'university-municipality-selector-button') {
                     const municipalityId = link.dataset.value;
                     loadUniversityGroups(municipalityId);
                }

                closeAllSelectors();
            });
        });
        
        document.querySelector('.explore-content').addEventListener('click', async (e) => {
            const joinButton = e.target.closest('.join-button');
            if (!joinButton) return;

            const card = joinButton.closest('.community-card');
            const groupUuid = card.dataset.groupUuid;
            const groupType = card.dataset.groupType;
            const privacy = joinButton.dataset.privacy;
            
            if (privacy === 'private' && !joinButton.classList.contains('leave')) {
                const accessCodeDialog = document.querySelector('[data-dialog="accessCode"]');
                if (accessCodeDialog) {
                    accessCodeDialog.dataset.groupUuid = groupUuid;
                    accessCodeDialog.dataset.groupType = groupType;
                    
                    const accountActionModal = document.querySelector('[data-module="accountActionModal"]');
                    accountActionModal.classList.remove('disabled');
                    accountActionModal.classList.add('active');
                    accessCodeDialog.classList.remove('disabled');
                    accessCodeDialog.classList.add('active');
                }
                return;
            }

            const formData = new FormData();
            formData.append('action', 'toggle_group_membership');
            formData.append('group_uuid', groupUuid);
            formData.append('group_type', groupType);
            formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);
            
            try {
                const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    if (result.action === 'private') {
                        alert(result.message);
                    } else {
                        const memberCountSpan = card.querySelector('[data-member-count]');
                        memberCountSpan.textContent = `${result.newMemberCount}`;
                        if (result.action === 'joined') {
                            joinButton.textContent = 'Abandonar';
                            joinButton.classList.add('leave');
                        } else {
                            joinButton.textContent = 'Unirse';
                            joinButton.classList.remove('leave');
                        }
                        refreshHomeView(); // --- ACTUALIZACIÓN: Refrescar Home al cambiar membresía ---
                    }
                } else {
                    alert(result.message || 'Ocurrió un error.');
                }
            } catch (error) {
                alert('Error de conexión.');
            }
        });

        const submitAccessCodeButton = document.querySelector('[data-action="submitAccessCode"]');
        if (submitAccessCodeButton) {
            submitAccessCodeButton.addEventListener('click', async () => {
                const accessCodeDialog = document.querySelector('[data-dialog="accessCode"]');
                const groupUuid = accessCodeDialog.dataset.groupUuid;
                const groupType = accessCodeDialog.dataset.groupType;
                const accessCodeInput = document.getElementById('group-access-code');
                const errorContainer = accessCodeDialog.querySelector('.dialog-error-message');

                const formData = new FormData();
                formData.append('action', 'join_private_group');
                formData.append('group_uuid', groupUuid);
                formData.append('group_type', groupType);
                formData.append('access_code', accessCodeInput.value);
                formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

                try {
                    const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();

                    if (result.success) {
                        closeAccountActionModal();
                        const card = document.querySelector(`.community-card[data-group-uuid="${groupUuid}"]`);
                        if (card) {
                            const memberCountSpan = card.querySelector('[data-member-count]');
                            const joinButton = card.querySelector('.join-button');
                            memberCountSpan.textContent = `${result.newMemberCount}`;
                            joinButton.textContent = 'Abandonar';
                            joinButton.classList.add('leave');
                        }
                        refreshHomeView(); // --- ACTUALIZACIÓN: Refrescar Home al cambiar membresía ---
                    } else {
                        errorContainer.textContent = result.message || 'Ocurrió un error.';
                        errorContainer.style.display = 'block';
                    }
                } catch (error) {
                    errorContainer.textContent = 'Error de conexión.';
                    errorContainer.style.display = 'block';
                }
            });
        }
        
        const groupAccessCodeInput = document.getElementById('group-access-code');
        if (groupAccessCodeInput) {
            groupAccessCodeInput.addEventListener('input', (e) => {
                const input = e.target;
                let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                let formattedValue = '';
                if (value.length > 0) {
                    formattedValue = value.match(/.{1,4}/g).join('-');
                }
                input.value = formattedValue;
            });
        }

        document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const parentItem = e.target.closest('.profile-card-item');
                if (parentItem && parentItem.dataset.preferenceField) {
                    const field = parentItem.dataset.preferenceField;
                    const value = e.target.checked;
                    handlePreferenceUpdate(field, value);
                }
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
                    generalContentTop.classList.toggle('shadow', section.scrollTop > 0);
                }
            });
        });

        if (openUpdatePasswordModalButton) {
            openUpdatePasswordModalButton.addEventListener('click', () => openAccountActionModal('updatePassword'));
        }
        if (openDeleteAccountModalButton) {
            openDeleteAccountModalButton.addEventListener('click', () => openAccountActionModal('deleteAccount'));
        }
        closeAccountActionModalButtons.forEach(button => {
            button.addEventListener('click', closeAccountActionModal);
        });

        if (confirmCurrentPasswordButton) {
            confirmCurrentPasswordButton.addEventListener('click', showNewPasswordPane);
        }

        if (saveNewPasswordButton) {
            saveNewPasswordButton.addEventListener('click', saveNewPassword);
        }

        if (confirmDeleteAccountButton) {
            confirmDeleteAccountButton.addEventListener('click', handleDeleteAccount);
        }

        if (toggleSectionHomeButton) {
            toggleSectionHomeButton.addEventListener('click', () => {
                if (!isSectionHomeActive) handleNavigationChange('home');
            });
        }
        
        if (toggleSectionExploreButtons) {
            toggleSectionExploreButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (!isSectionExploreActive) handleNavigationChange('explore');
                });
            });
        }
        
        if (toggleSectionSettingsButton) {
            toggleSectionSettingsButton.addEventListener('click', () => {
                if (!isSectionSettingsActive || !isSectionProfileActive) {
                    handleNavigationChange('settings', 'profile');
                }
                closeMenuOptions();
            });
        }
        if (toggleSectionHelpButton) {
            toggleSectionHelpButton.addEventListener('click', () => {
                if (!isSectionHelpActive || !isSectionPrivacyActive) {
                    handleNavigationChange('help', 'privacy');
                }
                closeMenuOptions();
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                if (logoutButton.classList.contains('loading')) return;

                logoutButton.classList.add('loading');

                const loaderIconContainer = document.createElement('div');
                loaderIconContainer.className = 'menu-link-icon';
                
                const loader = document.createElement('div');
                loader.className = 'loader';
                
                loaderIconContainer.appendChild(loader);
                logoutButton.appendChild(loaderIconContainer);

                const backendLogoutUrl = window.PROJECT_CONFIG.baseUrl.replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/logout.php');
                const csrfToken = window.PROJECT_CONFIG.csrfToken;
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = backendLogoutUrl;
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
                document.body.appendChild(form);
                form.submit();
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

                if (moduleOptionsIsOpen) {
                    if (window.innerWidth <= 468 && e.target === moduleOptions) {
                        closeMenuOptions();
                    }
                    else if (window.innerWidth > 468 && !moduleOptions.contains(e.target) && !toggleOptionsButton.contains(e.target)) {
                        closeMenuOptions();
                    }
                }

                const activeSelector = document.querySelector('[data-module="moduleSelector"].active');
                if (activeSelector) {
                    const selectorButton = document.querySelector(`[aria-controls="${activeSelector.id}"]`);
                    if (selectorButton && !selectorButton.contains(e.target) && !activeSelector.contains(e.target)) {
                        closeAllSelectors();
                    }
                }

                if (moduleSurface.classList.contains('active') && !moduleSurface.contains(e.target) && !toggleSurfaceButton.contains(e.target)) {
                    closeMenuSurface();
                }

                if (accountActionModal.classList.contains('active') && e.target === accountActionModal) {
                    closeAccountActionModal();
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
        
        themeMediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    const initializePageData = () => {
        const initialState = getCurrentUrlState();
        if (initialState) {
            if (initialState.section === 'home') {
                loadHomeContent();
            }
            if (initialState.section === 'settings' && initialState.subsection === 'login') {
                loadAccountDates();
            }
            if (initialState.section === 'explore') {
                loadMunicipalityGroups();
                loadUniversityGroups(currentUniversityFilter);
                populateMunicipalityFilter();
            }
        }
        initializePreferenceControls();
    };


    setupEventListeners();
    initializePageData();

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