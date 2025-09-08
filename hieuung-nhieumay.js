/* START OF FILE JS/hieuung-nhieumay.js */

/**
 * Bắt đầu hiệu ứng bóng mây trên mặt đất.
 */
function startCloudyEffect() {
    let shadowContainer = document.getElementById('cloud-shadow-container');

    // Tạo container nếu nó chưa tồn tại
    if (!shadowContainer) {
        shadowContainer = document.createElement('div');
        shadowContainer.id = 'cloud-shadow-container';
        document.body.appendChild(shadowContainer);
    }

    // Hiển thị container với hiệu ứng mờ dần
    // Dùng setTimeout nhỏ để đảm bảo transition được kích hoạt
    setTimeout(() => {
        shadowContainer.classList.add('visible');
    }, 10);

    console.log("Bắt đầu hiệu ứng trời nhiều mây.");
}

/**
 * Dừng và dọn dẹp hiệu ứng bóng mây.
 */
function stopCloudyEffect() {
    const shadowContainer = document.getElementById('cloud-shadow-container');
    if (shadowContainer) {
        // Xóa class 'visible' để kích hoạt transition mờ dần
        shadowContainer.classList.remove('visible');
    }
    console.log("Dừng hiệu ứng trời nhiều mây.");
}

/* END OF FILE JS/hieuung-nhieumay.js */