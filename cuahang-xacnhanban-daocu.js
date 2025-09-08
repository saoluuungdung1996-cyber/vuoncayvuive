/* START OF FILE JS/cuahang-xacnhanban-daocu.js */

document.addEventListener('DOMContentLoaded', () => {
    let currentItemToSell = null;

    // Hàm tạo cấu trúc HTML của modal (chỉ chạy 1 lần)
    function createSellToolModal() {
        if (document.getElementById('sell-tool-modal-overlay')) return;

        const modalHTML = `
        <div id="sell-tool-modal-overlay" class="sell-tool-modal-overlay">
            <div class="sell-tool-modal-content">
                <h2>XÁC NHẬN BÁN</h2>
                <div class="sell-tool-item-details">
                    <img id="sell-tool-image" src="" alt="Đạo cụ">
                    <h3 id="sell-tool-name">Tên Đạo Cụ</h3>
                </div>
                <div class="sell-tool-price-info">
                    <p>Giá mua ban đầu: <strong id="sell-tool-original-price">0</strong> <img src="Pics/tien.png" alt="Tiền"></p>
                    <p>Bạn sẽ nhận được: <strong id="sell-tool-sell-price" class="sell-price-value">0</strong> <img src="Pics/tien.png" alt="Tiền"></p>
                </div>
                <div class="sell-tool-buttons">
                    <button id="cancel-sell-tool-btn">Huỷ giao dịch</button>
                    <button id="confirm-sell-tool-btn">Bán ngay</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addEventListenersToSellToolModal();
    }

    // Gán sự kiện cho các nút
    function addEventListenersToSellToolModal() {
        const modal = document.getElementById('sell-tool-modal-overlay');
        const confirmBtn = document.getElementById('confirm-sell-tool-btn');
        const cancelBtn = document.getElementById('cancel-sell-tool-btn');

        cancelBtn.addEventListener('click', hideSellToolModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideSellToolModal(); });
        confirmBtn.addEventListener('click', handleConfirmSellTool);
    }

    // Hàm hiển thị modal (sẽ được gọi từ cuahang-daocu.js)
    window.showSellToolModal = (itemId) => {
        createSellToolModal(); // Đảm bảo modal đã được tạo
        const itemInfo = allGameItems[itemId];
        if (!itemInfo) return;

        currentItemToSell = itemInfo;
        const sellPrice = Math.floor(itemInfo.price * 0.20); // Bán được 20% giá gốc

        document.getElementById('sell-tool-image').src = itemInfo.inventoryImage;
        document.getElementById('sell-tool-name').textContent = itemInfo.name;
        document.getElementById('sell-tool-original-price').textContent = itemInfo.price.toLocaleString('vi-VN');
        document.getElementById('sell-tool-sell-price').textContent = sellPrice.toLocaleString('vi-VN');

        document.getElementById('sell-tool-modal-overlay').classList.add('visible');
    };

    // Hàm ẩn modal
    function hideSellToolModal() {
        document.getElementById('sell-tool-modal-overlay').classList.remove('visible');
    }

    // Hàm xử lý khi xác nhận bán
    function handleConfirmSellTool() {
        if (!currentItemToSell) return;

        const sellPrice = Math.floor(currentItemToSell.price * 0.20);

        // 1. Cộng tiền cho người chơi
        playerData.money += sellPrice;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;

        // 2. Xóa đạo cụ khỏi kho
        delete playerData.inventory.tools[currentItemToSell.id];

        // 3. Đánh dấu dữ liệu đã thay đổi để tự động lưu
        markDataAsDirty();

        // 4. Thông báo thành công
        showGeneralNotification(`Bạn đã bán ${currentItemToSell.name} và nhận được ${sellPrice.toLocaleString('vi-VN')}$!`, 'success');

        // 5. Đóng modal và cập nhật lại giao diện cửa hàng
        hideSellToolModal();
        if (typeof window.renderToolItems === 'function') {
            window.renderToolItems();
        }
    }

    // Khởi tạo modal sẵn sàng
    createSellToolModal();
});

/* END OF FILE JS/cuahang-xacnhanban-daocu.js */