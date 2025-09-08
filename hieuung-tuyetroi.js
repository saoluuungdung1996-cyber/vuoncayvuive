/* START OF FILE JS/hieuung-tuyetroi.js */

const NUMBER_OF_SNOWFLAKES = 150; // Số lượng bông tuyết

/**
 * Bắt đầu hiệu ứng tuyết rơi.
 */
function startSnowEffect() {
    let snowContainer = document.getElementById('snow-container');

    if (!snowContainer) {
        snowContainer = document.createElement('div');
        snowContainer.id = 'snow-container';
        document.body.appendChild(snowContainer);

        for (let i = 0; i < NUMBER_OF_SNOWFLAKES; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            
            const size = Math.random() * 4 + 2 + 'px'; // Kích thước từ 2px đến 6px
            flake.style.width = size;
            flake.style.height = size;
            flake.style.left = Math.random() * 100 + 'vw';
            
            // Thời gian rơi và delay ngẫu nhiên
            flake.style.animationDuration = (Math.random() * 5 + 5) + 's'; // từ 5 đến 10 giây
            flake.style.animationDelay = Math.random() * 5 + 's';
            
            snowContainer.appendChild(flake);
        }
    }

    snowContainer.style.opacity = '1';
    snowContainer.style.visibility = 'visible';
    console.log("Bắt đầu hiệu ứng tuyết rơi.");
}

/**
 * Dừng hiệu ứng tuyết rơi.
 */
function stopSnowEffect() {
    const snowContainer = document.getElementById('snow-container');
    if (snowContainer) {
        snowContainer.style.opacity = '0';
        snowContainer.style.visibility = 'hidden';
    }
    console.log("Dừng hiệu ứng tuyết rơi.");
}

/* END OF FILE JS/hieuung-tuyetroi.js */