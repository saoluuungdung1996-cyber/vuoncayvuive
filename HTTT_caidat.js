/* START OF FILE JS/HTTT_caidat.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createSettingsModal() {
        if (document.getElementById('irrigation-settings-overlay')) return;

        const modalHTML = `
        <div id="irrigation-settings-overlay" class="irrigation-settings-overlay">
            <div class="irrigation-settings-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="irrigation-settings-close">
                <h2>CÀI ĐẶT HỆ THỐNG TƯỚI</h2>
                
                <div class="global-controls">
                    <button id="select-all-systems-btn">Chọn tất cả</button>
                    <button id="deselect-all-systems-btn">Bỏ chọn tất cả</button>
                </div>

                <div id="irrigation-settings-list" class="irrigation-settings-list">
                    <!-- Danh sách hệ thống sẽ được render ở đây -->
                </div>

                <div class="settings-summary">
                    <p>Đã chọn: <strong id="selected-systems-count">0 / 0</strong> hệ thống</p>
                    <p>Năng lượng tiêu thụ dự kiến: <strong id="estimated-energy-cost">0%</strong></p>
                </div>

                <button id="save-irrigation-settings-btn" class="save-settings-btn">Lưu cài đặt</button>
            </div>
        </div>`;
         document.body.insertAdjacentHTML('beforeend', modalHTML);
        addEventListenersToSettingsModal();
    }

    // Gán sự kiện cho các nút trong modal
    function addEventListenersToSettingsModal() {
        modal = document.getElementById('irrigation-settings-overlay');
        
        modal.querySelector('.irrigation-settings-close').addEventListener('click', hideSettingsModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideSettingsModal(); });

        document.getElementById('save-irrigation-settings-btn').addEventListener('click', saveSettings);
        
        document.getElementById('select-all-systems-btn').addEventListener('click', () => toggleAllCheckboxes(true));
        document.getElementById('deselect-all-systems-btn').addEventListener('click', () => toggleAllCheckboxes(false));
        
        // Dùng event delegation để xử lý click trên checkbox và cập nhật tóm tắt
        document.getElementById('irrigation-settings-list').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                updateSummary();
            }
        });
    }

    // Hàm lưu cài đặt
    function saveSettings() {
        const checkboxes = modal.querySelectorAll('.system-checkbox:not(:disabled)');
        checkboxes.forEach(cb => {
            const plotNumber = cb.dataset.plot;
            if (playerData.farmPlots[plotNumber]) {
                playerData.farmPlots[plotNumber].pumpEnabled = cb.checked;
            }
        });
        markDataAsDirty();
          // Cập nhật lại giao diện của modal quản lý chính ngay lập tức
        if (typeof window.renderIrrigationModal === 'function') {
            window.renderIrrigationModal();
        }
        showGeneralNotification("Đã lưu cài đặt hệ thống tưới!", "success");
        hideSettingsModal();
    }
    
    // Hàm chọn/bỏ chọn tất cả
    function toggleAllCheckboxes(isChecked) {
        modal.querySelectorAll('.system-checkbox:not(:disabled)').forEach(cb => {
            cb.checked = isChecked;
        });
        updateSummary();
    }
    
    // Hàm cập nhật phần tóm tắt
    function updateSummary() {
        const allCheckboxes = modal.querySelectorAll('.system-checkbox:not(:disabled)');
        const checkedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length;
        const totalCount = allCheckboxes.length;
        const energyCost = checkedCount * 1; // Giả sử mỗi hệ thống tốn 1%

        document.getElementById('selected-systems-count').textContent = `${checkedCount} / ${totalCount}`;
        const energyCostEl = document.getElementById('estimated-energy-cost');
        energyCostEl.textContent = `${energyCost}%`;
        
        const currentEnergy = playerData.irrigationEnergy || 100;
        energyCostEl.classList.toggle('insufficient', energyCost > currentEnergy);
    }

    // Hàm render nội dung modal
    function renderSettingsModal() {
        const listContainer = document.getElementById('irrigation-settings-list');
        listContainer.innerHTML = '';
        let hasSystems = false;

        for (const plotNumber in playerData.farmPlots) {
            const plotData = playerData.farmPlots[plotNumber];
            if (plotData.hasIrrigationSystem) {
                hasSystems = true;
                const durability = plotData.irrigationDurability ?? 100;
                const isDisabled = durability <= 0;
                const isChecked = plotData.pumpEnabled ?? true; // Mặc định là bật

                const itemHTML = `
                <div class="irrigation-setting-item ${isDisabled ? 'disabled' : ''}">
                    <label class="custom-checkbox-label">
                        <input type="checkbox" class="system-checkbox" data-plot="${plotNumber}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                        <span class="custom-checkbox-span"></span>
                    </label>
                    <span class="setting-plot-name">Ô đất số ${plotNumber}</span>
                    <img src="${plotData.isDry ? 'Pics/datkhohan.png' : 'Pics/odat.png'}" class="plot-status-icon" title="${plotData.isDry ? 'Đang khô' : 'Đã tưới'}">
                    <div class="setting-durability-bar">
                        <div class="setting-durability-progress ${durability < 20 ? 'low' : ''}" style="width: ${durability}%"></div>
                    </div>
                </div>`;
                listContainer.innerHTML += itemHTML;
            }
        }
        
        if (!hasSystems) {
            listContainer.innerHTML = '<p class="no-systems-message">Chưa có hệ thống nào được lắp đặt.</p>';
        }
        
        updateSummary(); // Cập nhật tóm tắt lần đầu
    }

    // Hàm hiển thị modal (hàm chính)
    window.showIrrigationSettingsModal = async function() {
        createSettingsModal();
        renderSettingsModal();
      
        try {
            const user = auth.currentUser;
            if (user) { // Chỉ thực hiện nếu người dùng đã đăng nhập
                console.log("Đang đồng bộ cài đặt HTTT từ Firebase...");
                const userDocRef = db.collection('users').doc(user.uid);
                const doc = await userDocRef.get();

                if (doc.exists) {
                    const serverSettings = doc.data().settings;
                    // Lấy giá trị HTTT_battat từ server, nếu không có thì mặc định là false
                    const isAutoEnabledOnServer = serverSettings?.HTTT_battat || false;

                    // Cập nhật lại playerData cục bộ để đảm bảo đồng bộ trước khi hiển thị
                    if (!playerData.settings) {
                        playerData.settings = {};
                    }
                    playerData.settings.HTTT_battat = isAutoEnabledOnServer;
                    console.log(`Trạng thái HTTT từ server: ${isAutoEnabledOnServer}. Đã cập nhật vào game.`);
                }
            }
        } catch (error) {
            console.error("Lỗi khi đồng bộ cài đặt HTTT:", error);
            // Nếu có lỗi, game sẽ tiếp tục với dữ liệu hiện có trong playerData, không làm gián đoạn trải nghiệm.
        }
        

        // Lấy checkbox chế độ tưới tự động (được tạo từ file HTTT_kichhoattudong.js)
        const autoCheckbox = document.getElementById('auto-irrigation-checkbox');
        // Kiểm tra xem checkbox đã tồn tại chưa
        if (autoCheckbox) {
            // Đọc trạng thái đã được đồng bộ từ playerData và cập nhật giao diện
            autoCheckbox.checked = playerData.settings?.HTTT_battat || false;
        }
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideSettingsModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/HTTT_caidat.js */