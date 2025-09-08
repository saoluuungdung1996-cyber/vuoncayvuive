/* --- START OF FILE JS/icon-thang.js --- */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy phần tử icon thành tích từ DOM
    const achievementIcon = document.getElementById('achievement-icon-container');

    // Kiểm tra xem icon có tồn tại không
    if (achievementIcon) {
        // Thêm sự kiện 'click' cho icon
        achievementIcon.addEventListener('click', () => {
            // alert('Chức năng Bảng thành tích sẽ được phát triển trong tương lai!'); // Dòng code cũ được thay thế
            
            // Gọi hàm hiển thị modal tháng
            if (typeof showMonthModal === 'function') {
                showMonthModal();
            } else {
                console.error("Hàm showMonthModal() không tồn tại. Hãy đảm bảo file modal-month.js đã được tải.");
            }
        });
    } else {
        console.error("Không tìm thấy phần tử 'achievement-icon-container'!");
    }
});

/* --- END OF FILE JS/icon-thang.js --- */