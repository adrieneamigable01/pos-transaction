<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=0">
    <title><?php echo $title; ?> - Don POS System</title>

    <link href="../vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">

    <link href="../assets/css/sb-admin-2.css" rel="stylesheet">
    <link href="../assets/css/loader.css" rel="stylesheet">

    <style>
        :root {
            --primary-dark: #1a1c1e;
            --accent-blue: #4e73df;
            --soft-bg: #f3f4f6;
            --border-muted: #e5e7eb;
            --pos-success: #22c55e;
        }

        /* Base Layout */
        body {
            background-color: var(--soft-bg) !important;
            font-family: 'Inter', sans-serif !important;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden; /* Prevents bounce on mobile */
        }

        .login-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Desktop Container */
        .login-container {
            width: 100%;
            max-width: 420px;
            transition: all 0.3s ease;
        }

        .login-card {
            background: #ffffff;
            padding: 3rem 2.5rem;
            border-radius: 24px;
            border: 1px solid var(--border-muted);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
        }

        /* Logo & Typography */
        .brand-logo {
            width: 70px;
            height: 70px;
            background: var(--primary-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            margin: 0 auto 1.2rem;
            color: #fff;
        }

        .brand-logo i { font-size: 1.8rem; }

        h1 {
            font-size: 1.6rem;
            font-weight: 800;
            color: var(--primary-dark);
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }

        .subtitle {
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }

        /* Form Elements */
        .form-label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #374151;
            margin-bottom: 0.6rem;
            display: block;
            text-align: left;
        }

        .modern-input-group {
            position: relative;
            margin-bottom: 1.2rem;
        }

        .modern-input-group i {
            position: absolute;
            left: 1.1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
        }

        .form-control-modern {
            width: 100%;
            padding: 1rem 1rem 1rem 3.2rem;
            background-color: #f9fafb;
            border: 2px solid #f3f4f6;
            border-radius: 14px;
            font-size: 16px; /* Prevents iOS zoom */
            font-weight: 500;
            outline: none;
            transition: all 0.2s;
        }

        .form-control-modern:focus {
            background-color: #fff;
            border-color: var(--accent-blue);
        }

        .btn-modern {
            width: 100%;
            padding: 1.1rem;
            background-color: var(--primary-dark);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 1rem;
        }

        /* TABLET & MOBILE OVERRIDE */
        @media (max-width: 991px) {
            body {
                background-color: #ffffff !important;
            }

            .login-container {
                max-width: 100%;
                height: 100%;
            }

            .login-card {
                height: 100%;
                width: 100%;
                border-radius: 0;
                border: none;
                box-shadow: none;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 2rem;
            }

            .brand-section {
                margin-top: auto;
            }

            form {
                margin-bottom: auto;
            }
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #ecfdf5;
            color: var(--pos-success);
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }
    </style>
</head>

<body>
    <div class="loading">Loading&#8230;</div>

    <div class="login-wrapper">
        <div class="login-container">
            <div class="login-card">
                
                <div class="brand-section">
                    <div class="brand-logo">
                        <i class="fas fa-cash-register"></i>
                    </div>
                    <h1 style="letter-spacing: -1px;">Don POS</h1>
                    <div class="status-badge">System Online</div>
                </div>

                <p class="subtitle">Enter your terminal credentials</p>

                <form id="frm_login">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <div class="modern-input-group">
                            <i class="fas fa-user-shield"></i>
                            <input type="text" class="form-control-modern" id="username" name="username" placeholder="Username" required autocomplete="username">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Access Pin</label>
                        <div class="modern-input-group">
                            <i class="fas fa-key"></i>
                            <input type="password" class="form-control-modern" id="password" name="password" placeholder="••••••••" required autocomplete="current-password">
                        </div>
                    </div>

                    <button type="submit" class="btn-modern">
                        <span>Secure Access</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </form>

                <div class="footer-links mt-4">
                    <a href="forgot-password.html" style="color: #64748b; font-size: 0.85rem; font-weight: 600;">Forgot Credentials?</a>
                    <div class="mt-3">
                        <a href="register.html" style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Register New Terminal</a>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="../vendor/jquery/jquery.min.js"></script>
    <script src="../vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/jquery-validate.js"></script>
    <script src="../assets/js/sweetalert2@7.26.11.js"></script>
    <script src="../assets/js/js-addon.js"></script>
    <script src="../vendor/jquery-easing/jquery.easing.min.js"></script>
    <script src="../assets/js/sb-admin-2.min.js"></script>
    <script src="../assets/js/api_constant.js"></script>
    <script src="../assets/js/auth.js"></script>
</body>

</html>