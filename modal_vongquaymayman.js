/* START OF FILE JS/modal_vongquaymayman.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    function createVongQuayMayManModal() {
        if (document.getElementById('vongquay-modal-overlay')) return;

        const modalHTML = `
            <div id="vongquay-modal-overlay" class="vongquay-modal-overlay">
                <div class="vongquay-modal-content">
                    <div class="vongquay-header">
                       
                        Vòng Quay May Mắn
                        <span class="vongquay-close-button">×</span>
                    </div>
                    <div class="vongquay-main-area">
                        <div class="vongquay-tier-selector">
                            <button class="tier-btn active" data-tier="thuong">Thường</button>
                            <button class="tier-btn" data-tier="lon">Cược Lớn</button>
                            <button class="tier-btn" data-tier="vip">VIP</button>
                        </div>
                         <div id="vongquay-player-money" class="vongquay-player-money">
                            <img src="Pics/tien.png" alt="Tiền">
                            <span id="vongquay-money-amount">0</span>
                        </div>
                         <div class="vongquay-wheel-container">
                            <div class="vongquay-marker"></div>
                            <canvas id="vongquay-canvas" width="380" height="380"></canvas>
                            <button id="vongquay-spinBtn">QUAY</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Container cho pháo hoa -->
            <div id="confetti-container"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('vongquay-modal-overlay');
        addEventListenersToVongQuayModal();
    }

    window.showVongQuayMayManModal = function() {
        createVongQuayMayManModal();
          // Cập nhật số tiền hiện tại của người chơi khi mở modal
    const moneyAmountEl = document.getElementById('vongquay-money-amount');
    if (moneyAmountEl) {
        moneyAmountEl.textContent = playerData.money.toLocaleString('vi-VN');
    }
        modal.classList.add('visible');

        // Thay vì giả lập click, chúng ta gọi trực tiếp hàm update UI
        // Điều này đảm bảo logic chạy đúng thứ tự
        const tierSelector = document.querySelector('.vongquay-tier-selector');
        const updateFunction = window.vongquay_updateUI; // Lấy hàm update đã được lưu
        if (tierSelector && typeof updateFunction === 'function') {
            updateFunction(); // Gọi trực tiếp hàm cập nhật
        }
    };

    function hideVongQuayMayManModal() {
        if (modal) modal.classList.remove('visible');
    }

     function addEventListenersToVongQuayModal() {
        modal.querySelector('.vongquay-close-button').addEventListener('click', hideVongQuayMayManModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideVongQuayMayManModal();
        });

        const canvas = document.getElementById('vongquay-canvas');
        const spinBtn = document.getElementById('vongquay-spinBtn');
        const confettiContainer = document.getElementById('confetti-container');
        const tierSelector = document.querySelector('.vongquay-tier-selector');

        let selectedTier = 'thuong';
        let currentPrizes = VONGQUAY_PRIZES[selectedTier].rewards;

        const ctx = canvas.getContext('2d');
        let currentRotation = 0;
        let isSpinning = false;
         // Lưu hàm update vào window để có thể gọi từ bên ngoài một cách an toàn
        window.vongquay_updateUI = updateVongQuayUI;
        // --- HÀM CẬP NHẬT GIAO DIỆN TỔNG THỂ ---
        function updateVongQuayUI() {
            const tierData = VONGQUAY_PRIZES[selectedTier];
            currentPrizes = tierData.rewards;
            drawWheel(currentPrizes);

            // Cập nhật trạng thái active cho nút tier
            tierSelector.querySelectorAll('.tier-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tier === selectedTier);
            });

            // Vô hiệu hóa nút tier nếu không đủ cấp độ
            for (const tier in VONGQUAY_PRIZES) {
                const btn = tierSelector.querySelector(`[data-tier="${tier}"]`);
                if(btn) {
                    btn.disabled = playerData.level < VONGQUAY_PRIZES[tier].requiredLevel;
                }
            }
            
            // Cập nhật nút QUAY
            const todayStr = new Date(getEstimatedServerTime()).toISOString().split('T')[0];
            const hasFreeSpin = playerData.vongquay?.lastFreeSpinDate !== todayStr;

            if (selectedTier === 'thuong' && hasFreeSpin) {
                spinBtn.textContent = "QUAY (Miễn Phí)";
                spinBtn.disabled = false;
            } else {
                spinBtn.textContent = `QUAY (${tierData.cost.toLocaleString('vi-VN')}$)`;
                spinBtn.disabled = playerData.money < tierData.cost;
            }
        }

        // --- HÀM VẼ VÒNG QUAY (ĐÃ SỬA ĐỔI) ---
        function drawWheel(prizes) {
            const numPrizes = prizes.length;
            const arcSize = 2 * Math.PI / numPrizes;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = canvas.width / 2 - 10;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#8c5a3b';
            ctx.lineWidth = 4;
            prizes.forEach((prize, i) => {
                const angle = i * arcSize;
                ctx.fillStyle = prize.color;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
                ctx.lineTo(centerX, centerY);
                ctx.fill();
                ctx.stroke();
                ctx.save();
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 20px "Roboto Slab", serif';
                ctx.translate(centerX + Math.cos(angle + arcSize / 2) * (radius * 0.65), centerY + Math.sin(angle + arcSize / 2) * (radius * 0.65));
                ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
                 const text = prize.text;

                // Kiểm tra xem text là một mảng (nhiều dòng) hay một chuỗi (một dòng)
                if (Array.isArray(text)) {
                    // Xử lý văn bản nhiều dòng
                    const lineHeight = 22; // Khoảng cách giữa các dòng, bạn có thể điều chỉnh
                    const totalHeight = text.length * lineHeight;
                    let startY = -(totalHeight / 2) + (lineHeight / 2);
                    
                    text.forEach(line => {
                        ctx.fillText(line, -ctx.measureText(line).width / 2, startY);
                        startY += lineHeight; // Di chuyển xuống dòng tiếp theo
                    });
                } else {
                    // Xử lý văn bản một dòng như cũ
                    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
                }
                ctx.restore();
            });
        }
        
        // --- HÀM QUAY (ĐÃ SỬA ĐỔI) ---
        function spin() {
            if (isSpinning) return;
            
            const tierData = VONGQUAY_PRIZES[selectedTier];
            const todayStr = new Date(getEstimatedServerTime()).toISOString().split('T')[0];
            const hasFreeSpin = playerData.vongquay?.lastFreeSpinDate !== todayStr;
            
            // Kiểm tra điều kiện trước khi quay
            if (selectedTier === 'thuong' && hasFreeSpin) {
                  // Khởi tạo đối tượng `vongquay` nếu nó chưa tồn tại
                if (!playerData.vongquay) {
                    playerData.vongquay = {};
                }
                playerData.vongquay.lastFreeSpinDate = todayStr;
            } else {
                if (playerData.money < tierData.cost) {
                    showGeneralNotification("Bạn không đủ tiền để quay!", 'warning');
                    return;
                }
                playerData.money -= tierData.cost;
                document.getElementById('so-tien-hien-tai').textContent = playerData.money;
                // Cập nhật cả số tiền trong modal
            document.getElementById('vongquay-money-amount').textContent = playerData.money.toLocaleString('vi-VN');
            }

            isSpinning = true;
            spinBtn.disabled = true;

            const winningPrizeIndex = Math.floor(Math.random() * currentPrizes.length);
            const winningPrize = currentPrizes[winningPrizeIndex];
            
            const arcSizeDegrees = 360 / currentPrizes.length;
            const winningSegmentCenterAngle = (winningPrizeIndex * arcSizeDegrees) + (arcSizeDegrees / 2);
            const targetAngle = 270 - winningSegmentCenterAngle;
            const randomExtraTurns = (4 + Math.floor(Math.random() * 4)) * 360;
            const currentAngle = currentRotation % 360;
            let rotationToGo = targetAngle - currentAngle;
            if (rotationToGo < 0) rotationToGo += 360;
            const totalRotation = currentRotation + randomExtraTurns + rotationToGo;
            canvas.style.transform = `rotate(${totalRotation}deg)`;
            
            setTimeout(() => {
                displayPrize(winningPrize);
                isSpinning = false;
                const finalVisualAngle = totalRotation % 360;
                currentRotation = finalVisualAngle;
                canvas.style.transition = 'none';
                canvas.style.transform = `rotate(${finalVisualAngle}deg)`;
                setTimeout(() => { canvas.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)'; }, 20);
            }, 5000);
        }

        // --- HÀM HIỂN THỊ PHẦN THƯỞNG (ĐÃ SỬA ĐỔI) ---
        function displayPrize(prize) {
            let message = `Chúc bạn may mắn lần sau!`;
            let type = 'info';

            switch(prize.type) {
                case 'money':
                    playerData.money += prize.value;
                    document.getElementById('so-tien-hien-tai').textContent = playerData.money;
                    // Cập nhật cả số tiền trong modal
                document.getElementById('vongquay-money-amount').textContent = playerData.money.toLocaleString('vi-VN');
                    message = `Chúc mừng! Bạn đã trúng ${prize.text}!`;
                    type = 'success';
                    break;
                case 'xp':
                    playerData.xp += prize.value;
                    checkLevelUp(); // Hàm này từ gamedata.js
                    message = `Chúc mừng! Bạn đã nhận được ${prize.text}!`;
                    type = 'success';
                    break;
                case 'items':
                case 'seeds':
                    for (const itemId in prize.value) {
                        updateInventory(itemId, prize.value[itemId]); // Hàm này từ gamedata.js
                    }
                    message = `Chúc mừng! Bạn đã nhận được ${prize.text}!`;
                    type = 'success';
                    break;
            }

            showGeneralNotification(message, type);
            if(type === 'success') launchConfetti();
            
            // Cập nhật lại UI sau khi nhận thưởng
            updateVongQuayUI();
        }
        
        function launchConfetti() { /* ... function giữ nguyên ... */ }

        // --- GÁN SỰ KIỆN & KHỞI TẠO ---
        spinBtn.addEventListener('click', spin);
        
        tierSelector.addEventListener('click', (e) => {
            const btn = e.target.closest('.tier-btn');
            if (btn && !btn.disabled) {
                selectedTier = btn.dataset.tier;
                updateVongQuayUI();
            }
        });
        
        // Khởi tạo UI lần đầu
        updateVongQuayUI();
    }
});

/* END OF FILE JS/modal_vongquaymayman.js */