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
                <svg width="135" height="32" viewBox="25 25 160 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="M40.0442 48.6437C35.3358 48.6437 32.062 45.0757 32.062 40.1465C32.062 35.2175 35.3358 31.6493 39.9708 31.6493C43.3548 31.6493 45.9666 33.6357 46.739 36.0635H51.9992C51.0796 30.7665 46.1136 26.9043 39.8972 26.9043C32.43 26.9043 26.949 32.8265 26.949 40.1465C26.949 47.4667 32.2828 53.3889 39.934 53.3889C46.2608 53.3889 51.1164 49.6001 52.1096 44.2297H46.8862C46.0034 46.6943 43.4284 48.6437 40.0442 48.6437Z" fill="black"></path>
                        <path d="M65.0217 34.2615C62.5939 34.2615 60.6811 35.3283 59.6143 36.7997V27.2725H54.8323V53.0217H59.6143V43.1267C59.6143 40.2575 61.1593 38.3815 63.6605 38.3815C65.9413 38.3815 67.2287 40.1471 67.2287 42.6117V53.0217H72.0107V41.8391C72.0107 37.2779 69.2151 34.2615 65.0217 34.2615Z" fill="black"></path>
                        <path d="M91.6165 41.0289C91.6165 36.8355 88.7473 34.2607 83.4503 34.2607C79.1099 34.2607 75.6521 36.6885 75.0635 40.2197H79.8823C80.2501 39.0059 81.5743 38.0495 83.4135 38.0495C85.8045 38.0495 86.9449 39.3001 86.9449 41.4703V41.5807L82.2733 41.9853C77.3809 42.3899 74.6589 44.3763 74.6589 48.1283C74.6589 51.2919 77.3809 53.3885 81.1697 53.3885C83.7079 53.3885 86.1725 52.3953 87.2023 50.7401C87.2023 51.5493 87.2759 52.2849 87.4231 53.0207H91.8739C91.6901 51.8435 91.6165 50.4825 91.6165 48.9009V41.0289ZM86.9449 45.4063C86.9449 47.5765 85.3263 49.7837 82.0525 49.7837C80.2869 49.7837 79.3305 48.9377 79.3305 47.6869C79.3305 46.3259 80.2501 45.4799 82.3101 45.2959L86.9449 44.8913V45.4063Z" fill="black"></path>
                        <path d="M101.659 28.6719H96.8766V34.6311H93.051V38.4935H96.8766V47.5423C96.8766 51.0369 98.679 53.0233 102.541 53.0233H106.367V49.0505H103.939C102.321 49.0505 101.659 48.4987 101.659 46.9907V38.4935H106.367V34.6311H101.659V28.6719Z" fill="black"></path>
                        <path d="M130.128 39.2637H121.889V43.3837H128.915C128.436 46.8045 125.236 48.8645 121.668 48.8645C116.518 48.8645 113.502 45.0757 113.502 40.1465C113.502 35.2175 116.886 31.6127 121.521 31.6127C124.684 31.6127 127.259 33.4519 127.921 35.5117H133.182C132.188 30.3987 127.48 26.9043 121.447 26.9043C114.017 26.9043 108.499 32.9001 108.499 40.1833C108.499 47.4667 113.575 53.3889 121.153 53.3889C124.611 53.3889 127.737 51.8441 129.135 49.7473V53.0211H133.402V42.5375C133.402 40.4409 132.225 39.2637 130.128 39.2637Z" fill="black"></path>
                        <path d="M148.595 27.2725H137.192V53.0217H142.047V43.3473H148.632C153.708 43.3473 157.313 40.3677 157.313 35.3651C157.313 30.3625 153.708 27.2725 148.595 27.2725ZM148.264 39.0803H142.047V31.6867H148.264C150.765 31.6867 152.384 33.1213 152.384 35.3651C152.384 37.6089 150.765 39.0803 148.264 39.0803Z" fill="black"></path>
                        <path d="M158.526 27.2725V31.6867H167.318V53.0217H172.173V31.6867H181.001V27.2725H158.526Z" fill="black"></path>
                    </g>
                </svg>
            </a>
        </header>

        <main class="main-container">
            <section class="content-wrapper">
                <form id="register-form" method="POST" novalidate>
                    
                    <input type="hidden" id="csrf_token" name="csrf_token" value="">

                    <div class="register-stage active" id="stage-1">
                        <h1>Crea una cuenta</h1>
                        <p class="form-subtitle">Usa tu correo y contraseña para empezar.</p>
                        <div class="input-wrapper">
                            <input class="input-field" type="email" id="email" name="email" required placeholder=" " maxlength="126">
                            <label class="input-label" for="email">Dirección de correo electrónico*</label>
                        </div>
                        <div class="input-wrapper">
                            <input class="input-field" type="password" id="password" name="password" required placeholder=" " minlength="8" maxlength="30">
                            <label class="input-label" for="password">Contraseña*</label>
                            <span class="material-symbols-rounded" id="toggle-password">visibility</span>
                        </div>
                        <button type="button" class="continue-btn" data-action="next-stage">
                            <span>Continuar</span>
                        </button>
                    </div>

                    <div class="register-stage disabled" id="stage-2">
                        <h1>Completa tu perfil</h1>
                        <p class="form-subtitle">Solo necesitamos unos datos más.</p>
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
                        <button type="button" class="continue-btn" data-action="submit-register">
                            <span>Finalizar registro</span>
                        </button>
                    </div>

                    <div class="register-stage disabled" id="stage-3">
                        <h1>Último paso</h1>
                        <p class="verification-text">
                            Hemos guardado tu código en la base de datos. Búscalo e ingrésalo aquí para verificar tu cuenta.
                        </p>
                        <div class="input-wrapper">
                            <input class="input-field" type="text" id="verification_code" name="verification_code" required placeholder=" " minlength="6" maxlength="6">
                            <label class="input-label" for="verification_code">Código de verificación*</label>
                        </div>
                        <button type="button" class="continue-btn" data-action="submit-verification">
                            <span>Verificar cuenta</span>
                        </button>
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