/* START OF FILE JS/modal_jackslot.js - PHIÊN BẢN HOÀN CHỈNH */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let audioInitialized = false;
    let synth, spinSound, winSound, coinSound;

    // --- HÀM TẠO MODAL (CHỈ CHẠY 1 LẦN) ---
    function createJackslotModal() {
        if (document.getElementById('jackslot-modal-overlay')) return;

        const modalHTML = `
            <div id="jackslot-modal-overlay" class="jackslot-modal-overlay">
                <div class="jackslot-modal-content">
                    <span class="jackslot-close-button">×</span>
                    <div class="jackslot-game-wrapper">
                       
                        <main class="slot-machine">
                            <div class="reels-container">
                                <div>
                                    <div id="jackslot-reel1" class="reel">🍒</div>
                                    <div id="jackslot-reel2" class="reel">🍋</div>
                                    <div id="jackslot-reel3" class="reel">💎</div>
                                </div>
                            </div>
                            <div id="jackslot-message-box" class="message-box">
                                <p id="jackslot-message-text"></p>
                            </div>
                            <div class="controls-grid">
                                <div>
                                    <p>Tiền của bạn</p>
                                    <p id="jackslot-credits-display">0</p>
                                </div>
                                <div>
                                    <p>Cược</p>
                                    <input type="number" id="jackslot-bet-input" value="10">
                                </div>
                            </div>
                            <div class="controls-buttons-container">
                                <button id="jackslot-decrease-bet" class="btn-bet">-</button>
                                <button id="jackslot-increase-bet" class="btn-bet">+</button>
                                 <button id="jackslot-history-button" class="btn-bet" style="background-color: #f59e0b;">📜</button>
                                <button id="jackslot-help-button" class="btn-help">?</button>
                            </div>
                            <div class="lever-container">
                                <button id="jackslot-spin-button" class="lever font-luckiest">QUAY</button>
                            </div>
                             <div id="jackslot-spins-display" style="text-align: center; margin-top: 1rem; color: #d8b4fe; font-weight: 700;">
                                Lượt quay còn lại: <span id="jackslot-spins-count">0</span>
                            </div>
                        </main>
                       
                    </div>
                </div>
            </div>
            
            
            <div id="money-rain-container"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('jackslot-modal-overlay');
        addEventListenersToJackslot();
    }

    window.showJackslotModal = function() {
        createJackslotModal();
        document.getElementById('jackslot-credits-display').textContent = playerData.money.toLocaleString('vi-VN');
        document.getElementById('jackslot-bet-input').value = 10;
         // Cập nhật số lượt quay và trạng thái nút Quay
        const spinsCountDisplay = document.getElementById('jackslot-spins-count');
        const spinButton = document.getElementById('jackslot-spin-button');
        const currentSpins = playerData.jacksot?.spins || 0;
        
        spinsCountDisplay.textContent = currentSpins;
        spinButton.disabled = currentSpins < 1;
        showMessage('Sẵn sàng để quay!');
        modal.classList.add('visible');
    };

    function hideJackslotModal() {
        if (modal) modal.classList.remove('visible');
    }
     function showMessage(text, type = 'info') {
        const messageText = document.getElementById('jackslot-message-text');
        const messageBox = document.getElementById('jackslot-message-box');
        if (!messageText || !messageBox) return;

        messageText.textContent = text;
        messageText.style.color = '#fcd34d'; // Mặc định
        messageBox.style.transform = 'scale(1)';

        if (type === 'win') {
            messageText.style.color = '#4ade80';
            messageBox.style.transform = 'scale(1.1)';
        } else if (type === 'error') {
            messageText.style.color = '#f87171';
            messageBox.style.transform = 'scale(1.1)';
        }
    }

    function addEventListenersToJackslot() {
        modal.querySelector('.jackslot-close-button').addEventListener('click', hideJackslotModal);
        const historyButton = modal.querySelector('#jackslot-history-button');
        const reels = [document.getElementById('jackslot-reel1'), document.getElementById('jackslot-reel2'), document.getElementById('jackslot-reel3')];
        const spinButton = document.getElementById('jackslot-spin-button');
        const creditsDisplay = document.getElementById('jackslot-credits-display');
        const betInput = document.getElementById('jackslot-bet-input');
        const increaseBetButton = document.getElementById('jackslot-increase-bet');
        const decreaseBetButton = document.getElementById('jackslot-decrease-bet');
        const messageText = document.getElementById('jackslot-message-text');
         const spinsCountDisplay = modal.querySelector('#jackslot-spins-count');
         const helpButton = document.getElementById('jackslot-help-button');
        const helpModal = document.getElementById('jackslot-help-modal'); // Vẫn giữ nguyên vì nó ở ngoài
        const closeHelpButton = document.getElementById('jackslot-close-help-button'); // Tìm trên toàn document
        const payoutTableContainer = document.getElementById('jackslot-payout-table-container'); // Tìm trên toàn document

        const symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎'];
        const payouts3 = { '💎': 100, '⭐': 50, '🔔': 25, '🍉': 20, '🍊': 15, '🍋': 10, '🍒': 5 };
        const payouts2 = { '💎': 20, '⭐': 10, '🔔': 8, '🍉': 6, '🍊': 4, '🍋': 3, '🍒': 2 };

        let isSpinning = false;
        let holdStartTime = 0;

        async function initializeAudio() { /* Giữ nguyên */ }
        
        
        const handleSpinStart = (e) => {
            e.preventDefault();
            if (isSpinning) return;
             if (playerData.jacksot.spins < 1) {
                showMessage("Đã hết lượt quay!", 'error');
                return;
            }
            if (playerData.money < parseInt(betInput.value, 10)) {
                showMessage("Không đủ tiền!", 'error');
                return;
            }
            if (holdStartTime === 0) holdStartTime = Date.now();
        };

        const handleSpinEnd = () => {
            if (holdStartTime === 0 || isSpinning) return;
            const holdDuration = Date.now() - holdStartTime;
            holdStartTime = 0;
            startSpin(holdDuration);
        };
        
        spinButton.addEventListener('mousedown', handleSpinStart);
        spinButton.addEventListener('touchstart', handleSpinStart, { passive: false });
        spinButton.addEventListener('mouseup', handleSpinEnd);
        spinButton.addEventListener('touchend', handleSpinEnd);
        
        function handleBetChange() {
            let newBet = parseInt(betInput.value, 10);
            if (isNaN(newBet) || newBet < 1) newBet = 1;
            if (newBet > playerData.money) newBet = playerData.money;
            betInput.value = newBet;
        }
        betInput.addEventListener('change', handleBetChange);
        
        increaseBetButton.addEventListener('click', () => {
            if (isSpinning) return;
            betInput.value = parseInt(betInput.value, 10) + 10;
            handleBetChange();
        });

        decreaseBetButton.addEventListener('click', () => {
            if (isSpinning) return;
            betInput.value = parseInt(betInput.value, 10) - 10;
            handleBetChange();
        });

        function startSpin(holdDuration) {
            isSpinning = true;
            spinButton.disabled = true;
            showMessage('');
             // Trừ 1 lượt quay
            playerData.jacksot.spins--;
            // Cập nhật giao diện
            spinsCountDisplay.textContent = playerData.jacksot.spins;
            playerData.money -= parseInt(betInput.value, 10);
            creditsDisplay.textContent = playerData.money.toLocaleString('vi-VN');
            document.getElementById('so-tien-hien-tai').textContent = playerData.money;

            const totalSpinTime = 1000 + Math.min(holdDuration, 4000);

            reels.forEach((reel, index) => {
                reel.classList.add('spinning');
                const interval = setInterval(() => {
                    reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                }, 100);

                setTimeout(() => {
                    clearInterval(interval);
                    reel.classList.remove('spinning');
                    reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                    if (index === reels.length - 1) {
                        checkWin(reels.map(r => r.textContent));
                    }
                }, totalSpinTime + index * 500);
            });
        }
        
        function triggerMoneyRain() { /* Giữ nguyên */ }

        function checkWin(finalSymbols) {
            let winnings = 0;
            const currentBet = parseInt(betInput.value, 10);
             // Khởi tạo mảng history nếu chưa có
            if (!playerData.jacksot.history) {
                playerData.jacksot.history = [];
            }
            
            // Tạo đối tượng lưu trữ kết quả lần quay này
            const historyEntry = {
                timestamp: Date.now(),
                bet: currentBet,
                winnings: 0, // Sẽ được cập nhật bên dưới
                result: finalSymbols
            };

            if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
                winnings = (payouts3[finalSymbols[0]] || 0) * currentBet;
            } else if (finalSymbols[0] === finalSymbols[1]) {
                winnings = (payouts2[finalSymbols[0]] || 0) * currentBet;
            } else if (finalSymbols[1] === finalSymbols[2]) {
                winnings = (payouts2[finalSymbols[1]] || 0) * currentBet;
            }

            if (winnings > 0) {
                playerData.money += winnings;
                showMessage(`THẮNG +${winnings.toLocaleString('vi-VN')}$`, 'win');
                if(winnings > currentBet * 20) triggerMoneyRain();
            } else {
                showMessage("Chúc may mắn lần sau!");
            }
              historyEntry.winnings = winnings; // Cập nhật tiền thắng
            playerData.jacksot.history.push(historyEntry);

            // Giới hạn lịch sử chỉ lưu 50 lần quay gần nhất để tránh dữ liệu quá lớn
            if (playerData.jacksot.history.length > 50) {
                playerData.jacksot.history.shift(); // Xóa phần tử cũ nhất
            }
            
            creditsDisplay.textContent = playerData.money.toLocaleString('vi-VN');
            document.getElementById('so-tien-hien-tai').textContent = playerData.money;
            isSpinning = false;

              // Chỉ bật lại nút Quay nếu người chơi còn lượt
            if (playerData.jacksot.spins > 0) {
                spinButton.disabled = false;
            } else {
                showMessage("Đã hết lượt quay!");
            }
        }

        function populatePayoutTable() {
            let tableHTML = '<h4 style="font-weight: 700; color: #fcd34d;">Thắng 3 Biểu Tượng</h4>';
            tableHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 1rem; font-size: 0.875rem; background-color: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 0.375rem;">';
            Object.entries(payouts3).sort(([,a],[,b]) => b-a).forEach(([symbol, payout]) => {
                tableHTML += `<div>${symbol.repeat(3)}</div><div style="text-align: right; font-weight: 600;">x${payout}</div>`;
            });
            tableHTML += '</div>';
            tableHTML += '<h4 style="font-weight: 700; color: #fcd34d; margin-top: 0.75rem;">Thắng 2 Biểu Tượng</h4>';
            tableHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 1rem; font-size: 0.875rem; background-color: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 0.375rem;">';
            Object.entries(payouts2).sort(([,a],[,b]) => b-a).forEach(([symbol, payout]) => {
                tableHTML += `<div>${symbol.repeat(2)}-</div><div style="text-align: right; font-weight: 600;">x${payout}</div>`;
            });
            tableHTML += '</div>';
            payoutTableContainer.innerHTML = tableHTML;
        }
        
        helpButton.addEventListener('click', () => {
            // Gọi hàm hiển thị modal hướng dẫn từ file mới
            if (typeof window.showJackslotHelpModal === 'function') {
                window.showJackslotHelpModal();
            } else {
                console.error("Lỗi: Hàm showJackslotHelpModal() không tồn tại!");
            }
        });
         historyButton.addEventListener('click', () => {
            if (typeof window.showJackslotHistoryModal === 'function') {
                window.showJackslotHistoryModal();
            }
        });
    }
});

/* END OF FILE JS/modal_jackslot.js */