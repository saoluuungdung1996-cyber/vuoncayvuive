/* START OF FILE JS/modal-month.js */

// Mảng tên các tháng để hiển thị đẹp hơn
const monthNames = ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"];
let monthModalWeatherInterval = null; // Biến để quản lý bộ đếm thời gian của modal

// Hàm tạo cấu trúc HTML của modal (chỉ chạy 1 lần)
function createMonthModal() {
    if (document.getElementById('month-modal-overlay')) {
        return; // Không tạo lại nếu đã có
    }

    const modalHTML = `
        <div id="month-modal-overlay" class="month-modal-overlay">
            <div class="month-modal-content">
                <span class="month-modal-close">×</span>
                <h2>Lịch Nông Vụ</h2>
                <span id="month-display">Tháng 1</span>
                <span id="month-name-display">Tháng Một</span>
                 <!-- Phần hiển thị thời tiết trong modal -->
                <div class="month-modal-weather">
                    <img id="modal-weather-icon" src="Pics/Thoitiet/nangnhe.png" alt="Thời tiết">
                    <span id="modal-weather-name">Nắng nhẹ</span>

                     <!-- Thêm thanh đếm ngược vào đây -->
                    <div class="month-modal-weather-timer-container">
                        <div id="modal-weather-timer-bar"></div>
                        <span id="modal-weather-timer-text">00:00</span>
                    </div>



                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Gán sự kiện cho các phần tử vừa tạo
    const overlay = document.getElementById('month-modal-overlay');
    const closeBtn = overlay.querySelector('.month-modal-close');

    closeBtn.addEventListener('click', hideMonthModal);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            hideMonthModal();
        }
    });
}

// Hàm ẩn modal
function hideMonthModal() {
    const overlay = document.getElementById('month-modal-overlay');
    if (overlay) {
        overlay.classList.remove('visible');

    }
     // Dừng bộ đếm thời gian khi modal được đóng lại
    if (monthModalWeatherInterval) {
        clearInterval(monthModalWeatherInterval);
        monthModalWeatherInterval = null;
    }
}

// Hàm hiển thị modal (hàm này sẽ được gọi từ file khác)
function showMonthModal() {
    createMonthModal(); // Đảm bảo modal đã tồn tại

    const monthDisplay = document.getElementById('month-display');
    const monthNameDisplay = document.getElementById('month-name-display');
    const overlay = document.getElementById('month-modal-overlay');

    // 1. Lấy thời gian từ server Firebase
    const serverTimestamp = firebase.firestore.Timestamp.now();
    const currentDate = serverTimestamp.toDate();
    const realHour = currentDate.getHours();

    // 2. Tính toán tháng trong game
    let inGameMonth = realHour % 12;
    if (inGameMonth === 0) inGameMonth = 12;

    // 3. Cập nhật nội dung tháng và mùa
    if (monthDisplay && monthNameDisplay) {
        monthDisplay.textContent = `Tháng ${inGameMonth}`;
        let seasonName = '';
        if (inGameMonth >= 1 && inGameMonth <= 3) seasonName = "Mùa xuân";
        else if (inGameMonth >= 4 && inGameMonth <= 5) seasonName = "Xuân hạ";
        else if (inGameMonth >= 6 && inGameMonth <= 7) seasonName = "Mùa hè";
        else if (inGameMonth >= 8 && inGameMonth <= 9) seasonName = "Thu hạ";
        else if (inGameMonth >= 10 && inGameMonth <= 11) seasonName = "Thu đông";
        else seasonName = "Mùa đông";
        monthNameDisplay.textContent = seasonName;
    }

    // 4. Lấy các phần tử DOM của thời tiết trong modal
    const modalWeatherIcon = document.getElementById('modal-weather-icon');
    const modalWeatherName = document.getElementById('modal-weather-name');
    const timerBarEl = document.getElementById('modal-weather-timer-bar');
    const timerTextEl = document.getElementById('modal-weather-timer-text');
    const WEATHER_DURATION_MS = 5 * 60 * 1000;

    // Biến để theo dõi thời tiết đã hiển thị, tránh cập nhật DOM không cần thiết
    let lastDisplayedWeatherId = null;

    // 5. Bắt đầu bộ đếm thời gian cho thời tiết VÀ đồng bộ giao diện
    if (monthModalWeatherInterval) clearInterval(monthModalWeatherInterval);

    const updateTimerAndDisplay = () => {
        if (!playerData.weather || !timerBarEl || !timerTextEl) {
            clearInterval(monthModalWeatherInterval);
            return;
        }

        // --- PHẦN ĐỒNG BỘ GIAO DIỆN MỚI ---
        // Lấy trạng thái thời tiết hiện tại từ hệ thống chính
        const currentWeatherId = playerData.weather.current;
        
        // Chỉ cập nhật DOM nếu thời tiết đã thay đổi
        if (currentWeatherId !== lastDisplayedWeatherId) {
            console.log(`Modal đồng bộ thời tiết: ${lastDisplayedWeatherId} -> ${currentWeatherId}`);
            const weatherInfo = window.getCurrentWeatherInfo();
            if (weatherInfo && modalWeatherIcon && modalWeatherName) {
                modalWeatherIcon.src = weatherInfo.icon;
                modalWeatherName.textContent = weatherInfo.name;
                lastDisplayedWeatherId = currentWeatherId; // Cập nhật trạng thái đã hiển thị
            }
        }

        // --- PHẦN CẬP NHẬT TIMER (như cũ) ---
        const remainingMs = playerData.weather.nextChangeTime - Date.now();
        if (remainingMs <= 0) {
            timerBarEl.style.width = '0%';
            timerTextEl.textContent = 'Đang đổi...';
            // Không dừng interval, để nó có thể bắt được thời tiết mới ở giây tiếp theo
            return;
        }

        const progress = (remainingMs / WEATHER_DURATION_MS) * 100;
        timerBarEl.style.width = `${progress}%`;

        const remainingSeconds = Math.floor((remainingMs / 1000) % 60);
        const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
        timerTextEl.textContent = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    updateTimerAndDisplay(); // Gọi ngay 1 lần để hiển thị
    monthModalWeatherInterval = setInterval(updateTimerAndDisplay, 1000); // Cập nhật mỗi giây

    // 6. Hiển thị modal
    if (overlay) {
        overlay.classList.add('visible');
    }
}

/* END OF FILE JS/modal-month.js */