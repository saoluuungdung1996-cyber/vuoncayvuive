/* --- START OF FILE JS/icon-taikhoan.js --- */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử cần thiết từ DOM
    const accountIcon = document.getElementById('account-icon-container');
    const menuOptions = document.getElementById('menu-options');

    // Kiểm tra xem các phần tử có tồn tại không trước khi thêm sự kiện
    if (accountIcon && menuOptions) {
        // Thêm sự kiện 'click' cho icon tài khoản
        accountIcon.addEventListener('click', (event) => {
            // Ngăn sự kiện click lan ra các phần tử khác (nếu cần)
            event.stopPropagation();
            
            // Hiển thị hoặc ẩn menu bằng cách thêm/xóa class 'show'
            // Đây là cách làm phổ biến và tương thích với nút menu hiện có
            menuOptions.classList.toggle('show');
        });
    }

    // Thêm một sự kiện để đóng menu khi nhấp ra ngoài
    // Logic này có thể đã có trong nut-menu.js, nhưng thêm vào đây để đảm bảo hoạt động
    window.addEventListener('click', () => {
        if (menuOptions && menuOptions.classList.contains('show')) {
            menuOptions.classList.remove('show');
        }
    });
});

/* --- END OF FILE JS/icon-taikhoan.js --- */