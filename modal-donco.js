/* START OF FILE JS/modal-donco.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal lựa chọn
    const modal = document.getElementById('weed-clearing-choice-modal');
    if (!modal) return;
    const closeBtn = modal.querySelector('.weed-choice-close-button');
    const manualBtn = document.getElementById('manual-clean-btn');
    const sprayBtn = document.getElementById('spray-clean-btn');
     const hireBtn = document.getElementById('hire-cleaner-btn');
     const buffaloBtn = document.getElementById('buffalo-clean-btn');
    let currentPlotNumber = null;

     /**
     * Helper function to add the cleaning method icon to the plot.
     * @param {string} plotNumber The number of the plot.
     * @param {string} iconSrc The source path for the icon image.
     */
    function addClearingIcon(plotNumber, iconSrc) {
        const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
        if (!plotContainer) return;

        // Xóa icon cũ nếu có để tránh trùng lặp
        const oldIcon = plotContainer.querySelector('.clearing-method-icon');
        if (oldIcon) oldIcon.remove();

        // Tạo và thêm icon mới
        const icon = document.createElement('img');
        icon.src = iconSrc;
        icon.className = 'clearing-method-icon';
        plotContainer.appendChild(icon);
    }
    // Hàm ẩn modal
    function hideWeedClearingChoiceModal() {
        modal.classList.remove('visible');
    }

    // Hàm hiển thị modal (sẽ được gọi từ hanhdong-odattrong.js)
        window.showWeedClearingChoiceModal = (plotNumber) => {
        currentPlotNumber = plotNumber;
        const plotData = playerData.farmPlots[plotNumber];
        
        // Kiểm tra xem có trâu đang hoạt động trên ô đất này không
        const isBuffaloActive = plotData?.buffalo?.active;
       
        // Kiểm tra xem người chơi có thuốc xịt cỏ không
        const sprayAmount = playerData.inventory.items['thuoc-xit-co'] || 0;
        const sprayBtnText = sprayBtn.querySelector('span');

       
        if (isBuffaloActive) {
            sprayBtn.disabled = true;
            sprayBtnText.textContent = 'Thuốc diệt cỏ (Trâu đang ăn)';
        } else if (sprayAmount > 0) {
       
            sprayBtn.disabled = false;
            sprayBtnText.textContent = `Thuốc diệt cỏ (${sprayAmount})`;
        } else {
            sprayBtn.disabled = true;
            sprayBtnText.textContent = 'Thuốc diệt cỏ (Hết)';
        }

          // Kiểm tra xem có đang dọn cỏ ở ô khác không
         // Nút dọn thủ công (của người chơi)
       
        if (isBuffaloActive) {
            manualBtn.disabled = true;
            manualBtn.querySelector('span').textContent = 'Dọn thủ công (Trâu đang ăn)';
        } else if (window.cleaningTaskSlots.player) {
       
            manualBtn.disabled = true;
            manualBtn.querySelector('span').textContent = 'Dọn thủ công (Đang bận)';
        } else {
            manualBtn.disabled = false;
            manualBtn.querySelector('span').textContent = 'Dọn thủ công';
        }

        // Nút gọi người dọn cỏ
          const cleanerItemCount = playerData.inventory.items['nong-dan-don-co'] || 0;
        const hireBtnSpan = hireBtn.querySelector('span');

     
         // Logic kiểm tra nút "Gọi người dọn cỏ" MỚI
        if (isBuffaloActive) {
            hireBtn.disabled = true;
            hireBtnSpan.textContent = 'Gọi người dọn cỏ (Trâu đang ăn)';
        } else if (plotData?.cleaningWeeds?.active) {
            // Kiểm tra trực tiếp xem ô đất này có đang được dọn không
            hireBtn.disabled = true;
            hireBtnSpan.textContent = 'Gọi người dọn cỏ (Đang dọn)';
        } else if (cleanerItemCount <= 0) {
            hireBtn.disabled = true;
            hireBtnSpan.textContent = 'Gọi người dọn cỏ (Hết)';
        } else {
            hireBtn.disabled = false;
            // Hiển thị số lượng hiện có
            hireBtnSpan.textContent = `Gọi người dọn cỏ (${cleanerItemCount})`;
        }

         // Nút gọi trâu
        const hasWeeds = plotData && plotData.weeds && plotData.weeds.length > 0;

        const buffaloBtnSpan = buffaloBtn.querySelector('span');
        const now = Date.now();

        // Ưu tiên kiểm tra xem ô này đã có trâu chưa
        if (plotData?.buffalo?.active) {
            buffaloBtn.disabled = true;
            buffaloBtnSpan.textContent = `Trâu đang ăn cỏ`;
        }
        // Sau đó mới kiểm tra các điều kiện khác
        else if (buffaloCooldownEndTime > now) {
            // Trâu đang trong thời gian chờ
            buffaloBtn.disabled = true;
            const remainingMs = buffaloCooldownEndTime - now;
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            buffaloBtnSpan.textContent = `Trâu nghỉ (${remainingMinutes} phút)`;
        } else if (playerData.money < 50) {
            // Không đủ tiền
            buffaloBtn.disabled = true;
            buffaloBtnSpan.textContent = `Gọi trâu (Không đủ tiền)`;
        } else if (!hasWeeds) {
            // Không có cỏ để ăn
            buffaloBtn.disabled = true;
            buffaloBtnSpan.textContent = `Gọi trâu (Hết cỏ)`;
        }
        else {
            // Đủ điều kiện
            buffaloBtn.disabled = false;
             // Kiểm tra xem có buff giảm giá không
            const buffaloDiscount = playerData.buffs?.buffaloDiscount;
            if (buffaloDiscount && buffaloDiscount.count > 0) {
                const discountedCost = BUFFALO_COST * (1 - buffaloDiscount.percentage / 100);
                buffaloBtnSpan.innerHTML = `Gọi trâu hàng xóm (<strike>${BUFFALO_COST}$</strike> ${discountedCost}$)`;
            } else {
                buffaloBtnSpan.textContent = `Gọi trâu hàng xóm (${BUFFALO_COST}$)`;
            }
        }



        modal.classList.add('visible');
    };

     // Gán sự kiện cho nút đóng
    if (closeBtn) {
        closeBtn.addEventListener('click', hideWeedClearingChoiceModal);
    }

    // Gán sự kiện đóng khi click ra ngoài nền
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideWeedClearingChoiceModal();
        }
    });
      // Sự kiện nút "Gọi trâu hàng xóm"
    if (buffaloBtn) {
        buffaloBtn.addEventListener('click', () => {
            if (buffaloBtn.disabled) return;
            
             
            
             // 1. Đóng modal lựa chọn hiện tại
            hideWeedClearingChoiceModal();
            
            // 2. Mở modal xác nhận mới (hàm từ file xacnhan_goitraudonco.js)
            if (typeof window.showBuffaloConfirmModal === 'function') {
                // Thêm delay nhỏ để hiệu ứng chuyển đổi mượt hơn
                setTimeout(() => {
                    window.showBuffaloConfirmModal(currentPlotNumber);
                }, 200);
            }
        });
    }
    // Sự kiện nút "Dọn thủ công"
    manualBtn.addEventListener('click', () => {
        if (manualBtn.disabled) return;

        // 1. Đóng modal lựa chọn hiện tại
        hideWeedClearingChoiceModal();
        
        // 2. Mở modal mini-game mới
        if (typeof window.showManualWeedModal === 'function') {
            // Thêm delay nhỏ để hiệu ứng chuyển đổi mượt hơn
            setTimeout(() => {
                window.showManualWeedModal(currentPlotNumber);
            }, 200);
        } else {
            console.error("Hàm showManualWeedModal không tồn tại!");
        }
    });

    // Sự kiện nút "Thuốc diệt cỏ"
    sprayBtn.addEventListener('click', () => {
        if (sprayBtn.disabled) return;
        const plotData = playerData.farmPlots[currentPlotNumber];
        const weedCount = plotData.weeds ? plotData.weeds.length : 0;
        if (!currentPlotNumber || weedCount <= 0) return;

        // LOGIC XỊT CỎ BẰNG THUỐC (sao chép từ hanhdong-odattrong.js)
        playerData.inventory.items['thuoc-xit-co']--;
        const totalTimeMs = 20 * 1000; // Cố định 20 giây cho việc xịt cỏ
        addClearingIcon(currentPlotNumber, 'Pics/Cuahang/Vatpham/thuocxitco.png');
        plotData.isSprayingWeeds = {
            active: true,
            endTime: Date.now() + totalTimeMs,
            totalDuration: totalTimeMs
        };
        console.log(`Bắt đầu xịt ${weedCount} bụi cỏ trên ô ${currentPlotNumber}. Sẽ xong sau ${totalTimeMs / 1000} giây.`);

        hideWeedClearingChoiceModal();
        renderSinglePlot(currentPlotNumber);
    });
     // Sự kiện nút "Gọi người dọn cỏ"
    
    if (hireBtn) {
        hireBtn.addEventListener('click', () => {
            if (hireBtn.disabled) return;
              // Trừ 1 vật phẩm "Người dọn cỏ" khỏi kho đồ của người chơi
            playerData.inventory.items['nong-dan-don-co']--;
            console.log("Đã sử dụng 1 'Người dọn cỏ'. Kho còn lại:", playerData.inventory.items['nong-dan-don-co']);
             if (typeof window.updateAchievementStat === 'function') {
                updateAchievementStat('hiredCleanersUsed', 1);
            }
            

            const plotData = playerData.farmPlots[currentPlotNumber];
            const weedCount = plotData.weeds ? plotData.weeds.length : 0;
            if (!currentPlotNumber || !plotData || weedCount <= 0) return;

            // Logic tính thời gian giống hệt dọn thủ công
            const SECONDS_PER_WEED = 3;
            const totalTimeS = weedCount * SECONDS_PER_WEED;
            const totalTimeMs = totalTimeS * 1000;
            addClearingIcon(currentPlotNumber, 'Pics/Cuahang/Vatpham/nongdandonco.png');
            plotData.cleaningWeeds = {
                active: true,
                endTime: Date.now() + totalTimeMs,
                totalDuration: totalTimeMs
            };
              addClearingIcon(currentPlotNumber, 'Pics/Cuahang/Vatpham/nongdandonco.png');
            plotData.cleaningWeeds = {
                active: true,
                endTime: Date.now() + totalTimeMs,
                totalDuration: totalTimeMs,
                cleanerType: 'hired' // Thêm dòng này để đánh dấu người thuê đang dọn
            };
            console.log(`Người dọn cỏ bắt đầu dọn ${weedCount} bụi cỏ trên ô ${currentPlotNumber}. Sẽ xong sau ${totalTimeS} giây.`);
            
            hideWeedClearingChoiceModal();
            renderSinglePlot(currentPlotNumber);
        });
    }
});

/* END OF FILE JS/modal-donco.js */