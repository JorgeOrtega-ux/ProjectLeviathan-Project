<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crea una cuenta - ProjectLeviathan</title>
    
    <link rel="stylesheet" href="../assets/css/styles.css">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
</head>
<body>

    <div class="page-wrapper">
        <header class="page-header">
            <a href="#" class="logo-link">
                <svg width="32" height="32" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.633 20.499C35.633 28.937 28.87 35.699 20.432 35.699C11.995 35.699 5.232 28.937 5.232 20.499C5.232 12.061 11.995 5.299 20.432 5.299C28.87 5.299 35.633 12.061 35.633 20.499Z" fill="#000000"></path></svg>
            </a>
        </header>

        <main class="main-container">
            <section class="content-wrapper">
                <form id="register-form" action="#" method="POST" novalidate>
                    
                    <div class="register-stage active" id="stage-1">
                        <h1>Crea una cuenta</h1>
                        <div class="input-wrapper">
                            <input class="input-field" type="email" id="email" name="email" required placeholder=" " maxlength="126">
                            <label class="input-label" for="email">Dirección de correo electrónico*</label>
                        </div>
                        <div class="input-wrapper">
                            <input class="input-field" type="password" id="password" name="password" required placeholder=" " minlength="8" maxlength="30">
                            <label class="input-label" for="password">Contraseña*</label>
                            <span class="material-symbols-rounded" id="toggle-password">visibility</span>
                        </div>
                        <button type="button" class="continue-btn" data-next-stage="2">Continuar</button>
                    </div>

                    <div class="register-stage disabled" id="stage-2">
                        <h1>Completa tu perfil</h1>
                        <div class="input-wrapper">
                            <input class="input-field" type="text" id="username" name="username" required placeholder=" " minlength="4" maxlength="25">
                            <label class="input-label" for="username">Nombre de usuario*</label>
                        </div>
                        <div class="input-wrapper">
                            <label class="input-label static" for="phone">Número de teléfono*</label>
                            <div class="phone-group" id="phone-group">
                                <div class="country-selector" id="country-selector" tabindex="0">
                                    <span class="country-code" id="selected-code">+52</span>
                                    <span class="material-symbols-rounded">arrow_drop_down</span>
                                </div>
                                <input class="input-field phone-field" type="tel" id="phone" name="phone" required placeholder=" " minlength="10" maxlength="10">
                            </div>
                            <div class="module-content country-selector-module disabled" id="country-dropdown">
                                <div class="menu-content">
                                    <div class="menu-body">
                                        <div class="menu-list">
                                            <div class="menu-link" data-code="+52">
                                                <div class="menu-link-icon"><span class="material-symbols-rounded">public</span></div>
                                                <div class="menu-link-text"><span>México</span></div>
                                            </div>
                                            <div class="menu-link" data-code="+1">
                                                <div class="menu-link-icon"><span class="material-symbols-rounded">public</span></div>
                                                <div class="menu-link-text"><span>Estados Unidos</span></div>
                                            </div>
                                            <div class="menu-link" data-code="+1">
                                                <div class="menu-link-icon"><span class="material-symbols-rounded">public</span></div>
                                                <div class="menu-link-text"><span>Canadá</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" id="country_code" name="country_code" value="+52">
                        </div>
                        <button type="button" class="continue-btn" data-next-stage="3">Continuar</button>
                    </div>

                    <div class="register-stage disabled" id="stage-3">
                        <h1>Último paso</h1>
                        <p class="verification-text">
                            Te hemos enviado un código de verificación a tu teléfono. Por favor, ingrésalo para finalizar.
                        </p>
                        <div class="input-wrapper">
                            <input class="input-field" type="text" id="verification_code" name="verification_code" required placeholder=" " minlength="6" maxlength="6">
                            <label class="input-label" for="verification_code">Código de verificación*</label>
                        </div>
                        <button type="submit" class="continue-btn">Finalizar registro</button>
                    </div>
                    
                    <div class="error-container disabled" id="error-container">
                        <span class="error-message" id="error-text"></span>
                    </div>
                </form>

                <p class="other-page-link">
                    ¿Ya tienes una cuenta? <a href="../login/">Inicia sesión</a>
                </p>
            </section>
        </main>

        <footer class="page-footer">
            <a href="#">Términos de uso</a>
            <span class="separator">|</span>
            <a href="#">Política de privacidad</a>
        </footer>
    </div>
    
    <script src="assets/js/main.js"></script>

</body>
</html>