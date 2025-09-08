/* START OF FILE JS/modal-cheatcode.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM
    const modal = document.getElementById('cheat-code-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.cheat-code-close-button');
    const confirmBtn = document.getElementById('confirm-cheat-btn');
    const input = document.getElementById('cheat-code-input');

    // Hàm ẩn modal
    function hideCheatCodeModal() {
        modal.classList.remove('visible');
        input.value = ''; // Xóa input khi đóng
    }

    // Hàm hiển thị modal (sẽ được gọi từ nut-menu.js)
    window.showCheatCodeModal = () => {
        modal.classList.add('visible');
        input.focus(); // Tự động trỏ vào ô nhập liệu
    };

    // Gán sự kiện cho các nút
    closeBtn.addEventListener('click', hideCheatCodeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideCheatCodeModal();
        }
    });

    confirmBtn.addEventListener('click', () => {
        const code = input.value.trim().toLowerCase();
        
        if (code === 'khohan') {
            console.log("Cheat 'khohan' activated!");
            
            // Lặp qua tất cả các ô đất đã mở khóa
            for (let i = 1; i <= playerData.stats.unlockedPlots; i++) {
                const plotNumber = String(i);
                
                // Đảm bảo plot có tồn tại trong dữ liệu
                if (!playerData.farmPlots[plotNumber]) {
                    playerData.farmPlots[plotNumber] = {};
                }
                
                // Đặt trạng thái khô hạn
                playerData.farmPlots[plotNumber].isDry = true;
            }
            
            // Render lại tất cả các ô đất để cập nhật hình ảnh
            if(typeof renderAllPlots === 'function') {
                renderAllPlots();
            }

            alert('Cheat activated: Tất cả ô đất đã khô hạn!');
            hideCheatCodeModal();

        }  else if (code.startsWith('thoitiet_')) {
            // Tách lấy ID thời tiết, ví dụ: "thoitiet_mua" -> "mua"
            const weatherId = code.substring('thoitiet_'.length);

            // Kiểm tra xem ID thời tiết có hợp lệ không (có tồn tại trong weatherData ở file gamedata.js không?)
            if (weatherData && weatherData[weatherId]) {
                // Lấy hằng số thời gian từ file weather.js, hoặc định nghĩa lại để chắc chắn
                const WEATHER_DURATION_MS = 5 * 60 * 1000; // 5 phút

                // 1. Cập nhật thời tiết hiện tại cho người chơi
                playerData.weather.current = weatherId;
                
                // 2. Reset lại bộ đếm thời gian để thời tiết này kéo dài đủ 5 phút
                playerData.weather.nextChangeTime = Date.now() + WEATHER_DURATION_MS;

                // 3. Thông báo thành công và đóng modal
                const weatherName = weatherData[weatherId].name;
                alert(`Cheat activated: Thời tiết đã đổi thành "${weatherName}"!`);
                
                // Nâng cao: Nếu modal tháng đang mở, đóng và mở lại để cập nhật ngay lập tức
                const monthModal = document.getElementById('month-modal-overlay');
                if (monthModal && monthModal.classList.contains('visible') && typeof hideMonthModal === 'function' && typeof showMonthModal === 'function') {
                    hideMonthModal();
                    setTimeout(showMonthModal, 200);
                }

                hideCheatCodeModal();
            } else {
                // Trường hợp người dùng gõ sai, ví dụ "thoitiet_muaa"
                alert('Sai mã cheat thời tiết!');
                input.value = '';
            }
        }
        // END - KẾT THÚC BỔ SUNG
        else {
            alert('Sai mã cheat!');
            input.value = '';
        }
    });
});

/* END OF FILE JS/modal-cheatcode.js */