/* START OF FILE JS/hieuung_caychay.js */
// Khai báo một đối tượng toàn cục để theo dõi các bộ đếm thời gian của hiệu ứng cháy
window.fireEffectTimers = {};
/**
 * Tạo hiệu ứng lửa cháy trên một ô đất và xử lý logic sau khi cháy xong.
 * Hàm này sẽ được gọi từ file thoitiet_baoto.js
 * @param {HTMLElement} plotContainer - Phần tử .plot-container của ô đất bị sét đánh.
 */
window.createFireEffectOnPlot = function(plotContainer) {
    const plotNumber = plotContainer.dataset.plotNumber;

    // Ngăn tạo hiệu ứng chồng chéo nếu đã có
    if (plotContainer.querySelector('.fire-effect-container')) return;

    console.log(`Cây chết ở ô ${plotNumber} bị sét đánh và bốc cháy!`);

    // 1. Tạo container cho hiệu ứng
    const fireContainer = document.createElement('div');
    fireContainer.className = 'fire-effect-container';

    // 2. Thêm các phần tử lửa và khói vào container
    fireContainer.innerHTML = `<img src="Pics/luachay.gif" alt="Hiệu ứng lửa cháy" class="fire-gif">`;
    // 3. Thêm hiệu ứng vào ô đất
    plotContainer.appendChild(fireContainer);

    // 4. Đặt hẹn giờ 30 giây để xử lý sau khi cháy
    const fireTimeoutId = setTimeout(() => {
        // 5. Xóa hiệu ứng lửa cháy khỏi giao diện
        fireContainer.remove();

        const plotData = playerData.farmPlots[plotNumber];
        if (!plotData) return; // Kiểm tra an toàn

        // 6. Cập nhật dữ liệu ô đất
        // Chọn ngẫu nhiên ảnh đất cháy xém
        const randomGroundIndex = Math.floor(Math.random() * 3) + 1;
        plotData.groundState = `scorched_${randomGroundIndex}`;
        
        // Coi như đây là một lần "sét đánh" khác làm hỏng đất
        plotData.scorchCount = (plotData.scorchCount || 0) + 1;
        
        // Xóa hoàn toàn dữ liệu của cây trồng đã chết
        delete plotData.seedId;
        delete plotData.plantedAt;
        delete plotData.lastRenderedStage;
        delete plotData.health;

        console.log(`Cây cháy ở ô ${plotNumber} đã biến mất, ô đất bị cháy xém.`);

        // 7. Render lại ô đất để cập nhật giao diện (mất cây, đổi nền đất)
        if (typeof renderSinglePlot === 'function') {
            renderSinglePlot(plotNumber);
        }
         // Dọn dẹp bộ đếm thời gian sau khi nó đã hoàn thành
        delete window.fireEffectTimers[plotNumber];
    }, 30000); // 30000 milliseconds = 30 giây
     // Lưu ID của bộ đếm thời gian vào đối tượng toàn cục
    window.fireEffectTimers[plotNumber] = fireTimeoutId;
};

/* END OF FILE JS/hieuung_caychay.js */