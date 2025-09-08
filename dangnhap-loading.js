// Hàm để hiển thị modal loading
function showLoadingModal(message = "Đang tải...") { // Thêm tham số message
    const modal = document.getElementById('loading-modal');
    const textElement = document.getElementById('loading-modal-text');

    if (modal && textElement) {
        // Cập nhật nội dung của thẻ <p> bằng message được truyền vào
        textElement.textContent = message;
        modal.classList.add('visible');
    }
}

// Hàm để ẩn modal loading
function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}