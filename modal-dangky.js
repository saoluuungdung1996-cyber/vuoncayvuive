document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử của modal đăng ký
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal'); // Cần để quay lại
    const closeRegisterBtn = document.querySelector('.close-register-modal');
    const registerForm = document.getElementById('register-form');
    const captchaTextElem = document.getElementById('captcha-text');

    // Lấy các input và thông báo lỗi
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const captchaInput = document.getElementById('reg-captcha');
    
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const captchaError = document.getElementById('captcha-error');

    // Lấy các icon con mắt
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    let currentCaptcha = '';

    // --- CÁC HÀM HỖ TRỢ ---

    // Hàm tạo mã captcha ngẫu nhiên
    function generateCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentCaptcha = result;
        captchaTextElem.textContent = currentCaptcha;
    }

    // Hàm hiển thị lỗi
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Hàm ẩn lỗi
    function hideError(errorElement) {
        errorElement.style.display = 'none';
    }
    
    // --- CÁC BỘ LẮNG NGHE SỰ KIỆN (EVENT LISTENERS) ---

    // Sự kiện cho các icon xem/ẩn mật khẩu
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
            } else {
                passwordField.type = 'password';
            }
        });
    });

    // Sự kiện đóng modal bằng nút (X)
    closeRegisterBtn.addEventListener('click', function() {
        registerModal.classList.remove('visible');
        setTimeout(() => {
            loginModal.classList.add('visible'); // Hiển thị lại modal đăng nhập
        }, 400); // Khớp với thời gian transition
    });

    // Sự kiện khi người dùng nhấn nút "Đăng ký" (submit form)
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn form tự gửi đi
        let isValid = true;

        // --- VALIDATION (Kiểm tra dữ liệu người dùng nhập) ---
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(emailInput.value)) {
            showError(emailError, 'Định dạng email không hợp lệ.');
            isValid = false;
        } else {
            hideError(emailError);
        }

        const pass = passwordInput.value;
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        if (pass.length < 8 || !hasUpperCase || !hasNumber || !hasSpecialChar) {
            showError(passwordError, 'Mật khẩu phải dài ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt.');
            isValid = false;
        } else {
            hideError(passwordError);
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordError, 'Mật khẩu xác nhận không khớp.');
            isValid = false;
        } else {
            hideError(confirmPasswordError);
        }

        if (captchaInput.value.toLowerCase() !== currentCaptcha.toLowerCase()) {
            showError(captchaError, 'Mã Captcha không đúng.');
            isValid = false;
        } else {
            hideError(captchaError);
        }
        
        // --- XỬ LÝ VỚI FIREBASE ---
        if (isValid) {
            const email = emailInput.value;
            const password = passwordInput.value;

            // Gọi đến Firebase Authentication để tạo người dùng mới
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Đăng ký thành công trên Auth
                    console.log('Đăng ký Auth thành công!', userCredential.user);
                    const user = userCredential.user;

                    // Lưu thông tin bổ sung của người chơi vào Firestore Database
                    // Chúng ta tạo một document mới trong collection 'users' với ID chính là UID của người dùng
                    return db.collection('users').doc(user.uid).set({
                        email: user.email,
                        nickname: "Nông dân",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        money: 100,      // Số tiền khởi điểm
                        level: 1,        // Cấp độ khởi điểm
                        exp: 0           // Kinh nghiệm khởi điểm
                    });
                })
                .then(() => {
                    // Lưu dữ liệu vào Firestore thành công
                    console.log('Tạo dữ liệu người dùng trên Firestore thành công!');
                    alert('Đăng ký tài khoản thành công!');
                    
                    // Đóng modal đăng ký và mở lại modal đăng nhập
                    registerModal.classList.remove('visible');
                    setTimeout(() => {
                        loginModal.classList.add('visible');
                        registerForm.reset(); // Xóa dữ liệu đã nhập trong form
                    }, 200); // Delay ngắn để chuyển modal
                })
                .catch((error) => {
                    // Xử lý các lỗi có thể xảy ra từ Firebase
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Lỗi đăng ký Firebase:", errorCode, errorMessage);
                    
                    if (errorCode === 'auth/email-already-in-use') {
                        showError(emailError, 'Email này đã được sử dụng.');
                    } else if (errorCode === 'auth/weak-password') {
                        showError(passwordError, 'Mật khẩu quá yếu (phải có ít nhất 6 ký tự).');
                    } else {
                        alert('Đã có lỗi xảy ra khi đăng ký: ' + errorMessage);
                    }

                    // Tạo lại captcha mới để người dùng thử lại
                    generateCaptcha();
                    captchaInput.value = '';
                });
        } else {
            // Nếu validation ban đầu thất bại, chỉ cần tạo lại captcha
            generateCaptcha();
            captchaInput.value = '';
        }
    });

    // --- MutationObserver: Tự động làm mới khi modal hiện ra ---
    // Lắng nghe sự thay đổi của modal để làm mới captcha và xóa lỗi cũ
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' && registerModal.classList.contains('visible')) {
                generateCaptcha(); // Tạo captcha mới mỗi khi modal hiện ra
                // Xóa các thông báo lỗi cũ
                hideError(emailError);
                hideError(passwordError);
                hideError(confirmPasswordError);
                hideError(captchaError);
                registerForm.reset();
            }
        });
    });
    observer.observe(registerModal, { attributes: true, attributeFilter: ['class'] });
});