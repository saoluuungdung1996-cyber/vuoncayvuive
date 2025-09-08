/* START OF FILE JS/HTTT_tinhtoanoffline.js */

// =================================================================
// FILE: HTTT_tinhtoanoffline.js
// MÔ TẢ: Mô phỏng hoạt động của Hệ thống tưới tiêu (HTTT)
//         và các hiệu ứng khác trong thời gian người chơi offline.
// =================================================================

/**
 * Hàm chính để mô phỏng những gì đã xảy ra trong thời gian người chơi offline.
 * @param {number} offlineDurationSeconds - Tổng số giây người chơi đã offline.
 */
window.simulateOfflineProgression = function(offlineDurationSeconds) {
    console.log(`Bắt đầu mô phỏng bù trừ cho ${offlineDurationSeconds.toFixed(0)} giây offline.`);
    const autoWateredPlots = []; // Mảng để lưu kết quả
    // Nếu thời gian offline quá ngắn, không cần mô phỏng
    if (offlineDurationSeconds < 30) {
        console.log("Thời gian offline quá ngắn, bỏ qua mô phỏng.");
        return autoWateredPlots;
       
    }

    // --- HẰNG SỐ MÔ PHỎNG (Lấy từ các file game khác) ---
    const DROUGHT_CHECK_INTERVAL_S = 30; // Kiểm tra khô hạn mỗi 30 giây
    const DROUGHT_CHANCE = 15;           // 15% cơ hội bị khô khi nắng gắt
    const ENERGY_COST_PER_PUMP = 1;      // 1% năng lượng mỗi lần tưới
    const DURABILITY_COST_PER_PUMP = 2;  // 2% độ bền mỗi lần tưới

    // --- BẮT ĐẦU MÔ PHỎNG ---
    const numberOfDroughtChecks = Math.floor(offlineDurationSeconds / DROUGHT_CHECK_INTERVAL_S);
    console.log(`Thực hiện ${numberOfDroughtChecks} chu kỳ kiểm tra khô hạn.`);

    // Chỉ mô phỏng khô hạn nếu thời tiết lúc đó là "Nắng gắt"
    if (playerData.weather.current !== 'nanggat') {
        console.log("Thời tiết không phải nắng gắt, không mô phỏng khô hạn và HTTT.");
         return autoWateredPlots;
    }

    // Lấy trạng thái cài đặt tưới tự động
    const isAutoIrrigationActive = playerData.settings?.HTTT_battat === true;
     // --- BƯỚC 1: Xử lý các ô đất ĐÃ BỊ KHÔ SẴN khi người chơi offline ---
    console.log("Kiểm tra các ô đất đã khô hạn sẵn có...");
    for (let p = 1; p <= playerData.stats.unlockedPlots; p++) {
        const plotNumber = String(p);
        const plotData = playerData.farmPlots[plotNumber];

        // Chỉ xử lý các ô có HTTT và đang bị khô
        if (plotData && plotData.isDry && plotData.hasIrrigationSystem) {
            const canAutoWater = 
                isAutoIrrigationActive &&
                (plotData.pumpEnabled ?? true) &&
                (plotData.irrigationDurability ?? 100) > 0 &&
                (playerData.irrigationEnergy || 100) >= ENERGY_COST_PER_PUMP;

            if (canAutoWater) {
                console.log(`(Offline) HTTT kích hoạt cho ô ${plotNumber} đã khô sẵn.`);
                // **HTTT KÍCH HOẠT**
                playerData.irrigationEnergy = Math.max(0, (playerData.irrigationEnergy || 100) - ENERGY_COST_PER_PUMP);
                plotData.irrigationDurability = Math.max(0, (plotData.irrigationDurability ?? 100) - DURABILITY_COST_PER_PUMP);
                plotData.isDry = false; // Đất được tưới ngay

                // Thêm vào danh sách để hiển thị hoạt ảnh sau khi đăng nhập
                if (!autoWateredPlots.includes(plotNumber)) {
                    autoWateredPlots.push(plotNumber);
                }
            }
        }
    }

    // Lặp qua từng chu kỳ kiểm tra
    for (let i = 0; i < numberOfDroughtChecks; i++) {
        
        // Lặp qua từng ô đất
        for (let p = 1; p <= playerData.stats.unlockedPlots; p++) {
            const plotNumber = String(p);
            
            if (!playerData.farmPlots[plotNumber]) {
                playerData.farmPlots[plotNumber] = {};
            }
            const plotData = playerData.farmPlots[plotNumber];

            // Chỉ xử lý các ô đất chưa bị khô
            if (!plotData.isDry) {
                // Quay số xem ô đất này có bị khô trong chu kỳ này không
                if (Math.random() * 100 < DROUGHT_CHANCE) {
                    
                    // Ô đất này lẽ ra đã bị khô. KIỂM TRA HTTT TỰ ĐỘNG
                    const canAutoWater = 
                        isAutoIrrigationActive &&
                        plotData.hasIrrigationSystem &&
                        (plotData.pumpEnabled ?? true) &&
                        (plotData.irrigationDurability ?? 100) > 0 &&
                        (playerData.irrigationEnergy || 100) >= ENERGY_COST_PER_PUMP;

                    if (canAutoWater) {
                        // **ĐIỀU KIỆN ĐỦ -> HTTT KÍCH HOẠT**
                        // Trừ năng lượng và độ bền
                        playerData.irrigationEnergy = Math.max(0, (playerData.irrigationEnergy || 100) - ENERGY_COST_PER_PUMP);
                        plotData.irrigationDurability = Math.max(0, (plotData.irrigationDurability ?? 100) - DURABILITY_COST_PER_PUMP);

                        
                        // Thêm vào danh sách kết quả để hiển thị hoạt ảnh sau
                        if (!autoWateredPlots.includes(plotNumber)) {
                            autoWateredPlots.push(plotNumber);
                        }
                    } else {
                        // **KHÔNG ĐỦ ĐIỀU KIỆN -> ĐẤT BỊ KHÔ**
                        plotData.isDry = true;
                        // console.log(`(Offline) Ô ${plotNumber} đã bị khô hạn.`);
                    }
                }
            }
        }
    }

    console.log("Hoàn tất mô phỏng bù trừ offline.");
     // Trả về danh sách các ô đất đã được tưới
    return autoWateredPlots;
};

/* END OF FILE JS/HTTT_tinhtoanoffline.js */