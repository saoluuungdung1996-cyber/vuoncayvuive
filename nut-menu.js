document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử cần thiết từ DOM
    const menuButton = document.querySelector('.menu-button');
    const menuOptions = document.getElementById('menu-options');

     const cheatCodeBtn = document.getElementById('cheat-code-btn');

    // Luôn lắng nghe sự thay đổi trạng thái đăng nhập để ẩn/hiện nút cheat
    auth.onAuthStateChanged(user => {
        if (user && user.email === 'ok@gmail.com') {
            cheatCodeBtn.style.display = 'flex'; // Hiển thị nút
        } else {
            cheatCodeBtn.style.display = 'none'; // Ẩn nút
        }
    });

    // Gán sự kiện cho nút cheat
    if (cheatCodeBtn) {
        cheatCodeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            menuOptions.classList.remove('show-menu'); // Đóng menu trước
            if (typeof window.showCheatCodeModal === 'function') {
                setTimeout(window.showCheatCodeModal, 100); // Mở modal cheat
            }
        });
    }

    
    // Thêm sự kiện 'click' cho nút menu
    menuButton.addEventListener('click', function(event) {
        // Ngăn sự kiện click lan ra ngoài, tránh việc menu tự đóng ngay lập tức
        event.stopPropagation(); 
        
        // Thêm hoặc xóa class 'show-menu' để kích hoạt hiệu ứng CSS
        menuOptions.classList.toggle('show-menu');
    });

    // Thêm sự kiện click vào bất cứ đâu trên trang để đóng menu
    document.addEventListener('click', function() {
        // Nếu menu đang hiển thị (có class 'show-menu') thì ẩn nó đi
        if (menuOptions.classList.contains('show-menu')) {
            menuOptions.classList.remove('show-menu');
        }
    });
});