/* START OF FILE JS/odat_trauanco.js */

// =================================================================
// FILE: odat_trauanco.js
// MÔ TẢ: Quản lý logic của tính năng Trâu ăn cỏ (Phiên bản Giới hạn & Thời gian chờ).
// =================================================================

// Biến quản lý vòng lặp
let buffaloSystemInterval = null;

// Hằng số của game
const BUFFALO_SYSTEM_TICK_RATE_MS = 1000;
const WEEDS_EATEN_PER_MINUTE = 20;
const BUFFALO_EAT_ONE_WEED_INTERVAL_MS = (60 / WEEDS_EATEN_PER_MINUTE) * 1000;
const MAX_WEEDS_TO_EAT = 100;
const PLANT_HEALTH_DAMAGE_PER_WEED = 1;
const BUFFALO_COOLDOWN_MINUTES = 10;
const BUFFALO_COST = 50;

/**
 * Bắt đầu/Dừng hệ thống trâu ăn cỏ.
 */
window.startBuffaloSystem = function() {
    if (buffaloSystemInterval) return;
    console.log("Hệ thống Trâu ăn cỏ đã được kích hoạt.");
    buffaloSystemInterval = setInterval(buffaloTick, BUFFALO_SYSTEM_TICK_RATE_MS);
};
window.stopBuffaloSystem = function() {
    if (buffaloSystemInterval) {
        clearInterval(buffaloSystemInterval);
        buffaloSystemInterval = null;
        console.log("Hệ thống Trâu ăn cỏ đã dừng.");
    }
};

/**
 * Vòng lặp chính, kiểm tra và cập nhật trạng thái của trâu.
 */
function buffaloTick() {
    const now = Date.now();
    for (const plotNumber in playerData.farmPlots) {
        const plotData = playerData.farmPlots[plotNumber];

        if (plotData?.buffalo?.active) {
            if (!plotData.buffalo.lastActionTime) {
                plotData.buffalo.lastActionTime = now;
                continue;
            }

            if (now - plotData.buffalo.lastActionTime >= BUFFALO_EAT_ONE_WEED_INTERVAL_MS) {
                handleBuffaloEating(plotNumber, plotData);
                renderSinglePlot(plotNumber);
            }
        }
    }
}

/**
 * Xử lý logic khi trâu đang ăn.
 */
function handleBuffaloEating(plotNumber, plotData) {
    plotData.buffalo.lastActionTime = Date.now();
    const weeds = plotData.weeds || [];

    // Nếu hết cỏ hoặc đã ăn đủ 100 bụi, trâu sẽ rời đi
    if (weeds.length === 0 || plotData.buffalo.weedsEaten >= MAX_WEEDS_TO_EAT) {
        stopBuffaloOnPlot(plotNumber, "Đã ăn xong!");
        return;
    }

    // Ăn 1 bụi cỏ
    plotData.weeds.shift();
    plotData.buffalo.weedsEaten++;
    console.log(`Trâu đã ăn 1 bụi cỏ ở ô ${plotNumber}. Tổng cộng: ${plotData.buffalo.weedsEaten}/${MAX_WEEDS_TO_EAT}`);

    // Gây sát thương cho cây trồng
    if (plotData.seedId && (plotData.health ?? 0) > 0) {
        plotData.health = Math.max(0, plotData.health - PLANT_HEALTH_DAMAGE_PER_WEED);
    }
}

/**
 * Dừng hoạt động của trâu và kích hoạt thời gian chờ.
 */
window.stopBuffaloOnPlot = function(plotNumber, reason = "Bị đuổi đi.") {
    if (!playerData.farmPlots[plotNumber]?.buffalo?.active) return;

    console.log(`Trâu đã rời khỏi ô đất ${plotNumber}. Lý do: ${reason}`);
    delete playerData.farmPlots[plotNumber].buffalo;
    
    // Kích hoạt thời gian chờ toàn cục
    buffaloCooldownEndTime = Date.now() + BUFFALO_COOLDOWN_MINUTES * 60 * 1000;
    
    renderSinglePlot(plotNumber);
};

/**
 * Hàm được gọi từ modal để bắt đầu triệu hồi trâu.
 */
window.callBuffaloToPlot = function(plotNumber) {
    const plotData = playerData.farmPlots[plotNumber];

    // Thêm các kiểm tra điều kiện
    if (!plotData || (plotData.weeds || []).length === 0) {
        showGeneralNotification("Không có cỏ để cho trâu ăn!", 'warning');
        return;
    }
    if (playerData.money < BUFFALO_COST) {
        showGeneralNotification(`Bạn không đủ ${BUFFALO_COST}$ để gọi trâu!`, 'warning');
        return;
    }

    // Kiểm tra và áp dụng giảm giá
    const buffaloDiscount = playerData.buffs?.buffaloDiscount;
    let finalCost = BUFFALO_COST;

    if (buffaloDiscount && buffaloDiscount.count > 0) {
        finalCost = BUFFALO_COST * (1 - buffaloDiscount.percentage / 100);
        
        // Kiểm tra lại tiền với giá đã giảm
        if (playerData.money < finalCost) {
            showGeneralNotification(`Bạn không đủ ${finalCost}$ để gọi trâu (giá đã giảm)!`, 'warning');
            return;
        }

        // Trừ 1 lượt sử dụng buff
        buffaloDiscount.count--;
        if (buffaloDiscount.count <= 0) {
            delete playerData.buffs.buffaloDiscount; // Xóa buff khi hết lượt
        }
    } else {
        // Kiểm tra tiền với giá gốc (đã làm ở trên)
    }

    // Trừ tiền
    playerData.money -= finalCost;

    
    document.getElementById('so-tien-hien-tai').textContent = playerData.money;
     // Cập nhật chỉ số cho thành tựu "Bạn của trâu"
    if (typeof window.updateAchievementStat === 'function') {
        updateAchievementStat('buffaloCalledCount', 1);
    }

    // Khởi tạo trạng thái cho trâu
    plotData.buffalo = {
        active: true,
        weedsEaten: 0,

         // Sử dụng thời gian server ước tính để đồng bộ với logic offline
        lastActionTime: getEstimatedServerTime()
    };

    console.log(`Trâu hàng xóm đã được gọi đến ô đất ${plotNumber}.`);
    showGeneralNotification(`Trâu hàng xóm đang trên đường đến ô đất ${plotNumber}!`, 'success');
    
    renderSinglePlot(plotNumber);
};

/* END OF FILE JS/odat_trauanco.js */