/* START OF FILE JS/khodo-trong.js */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Gán sự kiện cho các nút "Vào cửa hàng" được tạo ra trong kho đồ.
     * Hàm này nên được gọi sau khi nội dung kho đồ được render.
     */
    window.initializeGoToShopButtons = () => {
        const goToShopButtons = document.querySelectorAll('.go-to-shop-btn');

        goToShopButtons.forEach(button => {
            // Gán sự kiện click
            button.addEventListener('click', () => {
                // 1. Đóng modal kho đồ
                const inventoryModal = document.getElementById('inventory-modal');
                if (inventoryModal) {
                    inventoryModal.style.display = 'none';
                }

                // 2. Mở modal cửa hàng
                const shopModal = document.getElementById('shop-modal');
                if (shopModal) {
                    // Thêm một chút delay để hiệu ứng chuyển đổi mượt hơn
                    setTimeout(() => {
                        shopModal.style.display = 'block';
                        
                        // Tùy chọn: Tự động chuyển đến tab tương ứng
                        const targetTab = button.dataset.targetTab; // ví dụ: 'seed-tab'
                        if (targetTab) {
                           const tabButtonToActivate = document.querySelector(`.shop-tab-button[data-tab='${targetTab}']`);
                           if (tabButtonToActivate) {
                               tabButtonToActivate.click(); // Giả lập một cú click để chuyển tab
                           }
                        }
                    }, 300);
                }
            });
        });
    };
});


/* END OF FILE JS/khodo-trong.js */