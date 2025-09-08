/* START OF FILE JS/hieuung_mua_odat.js */

/**
 * Thêm hiệu ứng mưa vào một ô đất nếu chưa có.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container của ô đất.
 */
function addRainEffectToPlot(plotContainer) {
    if (!plotContainer.querySelector('.plot-rain-effect')) {
        const rainEffect = document.createElement('div');
        rainEffect.className = 'plot-rain-effect';
        plotContainer.appendChild(rainEffect);
    }
}

/**
 * Xóa hiệu ứng mưa khỏi một ô đất nếu có.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container của ô đất.
 */
function removeRainEffectFromPlot(plotContainer) {
    const rainEffect = plotContainer.querySelector('.plot-rain-effect');
    if (rainEffect) {
        rainEffect.remove();
    }
}


/* END OF FILE JS/hieuung_mua_odat.js */