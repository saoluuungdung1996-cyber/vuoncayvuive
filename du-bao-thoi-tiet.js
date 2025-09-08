/* START OF FILE JS/du-bao-thoi-tiet.js - PHIÊN BẢN HOÀN CHỈNH */

document.addEventListener('DOMContentLoaded', () => {
    let forecastCountdownInterval = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createWeatherForecastModal() {
        if (document.getElementById('forecast-modal-overlay')) return;

        const modalHTML = `
        <div id="forecast-modal-overlay" class="forecast-modal-overlay">
            <div class="forecast-modal-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="forecast-close-button">
                
                <!-- Khu vực header mới với nhân vật -->
                <div class="forecast-header">
                    <img src="Pics/nguoidanchuongtrinh.png" alt="Dự báo viên" class="forecast-character">
                    <h2>Bảng Tin Thời Tiết</h2>
                </div>
                
                <!-- Hộp cảnh báo/lời khuyên -->
                <div id="forecast-advice" class="forecast-advice" style="display: none;"></div>

                <div id="forecast-grid" class="forecast-grid">
                    <!-- Nội dung dự báo sẽ được chèn vào đây -->
                </div>
                <div id="forecast-cooldown-message" class="forecast-cooldown-message">
                    <!-- Thông báo thời gian chờ -->
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('forecast-modal-overlay');
        const closeBtn = modal.querySelector('.forecast-close-button');
        closeBtn.addEventListener('click', hideWeatherForecastModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideWeatherForecastModal();
        });
    }

    // Hàm ẩn modal
    function hideWeatherForecastModal() {
        const modal = document.getElementById('forecast-modal-overlay');
        if (modal) modal.classList.remove('visible');
        if (forecastCountdownInterval) {
            clearInterval(forecastCountdownInterval);
            forecastCountdownInterval = null;
        }
    }

    // Hàm hiển thị modal (hàm chính)
    window.showWeatherForecastModal = () => {
        createWeatherForecastModal();
        const modal = document.getElementById('forecast-modal-overlay');
        const grid = document.getElementById('forecast-grid');
        const cooldownMsg = document.getElementById('forecast-cooldown-message');
        
        grid.style.display = 'flex'; // Chuyển sang flex để cuộn ngang
        cooldownMsg.style.display = 'none';
        grid.innerHTML = ''; // Xóa dự báo cũ

        // Logic hiển thị Cảnh báo & Lời khuyên
        const adviceBox = document.getElementById('forecast-advice');
        const nextWeather = playerData.weather.upcoming[0]; // Lấy thời tiết sắp tới đầu tiên

        if (nextWeather === 'bao') {
            adviceBox.innerHTML = '⚠️ **Bão sắp tới!** Hãy thu hoạch những cây đã chín và chuẩn bị cho cơn bão!';
            adviceBox.style.display = 'block';
        } else if (nextWeather === 'nanggat') {
            adviceBox.innerHTML = '☀️ **Nắng gắt kéo dài!** Đừng quên tích trữ nước để tưới cho cây trồng nhé.';
            adviceBox.style.display = 'block';
        } else {
            adviceBox.style.display = 'none'; // Ẩn nếu không có cảnh báo đặc biệt
        }

        // --- Render thẻ THỜI TIẾT HIỆN TẠI ---
        const currentWeatherId = playerData.weather.current;
        const currentInfo = weatherData[currentWeatherId] || weatherData.nangnhe;
        let currentPeriodHTML = `
            <div class="forecast-period">
                <h3>Hiện tại</h3>
                <img src="${currentInfo.icon}" alt="${currentInfo.name}">
                <p>${currentInfo.name}</p>
                <div class="forecast-timer" id="forecast-current-timer">--:--</div>
            </div>`;
        grid.innerHTML += currentPeriodHTML;

        // --- Chuẩn bị dữ liệu cho 6 đợt thời tiết tiếp theo ---
        let trueForecasts = [...playerData.weather.upcoming]; // Bắt đầu với 2 cái đã biết
        // Tạo thêm 4 dự báo nữa để có đủ 6
        for (let i = 0; i < 4; i++) {
            trueForecasts.push(determineNextWeather());
        }

        // --- Xử lý logic dự báo và độ chính xác giảm dần ---
        const accuracyLevels = [100, 100, 90, 80, 70, 60]; // Độ chính xác cho 6 đợt
        const WEATHER_DURATION_MS = 5 * 60 * 1000;

        trueForecasts.forEach((trueWeather, index) => {
            let forecastedWeather = trueWeather;
            const accuracy = accuracyLevels[index];

            // Áp dụng tỷ lệ sai số
            if (Math.random() * 100 > accuracy) {
                do {
                    forecastedWeather = determineNextWeather();
                } while (forecastedWeather === trueWeather); // Đảm bảo dự báo sai khác với sự thật
                console.log(`Dự báo cho đợt ${index + 1} đã sai! (Độ chính xác: ${accuracy}%)`);
            }

            // Lấy thông tin hiển thị (tên, icon)
            const forecastInfo = weatherData[forecastedWeather];
            
            // Tính toán thời gian bắt đầu
            const startTime = new Date(playerData.weather.nextChangeTime + (index * WEATHER_DURATION_MS));
            const startHours = String(startTime.getHours()).padStart(2, '0');
            const startMinutes = String(startTime.getMinutes()).padStart(2, '0');
            const timeString = `Bắt đầu lúc: ${startHours}:${startMinutes}`;
            
            // Quyết định tiêu đề cho thẻ
            let title = `Tiếp theo`;
            if (index === 0) title = 'Sắp tới';
            else if (index > 0) title = `Tiếp theo (+${(index + 1) * 5} phút)`;

            // Tạo class CSS dựa trên độ chính xác để có hiệu ứng hình ảnh
            const accuracyClass = `accuracy-${accuracy}`;

            // Render thẻ HTML
            grid.innerHTML += `
                <div class="forecast-period ${accuracyClass}">
                    <h3>${title}</h3>
                    <img src="${forecastInfo.icon}" alt="${forecastInfo.name}">
                    <p>${forecastInfo.name}</p>
                    <div class="forecast-timer">${timeString}</div>
                    <div class="forecast-accuracy">Chính xác: ${accuracy}%</div>
                </div>`;
        });
        
        // Bắt đầu đếm ngược cho thời tiết hiện tại
        startCountdownTimer();
        modal.classList.add('visible');
    };

    function startCountdownTimer() {
        if (forecastCountdownInterval) clearInterval(forecastCountdownInterval);

        const timerEl = document.getElementById('forecast-current-timer');
        if (!timerEl) return; // Thêm kiểm tra an toàn
        
        forecastCountdownInterval = setInterval(() => {
            const remainingMs = playerData.weather.nextChangeTime - Date.now();
            if (remainingMs <= 0) {
                timerEl.textContent = "Đang đổi...";
                clearInterval(forecastCountdownInterval);
                // Tự đóng modal sau 2 giây để người chơi xem lại
                setTimeout(hideWeatherForecastModal, 2000);
                return;
            }
            const minutes = Math.floor((remainingMs / 60000));
            const seconds = Math.floor((remainingMs % 60000) / 1000);
            timerEl.textContent = `Còn lại: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
});

/* END OF FILE JS/du-bao-thoi-tiet.js */