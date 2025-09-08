/* START OF FILE JS/plot-fertility-bar.js */

/**
 * Render hoặc cập nhật thanh độ phì nhiêu cho một ô đất.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container của ô đất.
 */
function renderFertilityBar(plotContainer) {
    if (!plotContainer) return;

    const plotNumber = plotContainer.dataset.plotNumber;
    let fertilityContainer = plotContainer.querySelector('.fertility-bar-container');

    // Nếu thanh độ phì nhiêu chưa tồn tại, hãy tạo nó
    if (!fertilityContainer) {
        fertilityContainer = document.createElement('div');
        fertilityContainer.className = 'fertility-bar-container';
        fertilityContainer.innerHTML = `
            <div class="fertility-bar-progress"></div>
            <span class="fertility-bar-text"></span>
        `;
        plotContainer.appendChild(fertilityContainer);
    }

    // Lấy dữ liệu độ phì nhiêu, mặc định là 100 nếu chưa có
    const plotData = playerData.farmPlots[plotNumber];
    const fertility = plotData?.soilFertility ?? 100;
     const maxFertility = plotData?.maxFertility || 100; // Lấy max aбо 100
    const percentage = (fertility / maxFertility) * 100;

    // Lấy các phần tử con để cập nhật
    const progressBar = fertilityContainer.querySelector('.fertility-bar-progress');
    const textDisplay = fertilityContainer.querySelector('.fertility-bar-text');

    if (progressBar && textDisplay) {
        // Cập nhật chiều rộng của thanh tiến trình
       progressBar.style.width = `${percentage}%`;
        // Cập nhật text hiển thị
        textDisplay.textContent = `${Math.round(fertility)}%`;
    }
}

/* END OF FILE JS/plot-fertility-bar.js */