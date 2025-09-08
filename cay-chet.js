/* START OF FILE JS/cay-chet.js - PHIÊN BẢN MỚI */

let snowDamageInterval = null;

/**
 * Bắt đầu quá trình trừ máu do tuyết rơi.
 * Hàm này sẽ được gọi khi thời tiết chuyển sang 'tuyetroi'.
 */
function startSnowDamage() {
    if (snowDamageInterval) return;
    console.log("Tuyết bắt đầu gây thiệt hại cho cây trồng.");

    snowDamageInterval = setInterval(() => {
        const now = Date.now();
        for (const plotNumber in playerData.farmPlots) {
            const plotData = playerData.farmPlots[plotNumber];

            if (plotData && plotData.seedId && (plotData.health ?? 0) > 0) {
                const itemInfo = allGameItems[plotData.seedId];
                // Lấy giá trị chịu tuyết, nếu không có thì mặc định rất cao (không bị ảnh hưởng)
                const snowResistanceSeconds = itemInfo.resistances?.snow || 999999; 
                
                // Nếu giá trị chịu tuyết nhỏ (ví dụ < 100), cây sẽ bị ảnh hưởng
                if (snowResistanceSeconds < 100) {
                    if (!plotData.nextSnowDamageTime) {
                        plotData.nextSnowDamageTime = now + snowResistanceSeconds * 1000;
                    }

                    if (now >= plotData.nextSnowDamageTime) {
                        plotData.health = Math.max(0, (plotData.health ?? 100) - 1);
                        console.log(`Ô ${plotNumber} bị trừ 1% HP do tuyết. Chu kỳ: ${snowResistanceSeconds}s`);

                        if (plotData.health === 0 && !plotData.deathReason) {
                            plotData.deathReason = 'snow'; // Lý do chết mới
                        }

                        plotData.nextSnowDamageTime = now + snowResistanceSeconds * 1000;
                        renderSinglePlot(plotNumber);
                    }
                }
            }
        }
    }, 1000); // Chạy mỗi giây
}

/**
 * Dừng quá trình trừ máu do tuyết.
 * Hàm này sẽ được gọi khi thời tiết không còn là 'tuyetroi'.
 */
function stopSnowDamage() {
    if (snowDamageInterval) {
        clearInterval(snowDamageInterval);
        snowDamageInterval = null;
        console.log("Dừng hiệu ứng gây thiệt hại của tuyết.");
        // Dọn dẹp các timer riêng của từng ô đất khi tuyết tan
        for (const plotNumber in playerData.farmPlots) {
            if (playerData.farmPlots[plotNumber]?.nextSnowDamageTime) {
                delete playerData.farmPlots[plotNumber].nextSnowDamageTime;
            }
        }
    }
}
/* END OF FILE JS/cay-chet.js */