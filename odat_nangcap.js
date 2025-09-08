/* START OF FILE JS/odat_nangcap.js */

document.addEventListener('DOMContentLoaded', () => {
    let currentPlotNumber = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createUpgradePlotModal() {
        if (document.getElementById('upgrade-plot-modal-overlay')) return;

        const modalHTML = `
        <div id="upgrade-plot-modal-overlay" class="upgrade-plot-modal-overlay">
            <div class="upgrade-plot-modal-content">
                <h2 id="upgrade-plot-title">NÂNG CẤP Ô ĐẤT</h2>
                <div class="upgrade-plot-info-container">
                    <div class="upgrade-plot-info-row">
                        <span class="label">Cấp độ ô đất:</span>
                        <span class="values">
                            <span id="current-plot-level">1</span> → <span id="next-plot-level" class="next-value">2</span>
                        </span>
                    </div>
                    <div class="upgrade-plot-info-row">
                        <span class="label">Độ phì nhiêu tối đa:</span>
                        <span class="values">
                            <span id="current-max-fertility">100%</span> → <span id="next-max-fertility" class="next-value">110%</span>
                        </span>
                    </div>
                </div>
                <div class="upgrade-plot-requirements">
                    <p><span>Chi phí nâng cấp:</span> <strong id="upgrade-plot-cost">500$</strong></p>
                    <p><span>Tiền của bạn:</span> <strong id="upgrade-player-money">0$</strong></p>
                </div>
                <div class="upgrade-plot-buttons">
                    <button id="cancel-plot-upgrade-btn">Hủy</button>
                    <button id="confirm-plot-upgrade-btn">Nâng Cấp</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addEventListenersToUpgradeModal();
    }

    // Hàm gán sự kiện
    function addEventListenersToUpgradeModal() {
        const modal = document.getElementById('upgrade-plot-modal-overlay');
        const confirmBtn = document.getElementById('confirm-plot-upgrade-btn');
        const cancelBtn = document.getElementById('cancel-plot-upgrade-btn');

        cancelBtn.addEventListener('click', hideUpgradeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideUpgradeModal(); });
        confirmBtn.addEventListener('click', handleConfirmUpgrade);
    }

    // Hàm tính chi phí
    function calculateUpgradeCost(currentLevel) {
        return 500 * Math.pow(2, currentLevel - 1);
    }

    // Hàm hiển thị modal
    window.showUpgradeModal = (plotNumber) => {
        currentPlotNumber = plotNumber;
        const plotData = playerData.farmPlots[plotNumber] || {};
        const currentLevel = plotData.level || 1;
        const currentMaxFertility = plotData.maxFertility || 100;

        const cost = calculateUpgradeCost(currentLevel);

        document.getElementById('upgrade-plot-title').textContent = `NÂNG CẤP Ô ĐẤT SỐ ${plotNumber}`;
        document.getElementById('current-plot-level').textContent = `Cấp ${currentLevel}`;
        document.getElementById('next-plot-level').textContent = `Cấp ${currentLevel + 1}`;
        document.getElementById('current-max-fertility').textContent = `${currentMaxFertility}%`;
        document.getElementById('next-max-fertility').textContent = `${currentMaxFertility + 10}%`;
        document.getElementById('upgrade-plot-cost').textContent = `${cost.toLocaleString('vi-VN')}$`;

        const playerMoneyEl = document.getElementById('upgrade-player-money');
        playerMoneyEl.textContent = `${playerData.money.toLocaleString('vi-VN')}$`;

        const canAfford = playerData.money >= cost;
        playerMoneyEl.classList.toggle('insufficient', !canAfford);
        document.getElementById('confirm-plot-upgrade-btn').disabled = !canAfford;

        document.getElementById('upgrade-plot-modal-overlay').classList.add('visible');
    };

    // Hàm ẩn modal
    function hideUpgradeModal() {
        document.getElementById('upgrade-plot-modal-overlay').classList.remove('visible');
    }

    // Hàm xử lý khi xác nhận nâng cấp
    // Hàm xử lý khi xác nhận nâng cấp
    function handleConfirmUpgrade() {
        if (!currentPlotNumber) return;

        // Đảm bảo đối tượng dữ liệu cho ô đất này tồn tại
        if (!playerData.farmPlots[currentPlotNumber]) {
            playerData.farmPlots[currentPlotNumber] = {};
        }

        const plotData = playerData.farmPlots[currentPlotNumber];
        const currentLevel = plotData.level || 1;
        const cost = calculateUpgradeCost(currentLevel);

        if (playerData.money < cost) {
            alert("Bạn không đủ tiền!");
            return;
        }

        // Trừ tiền
        playerData.money -= cost;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;

        // Nâng cấp ô đất
        plotData.level = currentLevel + 1;
        plotData.maxFertility = (plotData.maxFertility || 100) + 10;
       
        // Cập nhật chỉ số cho thành tựu
        if (typeof window.updateAchievementStat === 'function') {
            updateAchievementStat('totalUpgrades', 1);
        }

        // Đóng modal, thông báo và render lại
        hideUpgradeModal();
        showGeneralNotification(`Nâng cấp ô đất ${currentPlotNumber} thành công!`, 'success');
        renderSinglePlot(currentPlotNumber);
    }

    // Khởi tạo modal khi trang tải xong
    createUpgradePlotModal();
});
/* END OF FILE JS/odat_nangcap.js */