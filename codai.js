/* START OF FILE JS/codai.js */

// =================================================================
// FILE: codai.js
// MÔ TẢ: Quản lý logic mọc và xử lý cỏ dại.
// =================================================================

// --- CÁC HẰNG SỐ CÓ THỂ TINH CHỈNH (THEO YÊU CẦU MỚI) ---
const WEED_CHECK_INTERVAL_MS = 15 * 1000; // Kiểm tra mọc cỏ mỗi 15 giây
const WEED_THRESHOLD_FOR_DRAIN = 10;     // Ngưỡng số lượng cỏ để bắt đầu trừ
const WEED_FERTILITY_DRAIN_AMOUNT = 0.1;   // Lượng phì nhiêu bị trừ (0.1%)
const MAX_WEEDS_PER_PLOT = 120;         // Số lượng cỏ tối đa trên một ô


// Biến toàn cục để quản lý vòng lặp
let weedInterval = null;

/**
 * Bắt đầu hệ thống xử lý cỏ dại (mọc và giảm độ phì nhiêu).
 */
window.startWeedSystem = function() {
    if (weedInterval) return; // Tránh chạy nhiều vòng lặp

    console.log("Hệ thống cỏ dại đã được kích hoạt.");

    weedInterval = setInterval(() => {
        const currentWeather = playerData.weather.current;
        const spawnChance = WEED_SPAWN_CHANCE[currentWeather] || WEED_SPAWN_CHANCE.default;

        let weedActionOccurred = false;

        // Lặp qua tất cả các ô đất đã mở khóa
        for (let i = 1; i <= playerData.stats.unlockedPlots; i++) {
            const plotNumber = String(i);
            let plotData = playerData.farmPlots[plotNumber];

            if (!plotData) {
                playerData.farmPlots[plotNumber] = {};
                plotData = playerData.farmPlots[plotNumber];
            }

            // --- Logic 1: Xử lý cỏ mọc ---
            if (!plotData.isDry && (plotData.soilFertility ?? 100) > 0 && !plotData.groundState) {
                if (plotData.weedProtectionEndTime) {
                    if (plotData.weedProtectionEndTime < Date.now()) {
                        delete plotData.weedProtectionEndTime;
                    } else {
                        if (Math.random() * 100 < 90) {
                            continue;
                        }
                    }
                }
                if (Math.random() * 100 < spawnChance) {
                    
                    // Khởi tạo mảng weeds nếu nó chưa tồn tại
                    if (!plotData.weeds) {
                        plotData.weeds = [];
                    }

                    // Chỉ thêm cỏ mới nếu số lượng hiện tại chưa đạt giới hạn
                    if (plotData.weeds.length < MAX_WEEDS_PER_PLOT) {
                        const newWeedPosition = {
                            top: (20 + Math.random() * 50) + '%',
                            left: (20 + Math.random() * 60) + '%',
                            rotation: Math.random() * 60 - 30
                        };
                        plotData.weeds.push(newWeedPosition);
                    } else {
                        // Nếu đã đạt giới hạn, bỏ qua và không mọc thêm cỏ ở ô này
                        continue;
                    }
                    weedActionOccurred = true;
                    
                    // --- LOGIC MỚI: KIỂM TRA NGƯỠNG VÀ TRỪ ĐỘ PHÌ NHIÊU ---
                    const weedCount = plotData.weeds.length;
                    
                    // Kiểm tra xem số lượng cỏ có phải là bội số của 10 hay không
                    // Ví dụ: 10, 20, 30...
                    if (weedCount > 0 && weedCount % WEED_THRESHOLD_FOR_DRAIN === 0) {
                        const currentFertility = plotData.soilFertility ?? 100;
                        if (currentFertility > 0) {
                            plotData.soilFertility = Math.max(0, currentFertility - WEED_FERTILITY_DRAIN_AMOUNT);
                            
                            console.log(`Ô đất ${plotNumber} đạt ${weedCount} cỏ, độ phì nhiêu giảm còn ${plotData.soilFertility.toFixed(2)}%`);
                            
                            if (plotData.soilFertility === 0) {
                                const currentPenalty = plotData.barrenPenaltyPercent ?? 0;
                                plotData.barrenPenaltyPercent = currentPenalty + 30;
                            }
                        }
                    }
                    
                    renderSinglePlot(plotNumber);
                    
                }
            }
        }

    }, WEED_CHECK_INTERVAL_MS);
};

/**
 * Dừng hệ thống xử lý cỏ dại.
 */
window.stopWeedSystem = function() {
    if (weedInterval) {
        clearInterval(weedInterval);
        weedInterval = null;
        console.log("Hệ thống cỏ dại đã dừng.");
    }
};

/* END OF FILE JS/codai.js */