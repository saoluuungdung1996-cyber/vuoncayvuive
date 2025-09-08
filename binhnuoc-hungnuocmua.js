/* START OF FILE JS/binhnuoc-hungnuocmua.js */

// Biến toàn cục để quản lý bộ đếm thời gian
let rainCollectionInterval = null;
let waterEvaporationInterval = null; // Biến cho hiệu ứng bay hơi nước
/**
 * Bắt đầu quá trình hứng nước mưa.
 */
function startRainwaterCollection() {
    // Kiểm tra các điều kiện cần thiết
    if (rainCollectionInterval) {
        console.log("Đã đang trong quá trình hứng nước mưa.");
        return;
    }
    const wateringCan = playerData.inventory.tools['binh-tuoi'];
    if (!wateringCan || wateringCan.currentWater >= allGameItems['binh-tuoi'].maxWater) {
        showGeneralNotification("Bình tưới của bạn đã đầy!", 'warning');
        return;
    }

    console.log("Bắt đầu hứng nước mưa...");

    // 1. Cập nhật trạng thái người chơi
    playerData.rainCollection = { active: true };

    // 2. Tạo và hiển thị icon trên màn hình
    const iconContainer = document.createElement('div');
    iconContainer.id = 'rain-collector-icon-container';
    iconContainer.className = 'rain-collector-icon-container';
    iconContainer.innerHTML = `
        <img src="Pics/binhtuoi-hungnuocmua.png" alt="Đang hứng nước mưa">
        <div class="rain-collector-popup">
            <p id="collected-water-amount">Đã hứng: 0.0 L</p>
            <button id="stop-collecting-rain-btn">Dừng hứng</button>
        </div>
    `;
    document.body.appendChild(iconContainer);
    
    // Gán sự kiện cho icon và nút Dừng
    iconContainer.addEventListener('click', toggleRainCollectorPopup);
    document.getElementById('stop-collecting-rain-btn').addEventListener('click', stopRainwaterCollection);

    // 3. Bắt đầu bộ đếm thời gian
    rainCollectionInterval = setInterval(() => {
         // Chỉ hứng nước nếu trời còn mưa/bão
        const isRaining = playerData.weather.current === 'mua' || playerData.weather.current === 'bao';
        if (!isRaining) {
            return; // Nếu trời không mưa, không cộng thêm nước
        }
        const can = playerData.inventory.tools['binh-tuoi'];
        const canInfo = allGameItems['binh-tuoi'];

        // Nếu bình đầy, tự động dừng
        if (can.currentWater >= canInfo.maxWater) {
            showGeneralNotification("Bình tưới đã đầy, tự động dừng hứng nước.", 'success');
            stopRainwaterCollection();
            return;
        }

        // Cộng nước
        can.currentWater = Math.min(canInfo.maxWater, can.currentWater + 0.1);
        console.log(`Đã hứng thêm 0.1L nước mưa. Tổng cộng: ${can.currentWater.toFixed(1)}L`);

        // Cập nhật popup nếu đang hiển thị
        const popup = document.querySelector('.rain-collector-popup');
        if (popup && popup.classList.contains('visible')) {
            document.getElementById('collected-water-amount').textContent = `Đã hứng: ${can.currentWater.toFixed(1)} L`;
        }

    }, 10000); // 10000ms = 10 giây
      // Bộ đếm này sẽ chạy 1 phút/lần
    waterEvaporationInterval = setInterval(() => {
        const isRaining = playerData.weather.current === 'mua' || playerData.weather.current === 'bao';
        
        // Chỉ bay hơi nếu trời KHÔNG mưa/bão
        if (!isRaining) {
            const can = playerData.inventory.tools['binh-tuoi'];
            if (can.currentWater > 0) {
                can.currentWater = Math.max(0, can.currentWater - 0.1); // Trừ 0.1L
                console.log(`Nước đã bay hơi 0.1L. Trong bình còn: ${can.currentWater.toFixed(1)}L`);
                showGeneralNotification(`Nước trong bình hứng đã bay hơi 0.1L!`, 'warning', 3000);

                // Cập nhật popup nếu đang mở
                 const popup = document.querySelector('.rain-collector-popup');
                if (popup && popup.classList.contains('visible')) {
                    document.getElementById('collected-water-amount').textContent = `Trong bình: ${can.currentWater.toFixed(1)} L`;
                }
            }
        }
    }, 60000); // 60000ms = 1 phút
}

/**
 * Dừng quá trình hứng nước mưa.
 */
function stopRainwaterCollection() {
      // Dừng cả hai bộ đếm thời gian
    if (rainCollectionInterval) {
        clearInterval(rainCollectionInterval);
        rainCollectionInterval = null;
    }
    if (waterEvaporationInterval) {
        clearInterval(waterEvaporationInterval);
        waterEvaporationInterval = null;
    }

    console.log("Đã dừng hứng nước mưa.");

    // 1. Dừng bộ đếm thời gian
    clearInterval(rainCollectionInterval);
    rainCollectionInterval = null;

    // 2. Cập nhật trạng thái người chơi
    if (playerData.rainCollection) {
        delete playerData.rainCollection;
    }

    // 3. Xóa icon và popup khỏi giao diện
    const iconContainer = document.getElementById('rain-collector-icon-container');
    if (iconContainer) {
        iconContainer.remove();
    }
    
    // 4. Cập nhật lại giao diện kho đồ nếu đang mở
    if (document.getElementById('inventory-modal').style.display === 'block') {
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    }
}

/**
 * Hiển thị/ẩn popup thông tin hứng nước.
 */
function toggleRainCollectorPopup() {
    const popup = document.querySelector('.rain-collector-popup');
    if (!popup) return;

    // Cập nhật số nước trước khi hiển thị
    const currentWater = playerData.inventory.tools['binh-tuoi'].currentWater;
    document.getElementById('collected-water-amount').textContent = `Trong bình: ${currentWater.toFixed(1)} L`;
    
    popup.classList.toggle('visible');
}

/**
 * Kiểm tra và khôi phục trạng thái hứng nước khi người chơi đăng nhập.
 */
window.checkAndRestoreRainCollection = function() {
    if (playerData && playerData.rainCollection && playerData.rainCollection.active) {
        console.log("Phát hiện trạng thái đang hứng nước mưa, tiến hành khôi phục.");
        startRainwaterCollection();
    }
}

/* END OF FILE JS/binhnuoc-hungnuocmua.js */