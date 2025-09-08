/* START OF FILE JS/khodo.js */

// Hàm toàn cục để mở kho đồ với mục đích chọn hạt giống
function openInventoryForSeedSelection(callback) {
    // Lưu lại hành động cần thực hiện khi chọn xong
    window.onSeedSelectCallback = callback;
    // Tìm và gọi hàm mở kho đồ
    const openInventoryButton = document.getElementById('open-inventory-btn');
    if (openInventoryButton) {
        // Giả lập một cú click để mở kho đồ
        openInventoryButton.click();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Thêm biến để lưu trữ hành động (callback) khi chọn hạt giống
    let onSeedSelectCallback = null;

    // =========================================================================
    // LẤY CÁC PHẦN TỬ DOM
    // =========================================================================
    const inventoryModal = document.getElementById('inventory-modal');
    const openInventoryButton = document.getElementById('open-inventory-btn');
    const closeInventoryButton = document.querySelector('.inventory-close-button');
    const menuOptions = document.getElementById('menu-options');

    if (!inventoryModal || !openInventoryButton || !closeInventoryButton) {
        console.error("Thiếu các phần tử DOM của Kho chứa!");
        return;
    }

    // =========================================================================
    // LOGIC MỞ/ĐÓNG VÀ CHUYỂN TAB
    // =========================================================================

    // --- Mở Modal ---
    function openInventoryModal() {
        // Luôn render lại kho đồ mỗi khi mở để cập nhật số lượng mới nhất
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
        inventoryModal.style.display = 'block';
    }

    openInventoryButton.addEventListener('click', function() {
        openInventoryModal();
        if (menuOptions) menuOptions.classList.remove('show-menu');
    });

    // --- Đóng Modal ---
    function hideInventoryModal() { // Đổi tên từ closeModal thành hideInventoryModal
        inventoryModal.style.display = 'none';
    }
    closeInventoryButton.addEventListener('click', hideInventoryModal); // Cập nhật ở đây
    window.addEventListener('click', function(event) {
        if (event.target == inventoryModal) {
            hideInventoryModal(); // Và ở đây
        }
    });

    // --- Chuyển Tab ---
    const tabButtons = document.querySelectorAll('.inventory-tab-button');
    const tabContents = document.querySelectorAll('.inventory-tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            const activeContent = document.getElementById(tabId);
            if (activeContent) activeContent.classList.add('active');
        });
    });

    // =========================================================================
    // LOGIC HIỂN THỊ VẬT PHẨM TRONG KHO
    // =========================================================================

    // Gán hàm vào đối tượng window để truy cập toàn cục từ file khác
    window.renderInventory = function() {
        const seedGrid = document.getElementById('inventory-seed-grid');
        const itemGrid = document.getElementById('inventory-item-grid');
        const toolGrid = document.getElementById('inventory-tool-grid');
        const harvestGrid = document.getElementById('inventory-harvest-grid');
        // Xóa nội dung cũ
        seedGrid.innerHTML = '';
        harvestGrid.innerHTML = '';
        itemGrid.innerHTML = '';
        toolGrid.innerHTML = '';

        // Render Hạt giống
        const playerSeeds = playerData.inventory.seeds || {};
        const availableSeedIds = Object.keys(playerSeeds).filter(id => playerSeeds[id] > 0);

        if (availableSeedIds.length === 0) {
            seedGrid.innerHTML = `
                <div class="inventory-empty-container">
                    <p class="inventory-empty-message">Không còn hạt giống nào ở đây.</p>
                    <button class="go-to-shop-btn" data-target-tab="seed-tab">
                        <img src="Pics/icon_shop.png" alt="Cửa hàng">
                        <span>Vào cửa hàng</span>
                    </button>
                </div>
            `;
        } else {
            availableSeedIds.forEach(id => {
                const itemInfo = allGameItems[id];
                const quantity = playerSeeds[id];
                if (itemInfo && quantity > 0) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'inventory-item';
                    itemDiv.dataset.id = id;
                    itemDiv.style.cursor = 'pointer'; // Thêm con trỏ để báo hiệu có thể click
                    itemDiv.innerHTML = `
                        <div class="inventory-item-quantity">${quantity}</div>
                        <img src="Pics/Cuahang/Hatgiong/${id}/pic_hatgiong_giaidoan4.png" alt="${itemInfo.name}" class="inventory-item-image">
                        <div class="inventory-item-name">${itemInfo.name}</div>
                    `;

                    // Thêm sự kiện click quan trọng
                    itemDiv.addEventListener('click', () => {
                        // Kiểm tra xem có hành động nào đang chờ không
                        if (typeof window.onSeedSelectCallback === 'function') {
                            const seedId = itemDiv.dataset.id;
                            window.onSeedSelectCallback(seedId);
                            window.onSeedSelectCallback = null;
                           hideInventoryModal();
                            closeInventoryModal();
                        } else {



                            const seedId = itemDiv.dataset.id;
                            const itemInfo = allGameItems[seedId];
                            const quantity = playerData.inventory.seeds[seedId] || 0;
                            const popup = document.getElementById('seed-holding-popup');
                            const message = document.getElementById('seed-holding-message');

                            currentlyHoldingSeed = seedId;
                            currentlyHoldingItem = null;

                            if (popup && message && itemInfo) {
                                const menuButton = document.querySelector('.menu-button');
                                if (menuButton) {
                                    menuButton.classList.add('disabled');
                                }
                                message.innerHTML =
                                    `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${quantity}</span>` +
                                    `\n<small>Chọn vào ô đất trống để gieo hạt.</small>`;
                                popup.classList.add('show');
                            }

                             hideInventoryModal();
                        }
                    });

                    seedGrid.appendChild(itemDiv);
                }
            });
        }

        // Render Sản phẩm thu hoạch
        const playerHarvested = playerData.inventory.harvested || {};
        const harvestedIds = Object.keys(playerHarvested).filter(id => playerHarvested[id] > 0);
        if (harvestedIds.length === 0) {
            harvestGrid.innerHTML = '<p class="inventory-empty-message">Bạn chưa có sản phẩm thu hoạch nào.</p>';
        } else {
            harvestedIds.forEach(id => {
                const itemInfo = allGameItems[id];
                const quantity = playerHarvested[id];
                if (itemInfo && quantity > 0) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'inventory-item';
                    itemDiv.dataset.id = id;
                    itemDiv.style.cursor = 'pointer'; // Sản phẩm thu hoạch giờ có thể click được
                    itemDiv.innerHTML = `
                        <div class="inventory-item-quantity">${quantity}</div>
                        <img src="${itemInfo.inventoryImage}" alt="${itemInfo.name}" class="inventory-item-image">
                        <div class="inventory-item-name">${itemInfo.name}</div>
                    `;

                    itemDiv.addEventListener('click', () => {
                        const itemId = itemDiv.dataset.id;

                        const itemQuantity = playerData.inventory.harvested[itemId];

                        // Gọi hàm hiển thị modal hành động từ file khodo-hanhdongthuhoach.js
                        if (typeof window.showHarvestActionModal === 'function') {
                            window.showHarvestActionModal(itemId, itemQuantity);
                        } else {
                            console.error("Hàm showHarvestActionModal không tồn tại.");
                        }
                    });

                    harvestGrid.appendChild(itemDiv);
                }
            });
        }

        // Render Vật phẩm (items)
        const playerItems = playerData.inventory.items || {};
        const availableItemIds = Object.keys(playerItems).filter(id => playerItems[id] > 0);
        if (availableItemIds.length === 0) {
            itemGrid.innerHTML = '<p class="inventory-empty-message">Bạn chưa có vật phẩm nào.</p>';
        } else {
            availableItemIds.forEach(id => {
                const itemInfo = allGameItems[id];
                const quantity = playerItems[id];

                if (itemInfo && quantity > 0) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'inventory-item';
                    itemDiv.dataset.id = id;
                    itemDiv.style.cursor = 'pointer';
                    itemDiv.innerHTML = `
                        <div class="inventory-item-quantity">${quantity}</div>
                        <img src="${itemInfo.inventoryImage}" alt="${itemInfo.name}" class="inventory-item-image">
                        <div class="inventory-item-name">${itemInfo.name}</div>
                    `;

                    itemDiv.addEventListener('click', () => {
                        const itemId = itemDiv.dataset.id;
                         // Nếu là "Nước tưới", mở modal kết hợp
                        if (itemId === 'nuoc-tuoi') {
                            if (typeof window.showCombineWaterModal === 'function') {
                                window.showCombineWaterModal();
                            } else {
                                console.error("Hàm showCombineWaterModal() không tồn tại.");
                            }
                            return; // Dừng tại đây, không thực hiện logic "cầm vật phẩm"
                        }
                        else if (itemId === 'phan-bon-phuc-hoi') {
                            const itemInfo = allGameItems[itemId];
                            const quantity = playerData.inventory.items[itemId] || 0;
                            const popup = document.getElementById('seed-holding-popup');
                            const message = document.getElementById('seed-holding-message');

                            // Thiết lập trạng thái đang cầm Phân bón phục hồi
                            currentlyHoldingItem = itemId;
                            currentlyHoldingSeed = null; // Hủy cầm hạt giống nếu có

                            // Hiển thị popup thông báo
                            if (popup && message && itemInfo) {
                                const menuButton = document.querySelector('.menu-button');
                                if (menuButton) {
                                    menuButton.classList.add('disabled');
                                }
                                message.innerHTML =
                                    `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${quantity}</span>` +
                                    `\n<small>Chọn vào cây trồng cần phục hồi.</small>`;
                                popup.classList.add('show');
                            }
                            
                            // Đóng modal kho đồ
                            closeInventoryModal();
                            return; // Dừng lại để không chạy code cũ bên dưới
                        }

                         // Logic mới: Khi click vào Thuốc trừ sâu
                        if (itemId === 'thuoc-tru-sau') {
                            const itemInfo = allGameItems[itemId];
                            const quantity = playerData.inventory.items[itemId] || 0;
                            const popup = document.getElementById('seed-holding-popup');
                            const message = document.getElementById('seed-holding-message');

                            // Thiết lập trạng thái đang cầm Thuốc trừ sâu
                            currentlyHoldingItem = itemId;
                            currentlyHoldingSeed = null;

                            // Hiển thị popup thông báo
                            if (popup && message && itemInfo) {
                                const menuButton = document.querySelector('.menu-button');
                                if (menuButton) {
                                    menuButton.classList.add('disabled');
                                }
                                message.innerHTML =
                                    `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${quantity}</span>` +
                                    `\n<small>Chọn vào ô đất có sâu bệnh để sử dụng.</small>`;
                                popup.classList.add('show');
                            }
                            
                            // Đóng modal kho đồ
                            closeInventoryModal();
                            return; // Dừng lại để không chạy code cũ bên dưới
                        }
                        else if (itemId === 'nong-dan-don-co') {
                            const itemInfo = allGameItems[itemId];
                            const quantity = playerData.inventory.items[itemId] || 0;
                            const popup = document.getElementById('seed-holding-popup');
                            const message = document.getElementById('seed-holding-message');

                            // Thiết lập trạng thái đang cầm "Nông dân dọn cỏ"
                            currentlyHoldingItem = itemId;
                            currentlyHoldingSeed = null;

                            // Hiển thị popup thông báo
                            if (popup && message && itemInfo) {
                                const menuButton = document.querySelector('.menu-button');
                                if (menuButton) {
                                    menuButton.classList.add('disabled');
                                }
                                message.innerHTML =
                                    `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${quantity}</span>` +
                                    `\n<small>Chọn vào ô đất có cỏ để thuê.</small>`;
                                popup.classList.add('show');
                            }
                            
                            // Đóng modal kho đồ
                            closeInventoryModal();
                            return; // Dừng lại
                        }
                        const itemInfo = allGameItems[itemId];




                        const quantity = playerData.inventory.items[itemId] || 0;
                        const popup = document.getElementById('seed-holding-popup');
                        const message = document.getElementById('seed-holding-message');

                        currentlyHoldingItem = itemId;
                        currentlyHoldingSeed = null;

                        if (popup && message && itemInfo) {
                            const menuButton = document.querySelector('.menu-button');
                            if (menuButton) {
                                menuButton.classList.add('disabled');
                            }
                            message.innerHTML =
                                `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${quantity}</span>` +
                                `\n<small>Chọn vào một ô đất để sử dụng.</small>`;
                            popup.classList.add('show');
                        }

                        closeInventoryModal();
                    });

                    itemGrid.appendChild(itemDiv);
                }
            });
        }

        // Render Đạo cụ (tools)
         const playerTools = playerData.inventory.tools || {};
        const toolIds = Object.keys(playerTools).filter(id => playerTools[id]);

        if (toolIds.length === 0) {
            toolGrid.innerHTML = '<p class="inventory-empty-message">Bạn chưa có đạo cụ nào.</p>';
        } else {
            toolIds.forEach(id => {
            const itemInfo = allGameItems[id];
            const toolData = playerTools[id]; 

            if (itemInfo) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.dataset.id = id;

               // Nếu không còn sở hữu VÀ không phải là 'Hệ thống tưới tiêu', thì mới làm mờ
                if ((!toolData.owned || toolData.owned <= 0) && id !== 'he-thong-tuoi-tieu') {
                    itemDiv.classList.add('out-of-stock');
                } else {
                    itemDiv.style.cursor = 'pointer';
                }

                let innerHTML = `
                    <img src="${itemInfo.inventoryImage}" alt="${itemInfo.name}" class="inventory-item-image">
                    <div class="inventory-item-name">${itemInfo.name}</div>
                `;

                // Logic hiển thị đặc biệt
                if (id === 'binh-tuoi') {
                    const waterPercentage = (toolData.currentWater / itemInfo.maxWater) * 100;
                    innerHTML += `
                        <div class="water-capacity-bar-container">
                            <div class="water-capacity-bar" style="width: ${waterPercentage}%"></div>
                        </div>
                    `;
                } else {
                    // Chỉ hiển thị số lượng nếu > 0
                    if (toolData.owned > 0) {
                        innerHTML = `<div class="inventory-item-quantity">${toolData.owned}</div>` + innerHTML;
                    }
                }

                itemDiv.innerHTML = innerHTML;

                  // --- Logic đặc biệt cho Hệ thống tưới tiêu: Luôn có thể click để quản lý ---
                if (id === 'he-thong-tuoi-tieu') {
                    itemDiv.addEventListener('click', () => {
                        if (typeof window.showIrrigationModal === 'function') {
                            hideInventoryModal(); // Đóng kho đồ trước
                            setTimeout(window.showIrrigationModal, 200);
                        }
                    });
                }

                // --- Gán sự kiện click cho các đạo cụ khác CHỈ KHI CÒN SỞ HỮU ---
                if (toolData.owned > 0) {
                    if (id === 'du-bao-thoi-tiet') {
                        itemDiv.addEventListener('click', () => {
                            if (typeof window.showWeatherForecastModal === 'function') {
                                hideInventoryModal();
                                setTimeout(window.showWeatherForecastModal, 200);
                            }
                        });
                    } else if (id === 'binh-tuoi') {
                        // ... (Toàn bộ logic click và long-press của bình tưới giữ nguyên ở đây) ...
                        let pressTimer;
                        let isLongPress = false;

                        const startPress = (e) => {
                            if (e.type === 'touchstart') e.preventDefault();
                            isLongPress = false;
                            pressTimer = window.setTimeout(() => {
                                isLongPress = true;
                                const isRaining = playerData.weather.current === 'mua' || playerData.weather.current === 'bao';
                                const isAlreadyCollecting = playerData.rainCollection && playerData.rainCollection.active;

                                if (isAlreadyCollecting) {
                                    showGeneralNotification("Bạn đã đang hứng nước mưa rồi!", 'info');
                                    return;
                                }
                                if (!isRaining) {
                                    showGeneralNotification("Chỉ có thể hứng nước khi trời đang mưa!", 'warning');
                                    return;
                                }
                                
                                if (typeof startRainwaterCollection === 'function') {
                                    startRainwaterCollection();
                                    CloseInventoryModal();
                                } else {
                                    console.error("Hàm startRainwaterCollection không tồn tại.");
                                }
                            }, 800);
                        };

                        const cancelPress = () => {
                            clearTimeout(pressTimer);
                        };
                        
                        itemDiv.addEventListener('mousedown', startPress);
                        itemDiv.addEventListener('mouseup', cancelPress);
                        itemDiv.addEventListener('mouseleave', cancelPress);
                        itemDiv.addEventListener('touchstart', startPress);
                        itemDiv.addEventListener('touchend', cancelPress);

                        itemDiv.addEventListener('click', () => {
                            if (isLongPress) return;

                            const itemInfo = allGameItems[id];
                            const toolData = playerData.inventory.tools[id];
                            const popup = document.getElementById('seed-holding-popup');
                            const message = document.getElementById('seed-holding-message');

                            currentlyHoldingItem = id;
                            currentlyHoldingSeed = null;

                            if (popup && message && itemInfo) {
                                const menuButton = document.querySelector('.menu-button');
                                if (menuButton) menuButton.classList.add('disabled');
                                
                                message.innerHTML =
                                    `Bạn đang giữ: ${itemInfo.name}` +
                                    `\n<small>Số lít nước còn lại: ${toolData.currentWater.toFixed(1)} / ${itemInfo.maxWater} L</small>` +
                                    `\n<small>Chọn vào ô đất để tưới.</small>`;
                                popup.classList.add('show');
                            }
                            
                            CloseInventoryModal();
                        });
                    }
                }

                toolGrid.appendChild(itemDiv);
            }
        });
        }

        // Gọi hàm từ file khodo-suc-chua.js để cập nhật hiển thị
        if (typeof window.updateInventoryCapacityDisplay === 'function') {
            window.updateInventoryCapacityDisplay();
        }

        // Gọi hàm để gán sự kiện cho các nút "Vào cửa hàng" vừa được tạo
        if (typeof window.initializeGoToShopButtons === 'function') {
            window.initializeGoToShopButtons();
        }
    }
});

/* END OF FILE JS/khodo.js */