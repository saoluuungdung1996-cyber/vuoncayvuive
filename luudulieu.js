/*
    =================================================================
    FILE: luudulieu.js
    MÔ TẢ: Quản lý việc tự động lưu dữ liệu người chơi lên Firebase.
    =================================================================
*/

// Biến toàn cục để quản lý bộ đếm thời gian, cho phép các file khác truy cập
let autoSaveInterval = null;
const AUTO_SAVE_INTERVAL_MS = 30 * 1000; // 30 giây

/**
 * Bắt đầu quá trình tự động lưu dữ liệu.
 * Hàm này nên được gọi sau khi người chơi đăng nhập thành công.
 */
window.startAutoSave = function() {
    // Dừng lại nếu đã có một tiến trình đang chạy để tránh trùng lặp
    if (autoSaveInterval) {
        console.warn("Tiến trình tự động lưu đã chạy rồi.");
        return;
    }
    
    console.log(`Bắt đầu tự động lưu dữ liệu mỗi ${AUTO_SAVE_INTERVAL_MS / 1000} giây.`);

    autoSaveInterval = setInterval(async () => {
    const user = auth.currentUser;
    if (!user) {
        console.log("Không có người dùng, dừng tự động lưu.");
        stopAutoSave();
        return;
    }

    // Chỉ lưu nếu dữ liệu đã bị thay đổi (isDataDirty === true)
    if (isDataDirty) {
        try {
            if (typeof savePlayerData === 'function') {
                await savePlayerData();
                console.log("Tự động lưu thành công (dữ liệu đã thay đổi)!");
                isDataDirty = false; // Quan trọng: Hạ cờ xuống sau khi đã lưu thành công
            }
        } catch (error) {
            console.error("Tự động lưu thất bại:", error);
            // Nếu lưu thất bại, không hạ cờ để thử lại ở lần sau
        }
    } else {
        // console.log("Bỏ qua tự động lưu (dữ liệu không thay đổi)."); // Có thể bỏ comment để debug
    }
}, AUTO_SAVE_INTERVAL_MS);
};

/**
 * Dừng quá trình tự động lưu dữ liệu.
 * Hàm này nên được gọi khi người chơi đăng xuất.
 */
window.stopAutoSave = function() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null; // Reset biến
        console.log("Đã dừng tiến trình tự động lưu dữ liệu.");
    }
};