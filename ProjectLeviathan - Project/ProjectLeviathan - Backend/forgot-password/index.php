<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - ProjectLeviathan</title>
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
                </a>
        </header>

        <main class="main-container">
            <section class="content-wrapper">
                <form id="forgot-password-form" method="POST" novalidate>
                    <input type="hidden" id="csrf_token" name="csrf_token" value="">

                    <div class="form-stage active" id="stage-1">
                        <h1>¿Olvidaste tu contraseña?</h1>
                        <p class="form-subtitle">Ingresa tu correo electrónico para buscar tu cuenta.</p>
                        <div class="input-wrapper">
                            <input class="input-field" type="email" id="email" name="email" required placeholder=" " maxlength="126">
                            <label class="input-label" for="email">Dirección de correo electrónico*</label>
                        </div>
                        <button type="button" class="continue-btn" data-action="find-account">Continuar</button>
                    </div>

                    <div class="form-stage disabled" id="stage-2">
                        <h1>Ingresa el código</h1>
                        <p class="form-subtitle">Hemos guardado un código en la base de datos. Búscalo e ingrésalo aquí.</p>
                        <div class="input-wrapper">
                            <input class="input-field" type="text" id="verification_code" name="verification_code" required placeholder=" " minlength="6" maxlength="6">
                            <label class="input-label" for="verification_code">Código de verificación*</label>
                        </div>
                        <button type="button" class="continue-btn" data-action="verify-code">Continuar</button>
                    </div>

                    <div class="form-stage disabled" id="stage-3">
                        <h1>Crea una nueva contraseña</h1>
                        <p class="form-subtitle">Tu nueva contraseña debe ser diferente a las anteriores.</p>
                        <div class="input-wrapper">
                            <input class="input-field" type="password" id="new_password" name="new_password" required placeholder=" " minlength="8" maxlength="30">
                            <label class="input-label" for="new_password">Nueva contraseña*</label>
                        </div>
                        <div class="input-wrapper">
                            <input class="input-field" type="password" id="confirm_password" name="confirm_password" required placeholder=" " minlength="8" maxlength="30">
                            <label class="input-label" for="confirm_password">Confirmar contraseña*</label>
                        </div>
                        <button type="button" class="continue-btn" data-action="reset-password">Restablecer</button>
                    </div>

                    <div class="error-container disabled" id="error-container">
                        <span class="error-message" id="error-text"></span>
                    </div>
                </form>
                
                <p class="other-page-link">
                    <a href="../">Volver a iniciar sesión</a>
                </p>

            </section>
        </main>
        
        <footer class="page-footer">
            <a href="#">Términos de uso</a>
            <span class="separator">|</span>
            <a href="#">Política de privacidad</a>
        </footer>
    </div>
    <script src="../assets/js/forgot_password_js/main.js"></script>
</body>
</html>