/* START OF FILE JS/khohan_saubenh_codai_chet.js */

// =================================================================
// FILE: khohan_saubenh_codai_chet.js
// MÔ TẢ: Quản lý logic chết dần của cỏ dại và sâu bệnh trên đất khô.
// =================================================================

// Biến quản lý bộ đếm thời gian chính cho các hiệu ứng khô hạn
let dryMechanicsInterval = null;

// Hằng số cho cơ chế
const WEED_DEATH_INTERVAL_MS = 20 * 1000;      // Cỏ chết sau mỗi 20 giây
const PEST_DEATH_DURATION_MS = 60 * 1000;      // Sâu bệnh chết sau 60 giây

/**
 * Bắt đầu hệ thống xử lý các hiệu ứng trên đất khô.
 */
window.startDryMechanicsSystem = function() {
    if (dryMechanicsInterval) return;

    console.log("Hệ thống hiệu ứng đất khô (cỏ/sâu chết) đã được kích hoạt.");

    // Chạy bộ đếm mỗi 2 giây để kiểm tra và cập nhật
    dryMechanicsInterval = setInterval(() => {
        const now = Date.now();

        // Lặp qua tất cả các ô đất
        for (const plotNumber in playerData.farmPlots) {
            const plotData = playerData.farmPlots[plotNumber];
            if (!plotData) continue;

            // --- KIỂM TRA NẾU ĐẤT BỊ KHÔ ---
            if (plotData.isDry) {

                // 1. XỬ LÝ CỎ DẠI CHẾT DẦN
                if (plotData.weeds && plotData.weeds.length > 0) {
                    // Nếu chưa có bộ đếm thời gian cho cỏ chết, hãy tạo nó
                    if (!plotData.nextWeedDeathTime) {
                        plotData.nextWeedDeathTime = now + WEED_DEATH_INTERVAL_MS;
                    }

                    // Nếu đã đến lúc, xóa một bụi cỏ
                    if (now >= plotData.nextWeedDeathTime) {
                        plotData.weeds.shift(); // Xóa phần tử đầu tiên trong mảng cỏ
                        console.log(`Một bụi cỏ trên ô ${plotNumber} đã chết do khô hạn. Còn lại: ${plotData.weeds.length}`);
                        
                        // Nếu vẫn còn cỏ, đặt lại bộ đếm cho lần tiếp theo
                        if (plotData.weeds.length > 0) {
                            plotData.nextWeedDeathTime = now + WEED_DEATH_INTERVAL_MS;
                        } else {
                            // Nếu hết cỏ, xóa bộ đếm
                            delete plotData.nextWeedDeathTime;
                        }
                        renderSinglePlot(plotNumber);
                    }
                }

                // 2. XỬ LÝ SÂU BỆNH CHẾT
                if (plotData.hasPest) {
                    // Nếu chưa có bộ đếm thời gian cho sâu chết, hãy tạo nó
                    if (!plotData.pestDeathTime) {
                        plotData.pestDeathTime = now + PEST_DEATH_DURATION_MS;
                    }
                    
                    // Nếu đã hết thời gian, xóa sâu bệnh
                    if (now >= plotData.pestDeathTime) {
                        plotData.hasPest = false;
                        delete plotData.pestDeathTime; // Xóa bộ đếm
                        console.log(`Sâu bệnh trên ô ${plotNumber} đã chết do khô hạn.`);
                        renderSinglePlot(plotNumber);
                    }
                }

            } 
            // --- KIỂM TRA NẾU ĐẤT KHÔNG CÒN KHÔ ---
            else {
                // Nếu đất được tưới nước, hủy bỏ các bộ đếm thời gian chết chóc
                if (plotData.nextWeedDeathTime) {
                    delete plotData.nextWeedDeathTime;
                }
                if (plotData.pestDeathTime) {
                    delete plotData.pestDeathTime;
                }
            }
        }
    }, 2000); // Kiểm tra mỗi 2 giây
};

/**
 * Dừng hệ thống xử lý hiệu ứng đất khô (khi đăng xuất).
 */
window.stopDryMechanicsSystem = function() {
    if (dryMechanicsInterval) {
        clearInterval(dryMechanicsInterval);
        dryMechanicsInterval = null;
        console.log("Hệ thống hiệu ứng đất khô đã dừng.");
    }
};

/* END OF FILE JS/khohan_saubenh_codai_chet.js */