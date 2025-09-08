
let seedData = [];
document.addEventListener('DOMContentLoaded', function () {

    // =========================================================================
    //  PHẦN 1: DỮ LIỆU CỬA HÀNG (QUẢN LÝ TẬP TRUNG TẠI ĐÂY)
    // =========================================================================
   // Khai báo seedData ở phạm vi toàn cục (bên ngoài DOMContentLoaded)
// để các file khác có thể truy cập được.

    
let allSeedsData = []; // Biến này sẽ lưu dữ liệu hạt giống lấy từ Firebase
    // Hàm mới để lấy dữ liệu hạt giống từ Firebase
window.fetchSeedDataFromFirebase = async function() {
    try {
        const snapshot = await db.collection('seeds').get();
        // Xóa dữ liệu cũ trước khi tải mới để tránh trùng lặp
        allSeedsData = []; 
        snapshot.forEach(doc => {
            const seed = doc.data();
            seed.type = 'seed'; // <<==== DÒNG QUAN TRỌNG CẦN THÊM
            allSeedsData.push(seed);
        });
        console.log("Đã tải thành công dữ liệu hạt giống từ Firebase:", allSeedsData);

        // Sau khi có dữ liệu, gọi hàm để hiển thị chúng ra cửa hàng
        renderSeedItems();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu hạt giống từ Firebase: ", error);
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        const seedGridContainer = document.getElementById('seed-grid-container');
        if(seedGridContainer) {
            seedGridContainer.innerHTML = '<p style="color: red; text-align: center;">Không thể tải danh sách hạt giống. Vui lòng thử lại sau.</p>';
        }
    }
}


    // (Sau này bạn có thể thêm const itemData = [...] và const toolData = [...] ở đây)


    // =========================================================================
    //  PHẦN 2: LẤY CÁC PHẦN TỬ DOM CẦN THIẾT
    // =========================================================================
    const shopModal = document.getElementById('shop-modal');
    const openShopButton = document.getElementById('open-shop-btn');
    const closeShopButton = document.querySelector('.shop-close-button');
    const menuOptions = document.getElementById('menu-options');
    const moneyDisplay = document.getElementById('so-tien-hien-tai');
    const seedGridContainer = document.getElementById('seed-grid-container');
    const itemGridContainer = document.getElementById('item-grid-container');
    if (!shopModal || !openShopButton || !closeShopButton || !menuOptions || !moneyDisplay || !seedGridContainer || !itemGridContainer) {
        console.error("Thiếu một hoặc nhiều phần tử DOM quan trọng của Cửa hàng!");
        return;
    }


    // =========================================================================
    //  PHẦN 3: LOGIC MỞ/ĐÓNG MODAL VÀ CHUYỂN TAB
    // =========================================================================
    
    // --- Mở Modal ---
    openShopButton.addEventListener('click', function() {
          // Render lại nội dung các tab mỗi khi mở cửa hàng để đảm bảo dữ liệu luôn mới nhất
        if (typeof window.renderItemItems === 'function') {
            window.renderItemItems();
        }
        if (typeof window.renderToolItems === 'function') {
            window.renderToolItems();
        }
        // Hàm renderSeedItems() được gọi bên trong fetchSeedDataFromFirebase,
        // nhưng gọi lại ở đây cũng không sao, đảm bảo luôn cập nhật.
        renderSeedItems();
        shopModal.style.display = 'block';
        menuOptions.classList.remove('show-menu');
    });

    // --- Đóng Modal ---
    function closeModal() {
        shopModal.style.display = 'none';
    }
    closeShopButton.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == shopModal) {
            closeModal();
        }
    });

    // --- Chuyển Tab ---
    const tabButtons = document.querySelectorAll('.shop-tab-button');
    const tabContents = document.querySelectorAll('.shop-tab-content');
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
    //  PHẦN 4: LOGIC RIÊNG CỦA TAB HẠT GIỐNG
    // =========================================================================

    // --- Tự động tạo giao diện từ dữ liệu ---
    function renderSeedItems() {
        seedGridContainer.innerHTML = '';
        // Sắp xếp lại mảng allSeedsData trước khi hiển thị
        allSeedsData.sort((a, b) => {
            // Kiểm tra xem người chơi có thể mua được từng hạt giống không (đủ tiền và đủ cấp)
            const canBuyA = (playerData.money >= a.price) && (playerData.level >= (a.requiredLevel || 1));
            const canBuyB = (playerData.money >= b.price) && (playerData.level >= (b.requiredLevel || 1));

            // Ưu tiên 1: Sắp xếp theo khả năng mua được (item mua được sẽ lên trên)
            const primarySort = (canBuyB ? 1 : 0) - (canBuyA ? 1 : 0);
            if (primarySort !== 0) {
                return primarySort;
            }

            // Ưu tiên 2: Nếu cả hai cùng trạng thái (cùng mua được hoặc không), sắp xếp theo cấp độ yêu cầu từ thấp đến cao
            const levelA = a.requiredLevel || 1;
            const levelB = b.requiredLevel || 1;
            return levelA - levelB; 
        });
        allSeedsData.forEach(item => {
           const itemHTML = `
    <div class="shop-item" data-item-id="${item.id}">
        <img src="Pics/Cuahang/Hatgiong/${item.id}/pic_hatgiong_giaidoan4.png" alt="${item.name}" class="item-image">
        <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            
            
           <!-- Cấu trúc lưới thông tin đã được đơn giản hóa cho CSS thuần túy -->
            <div class="item-info-grid">
                <span class="info-item" data-text="Lớn: ${item.time}"><img src="Pics/icon_time.png" alt="Thời gian"> Lớn: ${item.time}</span>
                <span class="info-item" data-text="EXP: +${item.xp} KN"><img src="Pics/icon_star.png" alt="Kinh nghiệm"> EXP: +${item.xp} KN</span>
                <span class="info-item" data-text="Thu nhập: ${item.profit} $"><img src="Pics/icon-loinhuan.png" alt="Lợi nhuận"> Thu nhập: ${item.profit} $</span>
                 ${item.requiredLevel ? `<span class="info-item" data-text="Cần cấp: ${item.requiredLevel}"><img src="Pics/icon_level.png" alt="Cấp độ"> Cần cấp: ${item.requiredLevel}</span>` : ''}
                <span class="info-item" data-text="Hao đất: ${item.soilDepletion} %"><img src="Pics/icon-dophinhieu.png" alt="Hao đất"> Hao đất: ${item.soilDepletion} %</span>


               
            </div>

            <p class="item-description">${item.description}</p>
            <div class="item-buy-section">
                <span class="item-price">
                    <img src="Pics/tien.png" alt="Tiền"> ${item.price}
                </span>
                <button class="buy-button">Mua</button>
            </div>
        </div>
    </div>
`;
            seedGridContainer.innerHTML += itemHTML;
			
			
			
			
			
        });
		 // Gọi hàm kiểm tra tràn chữ sau khi tất cả các item đã được thêm vào DOM
       
        updateAllBuyButtons();
    }
    

     window.renderItemItems = function() {
        if (!itemGridContainer) return;
        itemGridContainer.innerHTML = '';

        // Lọc ra các vật phẩm có type là 'item' từ allGameItems đã được tải về
        const itemsFromData = Object.values(allGameItems).filter(item => item.type === 'item');

        itemsFromData.forEach(item => {
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
                        <button class="buy-button">Mua</button>
                    </div>
                </div>
            </div>`;
            itemGridContainer.innerHTML += itemHTML;
        });
    }



    // --- Cập nhật trạng thái nút Mua ---
    function updateAllBuyButtons() {
        const currentMoney = parseInt(moneyDisplay.textContent, 10);
         allSeedsData.forEach(item => {
            const itemDiv = seedGridContainer.querySelector(`[data-item-id="${item.id}"]`);
            if (itemDiv) {


                const button = itemDiv.querySelector('.buy-button');
                if (button) {
                     const requiredLevel = item.requiredLevel || 1; // Mặc định yêu cầu cấp 1 nếu không có dữ liệu
                const notEnoughMoney = currentMoney < item.price;
                const notEnoughLevel = playerData.level < requiredLevel;

                button.disabled = notEnoughMoney || notEnoughLevel; // Nút sẽ bị vô hiệu hóa nếu KHÔNG ĐỦ TIỀN hoặc KHÔNG ĐỦ CẤP
                    if(button.disabled) {
                        button.classList.add('disabled');
                    } else {
                        button.classList.remove('disabled');
                    }
                }
            }
              // Gọi hàm render của tab đạo cụ để cập nhật luôn trạng thái nút
        if (typeof window.renderToolItems === 'function') {
            window.renderToolItems();
        }
        });
       // Lọc ra các vật phẩm có type là 'item' từ allGameItems đã được tải về
        const itemsFromData = Object.values(allGameItems).filter(item => item.type === 'item');
        itemsFromData.forEach(item => {
            const itemDiv = itemGridContainer.querySelector(`[data-item-id="${item.id}"]`);
            if (itemDiv) {
                const button = itemDiv.querySelector('.buy-button');
                if (button) {
                    button.disabled = (currentMoney < item.price);
                    if(button.disabled) {
                        button.classList.add('disabled');
                    } else {
                        button.classList.remove('disabled');
                    }
                }
            }
        });


    }

	


    // --- Xử lý sự kiện mua hàng ---
    seedGridContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('buy-button') && !event.target.disabled) {
            const itemDiv = event.target.closest('.shop-item');
            const itemId = itemDiv.dataset.itemId;
            const itemData = allSeedsData.find(item => item.id === itemId);

            if (itemData) {
               // Gọi hàm mở modal xác nhận đã được tạo trong file cuahang-xacnhanmua.js
                if (typeof window.openConfirmationModal === 'function') {
                    window.openConfirmationModal(itemData);
                } else {
                    console.error('Hàm openConfirmationModal không tồn tại!');
                    // Fallback an toàn nếu có lỗi
                    alert('Lỗi: Không thể mở hộp thoại xác nhận.');
                }
            }
        }
    });
// --- Xử lý sự kiện mua hàng cho vật phẩm ---
    itemGridContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('buy-button') && !event.target.disabled) {
            const itemDiv = event.target.closest('.shop-item');
            const itemId = itemDiv.dataset.itemId;
            const itemDataFound = allGameItems[itemId];

            if (itemDataFound) {
               // Gọi hàm mở modal xác nhận
                if (typeof window.openConfirmationModal === 'function') {
                    window.openConfirmationModal(itemDataFound);
                } else {
                    console.error('Hàm openConfirmationModal không tồn tại!');
                    alert('Lỗi: Không thể mở hộp thoại xác nhận.');
                }
            }
        }
    });



    // --- Theo dõi sự thay đổi tiền tệ ---
    const observer = new MutationObserver(updateAllBuyButtons);
    observer.observe(moneyDisplay, { childList: true, subtree: true });

    // --- Khởi tạo ---
    fetchSeedDataFromFirebase(); // Lấy dữ liệu hạt giống từ Firebase rồi mới render
    
     if (typeof window.renderToolItems === 'function') {
        window.renderToolItems(); // Render các đạo cụ (dữ liệu tĩnh)
    }
});

//END - THAY THẾ TOÀN BỘ FILE