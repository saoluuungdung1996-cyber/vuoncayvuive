//START - THAY THẾ TOÀN BỘ FILE BẰNG ĐOẠN CODE NÀY

/* START OF FILE JS/cuahang-daocu.js */

document.addEventListener('DOMContentLoaded', () => {
    // Dữ liệu tĩnh đã được xóa, giờ chúng ta sẽ đọc từ allGameItems

    const toolGridContainer = document.getElementById('tool-grid-container');
    if (!toolGridContainer) return;

    /**
     * Hàm hiển thị các đạo cụ trong tab cửa hàng.
     * Sẽ được gọi từ modal-cuahang.js
     */
    window.renderToolItems = () => {
        toolGridContainer.innerHTML = ''; // Xóa nội dung cũ
        const currentMoney = playerData.money;
        const ownedTools = playerData.inventory.tools || {};

        // Lọc ra các vật phẩm có type là 'tool' từ allGameItems
        const toolsFromData = Object.values(allGameItems).filter(item => item.type === 'tool');

        toolsFromData.forEach(item => {
            const hasTool = ownedTools[item.id] && ownedTools[item.id].owned > 0;
            let buttonHTML;

            // Phân loại đạo cụ:
            // 1. Đạo cụ có thể mua nhiều lần
            if (item.id === 'he-thong-tuoi-tieu') {
                const canAfford = currentMoney >= item.price;
                const disabledState = canAfford ? '' : 'disabled';
                buttonHTML = `<button class="buy-button" ${disabledState}>Mua</button>`;
            } 
            // 2. Đạo cụ chỉ mua 1 lần
            else {
                if (hasTool) {
                    buttonHTML = `<button class="buy-button owned">Đã mua</button>`;
                } else {
                    const canAfford = currentMoney >= item.price;
                    const disabledState = canAfford ? '' : 'disabled';
                    buttonHTML = `<button class="buy-button" ${disabledState}>Mua</button>`;
                }
            }

            const itemHTML = `
                <div class="shop-item" data-item-id="${item.id}">
                    <img src="${item.inventoryImage}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="item-description">${item.description}</p>
                        <div class="item-buy-section">
                            <span class="item-price">
                                <img src="Pics/tien.png" alt="Tiền"> ${item.price}
                            </span>
                            ${buttonHTML}
                        </div>
                    </div>
                </div>
            `;
            toolGridContainer.innerHTML += itemHTML;
        });
    };

    // Xử lý sự kiện khi nhấn nút "Mua"
    toolGridContainer.addEventListener('click', (event) => {
       
        // Sử dụng .closest() để đảm bảo chúng ta luôn lấy được thẻ button
        const button = event.target.closest('.buy-button');

        // Nếu không click vào một button, hoặc button bị vô hiệu hóa thì không làm gì cả
        if (!button || button.disabled) {
            return;
        }

        const itemDiv = button.closest('.shop-item');
        const itemId = itemDiv.dataset.itemId;
        const itemInfo = allGameItems[itemId];

        if (!itemInfo) return;

        // TRƯỜNG HỢP 1: Nhấn vào nút "Đã mua" để bán lại
        if (button.classList.contains('owned')) {
            if (typeof window.showSellToolModal === 'function') {
                window.showSellToolModal(itemId);
            } else {
                console.error("Lỗi: Hàm showSellToolModal không tồn tại.");
            }
        } 
        // TRƯỜNG HỢP 2: Nhấn vào nút "Mua" để mua mới
        else {
             if (itemInfo.id === 'he-thong-tuoi-tieu') {
                // Nếu là Hệ thống tưới tiêu, mở modal chọn số lượng
                if (typeof window.openConfirmationModal === 'function') {
                    // Gán type 'tool' để modal xác nhận biết cách xử lý
                    itemInfo.type = 'tool'; 
                    window.openConfirmationModal(itemInfo);
                }
            } else {
                // Logic mua 1 lần cho các đạo cụ khác
                playerData.money -= itemInfo.price;
                document.getElementById('so-tien-hien-tai').textContent = playerData.money;

                if (!playerData.inventory.tools) playerData.inventory.tools = {};
                playerData.inventory.tools[itemId] = {
                    owned: 1,
                    currentWater: 0
                };
                
                if (typeof window.openSuccessModal === 'function') {
                    window.openSuccessModal(`Bạn đã mua thành công ${itemInfo.name}!`, itemId);
                }
                // Cập nhật lại giao diện cửa hàng sau khi mua
                window.renderToolItems();
            }
        }
        
    });
});

/* END OF FILE JS/cuahang-daocu.js */

//END - KẾT THÚC THAY THẾ