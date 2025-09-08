document.addEventListener('DOMContentLoaded', function() {
    const insufficientFundsModal = document.getElementById('insufficient-funds-modal');
    const closeBtn = document.getElementById('close-insufficient-funds-btn');

    // Hàm để mở modal
    function openInsufficientFundsModal() {
        if (insufficientFundsModal) {
            insufficientFundsModal.style.display = 'flex';
        }
    }

    // Hàm để đóng modal
    function closeInsufficientFundsModal() {
        if (insufficientFundsModal) {
            insufficientFundsModal.style.display = 'none';
        }
    }

    // Đưa hàm mở modal ra phạm vi toàn cục để file khác có thể gọi
    window.openInsufficientFundsModal = openInsufficientFundsModal;

    // Gán sự kiện cho nút "Đã hiểu"
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInsufficientFundsModal);
    }

    // Gán sự kiện đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target == insufficientFundsModal) {
            closeInsufficientFundsModal();
        }
    });
});