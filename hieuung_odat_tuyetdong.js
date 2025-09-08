/* START OF FILE JS/hieuung_odat_tuyetdong.js */

// Biến quản lý bộ đếm thời gian tích tụ tuyết
window.snowAccumulationInterval = null;

// Tỷ lệ một bông tuyết mới sẽ đọng lại trên ô đất mỗi lần kiểm tra
const SNOW_ACCUMULATION_CHANCE = 75; // 75%
// Thời gian giữa mỗi lần kiểm tra
const SNOW_CHECK_INTERVAL_MS = 5 * 1000; // 10 giây
// Số lượng tuyết tối đa trên một ô
const MAX_SNOW_PER_PLOT = 50;

/**
 * Bắt đầu quá trình tích tụ tuyết trên các ô đất.
 */
function startSnowAccumulation() {
    if (window.snowAccumulationInterval) return;

    console.log("Bắt đầu hiệu ứng tuyết tích tụ trên ô đất.");

    window.snowAccumulationInterval = setInterval(() => {
        for (let i = 1; i <= playerData.stats.unlockedPlots; i++) {
            const plotNumber = String(i);
            
            // Đảm bảo plot có dữ liệu
            if (!playerData.farmPlots[plotNumber]) {
                playerData.farmPlots[plotNumber] = {};
            }
            const plotData = playerData.farmPlots[plotNumber];

            // Khởi tạo dữ liệu tuyết nếu chưa có
            if (!plotData.snowAccumulation) {
                plotData.snowAccumulation = { count: 0, positions: [] };
            }

            // Chỉ thêm tuyết nếu chưa đạt giới hạn
            if (plotData.snowAccumulation.count < MAX_SNOW_PER_PLOT) {
                if (Math.random() * 100 < SNOW_ACCUMULATION_CHANCE) {
                    plotData.snowAccumulation.count++;
                    // Tạo vị trí ngẫu nhiên cho bông tuyết trên ô đất
                    const newPosition = {
                        top: (10 + Math.random() * 80) + '%', // từ 10% đến 90%
                        left: (10 + Math.random() * 80) + '%'
                    };
                    plotData.snowAccumulation.positions.push(newPosition);

                    // Render lại ô đất để hiển thị tuyết mới
                    renderSinglePlot(plotNumber);
                }
            }
        }
    }, SNOW_CHECK_INTERVAL_MS);
}

/**
 * Dừng quá trình tích tụ tuyết.
 */
function stopSnowAccumulation() {
    if (window.snowAccumulationInterval) {
        clearInterval(window.snowAccumulationInterval);
        window.snowAccumulationInterval = null;
        console.log("Dừng hiệu ứng tuyết tích tụ.");
    }
}

function renderSnowOnPlot(plotContainer) {
    const plotNumber = plotContainer.dataset.plotNumber;
    const plotData = playerData.farmPlots[plotNumber];

    // 1. Lấy hoặc tạo container chứa tuyết
    let snowContainer = plotContainer.querySelector('.plot-snow-container');
    if (!snowContainer) {
        snowContainer = document.createElement('div');
        snowContainer.className = 'plot-snow-container';
        plotContainer.appendChild(snowContainer);
    }

    const snowData = plotData?.snowAccumulation;

    // 2. Nếu không có dữ liệu tuyết, dọn dẹp và thoát
    if (!snowData || snowData.positions.length === 0) {
        snowContainer.innerHTML = '';
        return;
    }

    const existingFlakesCount = snowContainer.children.length;
    const totalFlakesInData = snowData.positions.length;

    // 3. Logic chính: So sánh số lượng tuyết trên DOM và trong dữ liệu
    if (existingFlakesCount < totalFlakesInData) {
        // Trường hợp này có nghĩa là có tuyết mới cần được thêm vào
        
        // Kiểm tra xem đây có phải là lần render đầu tiên (ví dụ: mới đăng nhập)
        const isInitialRender = (existingFlakesCount === 0 && totalFlakesInData > 1);

        if (isInitialRender) {
            // Nếu là lần đầu, vẽ lại tất cả nhưng không có animation
            snowContainer.innerHTML = ''; // Dọn dẹp để chắc chắn
            snowData.positions.forEach(pos => {
                const flake = document.createElement('div');
                flake.className = 'accumulated-snow-flake no-animation'; // Thêm lớp .no-animation
                flake.style.top = pos.top;
                flake.style.left = pos.left;
                snowContainer.appendChild(flake);
            });
        } else {
            // Nếu chỉ thêm một vài bông tuyết mới, chỉ render những bông đó (và chúng sẽ có animation)
            for (let i = existingFlakesCount; i < totalFlakesInData; i++) {
                const pos = snowData.positions[i];
                const flake = document.createElement('div');
                flake.className = 'accumulated-snow-flake'; // Không có lớp no-animation
                flake.style.top = pos.top;
                flake.style.left = pos.left;
                snowContainer.appendChild(flake);
            }
        }
    } else if (existingFlakesCount > totalFlakesInData) {
        // Trường hợp hy hữu: Dữ liệu bị mất đồng bộ. Vẽ lại toàn bộ để khớp dữ liệu.
        snowContainer.innerHTML = '';
        snowData.positions.forEach(pos => {
            const flake = document.createElement('div');
            flake.className = 'accumulated-snow-flake no-animation';
            flake.style.top = pos.top;
            flake.style.left = pos.left;
            snowContainer.appendChild(flake);
        });
    }
    // Nếu số lượng bằng nhau, không làm gì cả.
}

/**
 * Xóa sạch tuyết khỏi một ô đất (cả về mặt hình ảnh và dữ liệu).
 * @param {string} plotNumber - Số thứ tự của ô đất.
 */
function clearSnowFromPlot(plotNumber) {
    const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
    if (plotContainer) {
        const snowContainer = plotContainer.querySelector('.plot-snow-container');
        if (snowContainer) {
            snowContainer.remove();
        }
    }
    // Xóa cả dữ liệu
    if (playerData.farmPlots[plotNumber] && playerData.farmPlots[plotNumber].snowAccumulation) {
        delete playerData.farmPlots[plotNumber].snowAccumulation;
    }
}

/* END OF FILE JS/hieuung_odat_tuyetdong.js */