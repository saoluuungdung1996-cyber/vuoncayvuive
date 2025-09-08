function updateHoldingSeedPopup() {
    if (!currentlyHoldingSeed && !currentlyHoldingItem) {
        hideHoldingSeedPopup();
        return;
    }

    const popup = document.getElementById('seed-holding-popup');
    const message = document.getElementById('seed-holding-message');
    if (!popup || !message) return;

    let itemId, itemInfo, quantity, actionText;

    if (currentlyHoldingSeed) {
        itemId = currentlyHoldingSeed;
        itemInfo = allGameItems[itemId];
        quantity = playerData.inventory.seeds[itemId] || 0; // Lấy số lượng hạt giống
        actionText = 'Chọn vào ô đất trống để gieo hạt.';
    } else { // Chắc chắn là currentlyHoldingItem
        itemId = currentlyHoldingItem;
        itemInfo = allGameItems[itemId];
        
        if (itemId === 'binh-tuoi') {
            const toolData = playerData.inventory.tools[itemId];
            actionText = `Số lít nước còn lại: ${toolData.currentWater.toFixed(1)} / ${itemInfo.maxWater} L` +
                         `\n<small>Chọn vào ô đất để tưới.</small>`;
            quantity = toolData.owned || 0;
        } else {
            // Các vật phẩm khác
            quantity = playerData.inventory.items[itemId] || 0;
            if (itemId === 'thuoc-xit-co') {
                 actionText = 'Chọn vào ô đất có cỏ để sử dụng.';
            } else if (itemId === 'thuoc-tru-sau'){
                 actionText = 'Chọn vào ô đất có sâu bệnh để sử dụng.';
            } else if (itemId === 'phan-bon-tang-truong' || itemId === 'phan-bon-phuc-hoi'){
                 actionText = 'Chọn vào cây trồng đang phát triển để sử dụng.';
            } else {
                actionText = 'Chọn vào một ô đất để sử dụng.';
            }
        }
    }
    
    if (quantity <= 0) {
        hideHoldingSeedPopup();
        return;
    }
    
    if (itemInfo) {
        let quantityBadgeHTML = `<span class="seed-quantity-badge">${quantity}</span>`;
        
        // Không hiển thị badge số lượng cho bình tưới vì nó luôn là 1
        if (itemId === 'binh-tuoi') {
             message.innerHTML = `Bạn đang giữ: ${itemInfo.name}\n<small>${actionText}</small>`;
        } else {
            message.innerHTML = 
                `Bạn đang giữ: ${itemInfo.name} ${quantityBadgeHTML}` +
                `\n<small>${actionText}</small>`;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM cần thiết
    const plotActionModal = document.getElementById('plot-action-modal');
    const plotActionTitle = document.getElementById('plot-action-title');
    const closeButton = document.querySelector('.hanhdong-close-button');
    const gieoHatButton = document.getElementById('gieo-hat-button');
    const thuHoachButton = document.getElementById('thu-hoach-button');
    const deVaoKhoButton = document.getElementById('de-vao-kho-button');
    const xoiBoCayButton = document.getElementById('xoibocay-button');
    const tuoiNuocDryPlotBtn = document.getElementById('tuoi-nuoc-dry-plot-btn');
    // Lấy tất cả các container ô đất không bị khoá
    const plotContainers = document.querySelectorAll('.plot-container:not(.odat-locked)');
    const donCoButton = document.getElementById('don-co-button');
     const bonPhanEmptyPlotBtn = document.getElementById('bon-phan-empty-plot-btn');
     const phunThuocEmptyPlotBtn = document.getElementById('phun-thuoc-empty-plot-btn');
    
       
    if (bonPhanEmptyPlotBtn) {
        bonPhanEmptyPlotBtn.addEventListener('click', () => {
            const plotNumber = plotActionModal.dataset.currentPlot;
            if (plotNumber) {
                closeModal(); // Đóng modal hành động hiện tại
                // Gọi hàm hiển thị modal chọn phân bón
                if (typeof window.showFertilizerSelectionModal === 'function') {
                    setTimeout(() => window.showFertilizerSelectionModal(plotNumber), 200);
                }
            }
        });
    }

    if (tuoiNuocDryPlotBtn) {
        tuoiNuocDryPlotBtn.addEventListener('click', () => {
            const plotNumber = plotActionModal.dataset.currentPlot;
            closeModal(); // Đóng modal hành động
            // Mở modal tưới nước (hàm từ modal-tuoinuoc.js)
            if (typeof window.showWateringModal === 'function') {
                setTimeout(() => window.showWateringModal(plotNumber), 200);
            }
        });
    }
      if (phunThuocEmptyPlotBtn) {
        phunThuocEmptyPlotBtn.addEventListener('click', () => {
            const plotNumber = plotActionModal.dataset.currentPlot;
            if (plotNumber) {
                closeModal(); // Đóng modal hành động
                // Mở modal lựa chọn cách diệt sâu
                if (typeof window.showPestChoiceModal === 'function') {
                    setTimeout(() => {
                        window.showPestChoiceModal(plotNumber);
                    }, 200); // Delay nhỏ cho mượt
                }
            }
        });
    }



     function showHoldingSeedPopup(seedId) {
        const seedHoldingPopup = document.getElementById('seed-holding-popup');
        const seedHoldingMessage = document.getElementById('seed-holding-message');

        if (!seedId || !seedHoldingPopup || !seedHoldingMessage) return;

         const menuButton = document.querySelector('.menu-button');
        if (menuButton) {
            menuButton.classList.add('disabled');
        }

        const itemInfo = allGameItems[seedId];
        const seedQuantity = playerData.inventory.seeds[seedId] || 0;
        
        if (!itemInfo) return;

        // Cập nhật nội dung thông báo, bao gồm cả số lượng
        seedHoldingMessage.innerHTML = 
            `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${seedQuantity}</span>` +
            `\n<small>Chọn vào ô đất trống để gieo hạt.</small>`;

        // Hiển thị popup
        seedHoldingPopup.classList.add('show');
    }



    // Hàm để đóng modal hành động
     window.closeModal = function() {
        if (plotActionModal) {
            plotActionModal.style.display = 'none';
        }
    }

   
    /**
     * Gán sự kiện click để mở modal hành động cho một ô đất.
     * @param {HTMLElement} plotContainer - Phần tử .plot-container cần gán sự kiện.
     */
     window.applyPlotClickListener = function(plotContainer) {
        plotContainer.addEventListener('click', () => {
             if (currentFarmView.mode !== 'own') {
                showGeneralNotification("Bạn chỉ có thể ngắm nhìn khu vườn của bạn bè thôi!", "info");
                return; // Dừng lại, không cho phép tương tác
            }
            const plotNumber = plotContainer.dataset.plotNumber;
            const plotData = playerData.farmPlots[plotNumber];


               // ƯU TIÊN #1: Xử lý khi người chơi đang cầm một vật phẩm
            if (currentlyHoldingItem) {
                if (handleItemHoldingClick(plotNumber)) {
                    return; // Nếu đã xử lý, dừng mọi hành động khác
                }
            }
             // ƯU TIÊN #1: Xử lý khi người chơi đang cầm Thuốc trừ sâu
            if (currentlyHoldingItem === 'thuoc-tru-sau') {
                const plotNumber = plotContainer.dataset.plotNumber;
                const plotData = playerData.farmPlots[plotNumber];

                // Kiểm tra xem ô đất này có sâu bệnh không
                if (plotData && plotData.hasPest) {
                    // Gọi hàm xử lý phun thuốc đã có sẵn
                    window.applyPesticide(plotNumber);

                    // Cập nhật lại số lượng trên popup hoặc ẩn đi nếu hết
                    const newQuantity = playerData.inventory.items['thuoc-tru-sau'] || 0;
                    if (newQuantity > 0) {
                        const badge = document.querySelector('#seed-holding-popup .seed-quantity-badge');
                        if (badge) badge.textContent = newQuantity;
                    } else {
                        hideHoldingSeedPopup(); // Tự động đóng popup khi hết thuốc
                    }

                } else {
                    // Thông báo cho người chơi biết ô đất này không có sâu
                    if (typeof window.showGeneralNotification === 'function') {
                        window.showGeneralNotification('Ô đất này không có sâu bệnh.', 'warning');
                    }
                }
                return; // Dừng mọi hành động khác
            }
             
            const farmPlots = playerData.farmPlots || {}; 
           
             // ƯU TIÊN #0: Nếu ô đất đang được cải tạo, chỉ cần render lại để làm mới timer và dừng lại.
            if (plotData?.restoration?.active) {
                console.log(`Làm mới hiển thị timer cải tạo cho ô đất ${plotNumber}.`);
                renderSinglePlot(plotNumber); // Gọi hàm render để cập nhật lại giao diện timer
                return; // Dừng mọi hành động khác
            }
             // ƯU TIÊN #0.5: Nếu ô đất đang dọn cỏ, chỉ render lại timer và dừng
            if (plotData?.cleaningWeeds?.active) {
                console.log(`Làm mới hiển thị timer dọn cỏ cho ô đất ${plotNumber}.`);
                renderSinglePlot(plotNumber);
                return;
            }
             // ƯU TIÊN #0.6: Nếu ô đất đang được xịt thuốc, chỉ làm mới timer và dừng
            if (plotData?.isSprayingWeeds?.active) {
                console.log(`Làm mới hiển thị timer xịt cỏ cho ô đất ${plotNumber}.`);
                renderSinglePlot(plotNumber); // Gọi render để cập nhật lại giao diện timer
                return; // Dừng mọi hành động khác, không mở modal
            }
            const hasPlant = plotData && plotData.seedId; // Kiểm tra cụ thể xem có cây không
             // Reset trạng thái hiển thị của tất cả các nút trong modal hành động
                // Việc này đảm bảo không có nút nào từ lần click trước bị "sót lại"
                thuHoachButton.classList.add('hidden-action');
                deVaoKhoButton.classList.add('hidden-action');
                xoiBoCayButton.classList.add('hidden-action');
                gieoHatButton.classList.add('hidden-action');
                if (bonPhanEmptyPlotBtn) bonPhanEmptyPlotBtn.classList.add('hidden-action');
                if (tuoiNuocDryPlotBtn) tuoiNuocDryPlotBtn.classList.add('hidden-action');
                 if (donCoButton) donCoButton.classList.add('hidden-action');
                  if (phunThuocEmptyPlotBtn) phunThuocEmptyPlotBtn.classList.add('hidden-action');
                 
                 
                // Cập nhật độ phì nhiêu dạng văn bản trong modal
            const plotFertilityDisplay = document.getElementById('plot-fertility-display');
            if (plotFertilityDisplay) {

                 const fertility = plotData?.soilFertility ?? 100;
                const maxFertility = plotData?.maxFertility || 100;
                plotFertilityDisplay.textContent = `Độ phì nhiêu: ${Math.round(fertility)} / ${maxFertility}%`;
            }
           
            // =========================================================
            //  LOGIC ƯU TIÊN MỚI
            // =========================================================
              // ƯU TIÊN #0: Kiểm tra trạng thái đặc biệt (đang cải tạo, bị cháy xém)
            if (plotData?.restoration?.active) {
                console.log(`Ô đất ${plotNumber} đang được cải tạo.`);
                return; // Không làm gì cả
            }
            if (plotData?.groundState?.startsWith('scorched_')) {
                if (typeof window.showRestorationModal === 'function') {
                    window.showRestorationModal(plotNumber);
                }
                return; // Mở modal cải tạo và dừng
            }
            // ƯU TIÊN #1: Nếu đang cầm hạt và click vào ô đất trống -> Gieo ngay!
            if (currentlyHoldingSeed && !hasPlant) {
                plantSeedOnPlot(plotNumber, currentlyHoldingSeed);
                
                // Dừng hàm tại đây, không làm gì thêm nữa.
                return; 
            }
            // ƯU TIÊN #1.5: Nếu đang cầm Thuốc xịt cỏ và click vào ô đất có cỏ
            if (currentlyHoldingItem === 'thuoc-xit-co') {
                const weedCount = plotData?.weedCount ?? 0;
                // Chỉ thực hiện khi ô đất có cỏ
                if (weedCount > 0) {
                    // 1. Trừ vật phẩm khỏi kho
                    playerData.inventory.items['thuoc-xit-co']--;
                    
                    // 2. Cập nhật lại popup thông báo đang cầm
                    updateHoldingSeedPopup(); 

                    // 3. Tính toán thời gian
                    const totalTimeMs = 20 * 1000; // Cố định 20 giây cho việc xịt cỏ

                    // 4. Thiết lập trạng thái đang xịt cỏ cho ô đất
                    plotData.isSprayingWeeds = {
                        active: true,
                        endTime: Date.now() + totalTimeMs,
                        totalDuration: totalTimeMs
                    };
                    
                    console.log(`Bắt đầu xịt ${weedCount} bụi cỏ trên ô ${plotNumber}. Sẽ xong sau ${totalTimeMs / 1000} giây.`);
                    
                    // 5. Render lại ô đất để hiển thị timer
                    renderSinglePlot(plotNumber);
                    
                    // 6. Nếu hết thuốc, đóng popup
                    if ((playerData.inventory.items['thuoc-xit-co'] || 0) <= 0) {
                        hideHoldingSeedPopup();
                    }
                    
                    return; // Dừng tại đây, không mở modal hành động
                }
            }
         

             if (currentlyHoldingItem && allGameItems[currentlyHoldingItem]?.effects?.fertilityRestore) {
                // START - THAY THẾ TOÀN BỘ LOGIC BÓN PHÂN BẰNG KHỐI NÀY
                const itemId = currentlyHoldingItem;
                const itemInfo = allGameItems[itemId];

                // A. Kiểm tra điều kiện trước khi bắt đầu
                if (plotData && plotData.isFertilizing) {
                    console.log(`Ô ${plotNumber} đang được bón phân, vui lòng đợi.`);
                    return; // Ngăn spam click
                }
                if (!playerData.inventory.items[itemId] || playerData.inventory.items[itemId] <= 0) {
                    alert("Bạn không có vật phẩm này!");
                    hideHoldingSeedPopup();
                    return;
                }



                // B. Bắt đầu quá trình bón phân
                // 1. Trừ vật phẩm ngay lập tức
                playerData.inventory.items[itemId]--;

                // Ghi nhận thành tựu khi sử dụng "Phân bón Hữu cơ" trực tiếp từ kho đồ
if (itemId === 'phan-bon-huu-co' && typeof window.updateAchievementStat === 'function') {
    updateAchievementStat('organicFertilizerUsed', 1);
}
                
                // 2. Tạo và hiển thị icon hiệu ứng
                const effectIcon = document.createElement('img');
                effectIcon.src = itemInfo.inventoryImage; // Lấy ảnh từ allGameItems
                effectIcon.className = 'fertilizing-effect-icon';
                plotContainer.appendChild(effectIcon);

                // 3. Cập nhật trạng thái ô đất là "đang bón phân"
                if (!playerData.farmPlots[plotNumber]) {
                    playerData.farmPlots[plotNumber] = {};
                }
                playerData.farmPlots[plotNumber].isFertilizing = true;
                plotData = playerData.farmPlots[plotNumber]; // Cập nhật lại biến

                // 4. Cập nhật popup
                const popup = document.getElementById('seed-holding-popup');
                const badge = popup.querySelector('.seed-quantity-badge');
                if (badge) {
                    badge.textContent = playerData.inventory.items[itemId];
                }
                     // Kích hoạt animation thanh tiến trình bón phân
                if (typeof triggerFertilizingAnimation === 'function') {
                    triggerFertilizingAnimation(plotContainer);
                }
                // 5. Đặt hẹn giờ để hoàn thành hành động   
                setTimeout(() => {
                    // 6. Áp dụng hiệu ứng sau khi delay
                    const currentFertility = plotData.soilFertility ?? 100;

                    const maxFertility = plotData.maxFertility || 100; // Lấy độ phì nhiêu tối đa của ô đất, mặc định là 100
                    const newFertility = Math.min(maxFertility, currentFertility + itemInfo.effects.fertilityRestore);
                    plotData.soilFertility = newFertility;
                      // Nếu đất đã được cải tạo, mức phạt tích lũy sẽ được xóa bỏ
                    plotData.barrenPenaltyPercent = 0;
                    console.log(`Đã bón phân, thời gian phạt trên ô ${plotNumber} được reset về 0%.`);

                    console.log(`Đã bón phân xong cho ô ${plotNumber}. Độ phì nhiêu mới: ${newFertility}%`);

                    // 7. Xóa icon hiệu ứng
                    effectIcon.remove();
                     // Xóa trạng thái cháy xém (nếu có) để đất trở lại bình thường
                    if (plotData.groundState) {
                        delete plotData.groundState;
                        console.log(`Ô đất ${plotNumber} đã được cải tạo sau khi bị sét đánh.`);
                    }
                    // 8. Reset trạng thái ô đất
                    plotData.isFertilizing = false;

                    // 9. Cập nhật lại giao diện thanh độ phì nhiêu
                    renderSinglePlot(plotNumber);

                     // Ẩn thanh tiến trình bón phân sau khi hoàn thành
                    if (typeof hideFertilizingAnimation === 'function') {
                        hideFertilizingAnimation(plotContainer);
                    }


                    // 10. Kiểm tra nếu hết vật phẩm thì đóng popup
                    if (playerData.inventory.items[itemId] <= 0) {
                        hideHoldingSeedPopup();
                    }
                }, 3000); // 3000 milliseconds = 3 giây

                // Dừng hàm tại đây, không mở modal hành động
                return;
                
            }


            // ƯU TIÊN #2: Nếu không thỏa mãn điều kiện trên, mới mở Modal hành động
            plotActionModal.dataset.currentPlot = plotNumber;
            plotActionTitle.textContent = `Hành động cho ô đất ${plotNumber}`;

            if (hasPlant) {



                const health = plotData.health ?? 100;

                if (health <= 0) {
                    const plantInfo = allGameItems[plotData.seedId];
                    const plantName = plantInfo ? plantInfo.name : "Không rõ";
                    const reason = plotData.deathReason || 'unknown';

                    let reasonText = "Không rõ nguyên nhân";
                    switch (reason) {
                        case 'fire':
                            reasonText = "Bị lửa thiêu rụi";
                            break;
                        case 'failed_to_sprout':
                            reasonText = "Không thể nảy mầm trên đất khô";
                            break;
                        case 'drought':
                            reasonText = "Chết vì khô hạn";
                            break;
                        case 'pest':
                            reasonText = "Bị sâu bệnh phá hoại";
                            break;
                    }
                    
                    plotActionTitle.innerHTML = `${plantName} đã chết <br><small style="color: #e74c3c;">(${reasonText})</small>`;
                    
                      
                    xoiBoCayButton.classList.remove('hidden-action');
                    plotActionModal.style.display = 'flex';
                } else if (isPlantReady(plotNumber)) {




                    // CÂY ĐÃ CHÍN: Hiển thị các nút thu hoạch
                    thuHoachButton.classList.remove('hidden-action');
                    deVaoKhoButton.classList.remove('hidden-action');
                    xoiBoCayButton.classList.remove('hidden-action');
                    plotActionModal.style.display = 'flex';
                } else {
                    // CÂY CHƯA CHÍN: Mở modal chăm sóc cây
                    if (typeof window.showCareModal === 'function') {
                        window.showCareModal(plotNumber);
                    } else {
                        console.error("Hàm showCareModal() không tồn tại.");
                    }
                }
            } else {
                 // --- TRƯỜNG HỢP: Ô ĐẤT TRỐNG ---
                  // Luôn hiển thị nút "Gieo hạt" khi đất không cằn cỗi
                    if (currentFarmView.mode === 'own') {
                        gieoHatButton.classList.remove('hidden-action'); 
                    }
                 const hasWeeds = plotData && plotData.weeds && plotData.weeds.length > 0;
                const isDry = plotData?.isDry ?? false;
                const isBarren = (plotData?.soilFertility ?? 100) <= 0;

                
                

                 const hasPest = plotData?.hasPest ?? false;
                const hasWateringCan = playerData.inventory.tools && playerData.inventory.tools['binh-tuoi']?.owned > 0;

                // ƯU TIÊN: Nếu có sâu bệnh, luôn hiển thị nút diệt sâu
                if (hasPest) {
                    phunThuocEmptyPlotBtn.classList.remove('hidden-action');
                    const sprayBtnText = phunThuocEmptyPlotBtn.querySelector('span');
                    sprayBtnText.textContent = `Diệt sâu bệnh`;
                    phunThuocEmptyPlotBtn.disabled = false; 
                }
               
                // TRƯỜNG HỢP 1: Đất bị cằn cỗi (isBarren)
                if (isBarren) {
                    bonPhanEmptyPlotBtn.classList.remove('hidden-action');
                   // Nếu có cỏ -> Hiển thị nút Dọn cỏ
                    if (hasWeeds) {
                        donCoButton.classList.remove('hidden-action');
                    }
                    // Nếu bị khô -> Hiển thị nút Tưới nước (kiểm tra này giờ đã độc lập với cỏ)
                    if (isDry && hasWateringCan) {
                        tuoiNuocDryPlotBtn.classList.remove('hidden-action');
                    }
                    // Nút Gieo hạt luôn hiển thị khi đất cằn cỗi (dù có thể bị vô hiệu hóa ở logic khác)
                    gieoHatButton.classList.remove('hidden-action');
                } 
                // TRƯỜNG HỢP 2: Đất không cằn cỗi (!isBarren)
                else {
                    // Luôn hiển thị nút "Gieo hạt" khi đất không cằn cỗi
                    gieoHatButton.classList.remove('hidden-action'); 
                    // Nếu đất không cằn cỗi, vẫn cho phép bón phân để tăng độ phì nhiêu
                    bonPhanEmptyPlotBtn.classList.remove('hidden-action');

                    // Nếu có cỏ -> Hiển thị thêm nút Dọn cỏ
                    if (hasWeeds) {
                        donCoButton.classList.remove('hidden-action');
                          // Nếu đất không cằn cỗi + có cỏ + bị khô hạn => hiển thị nút tưới nước
                        if (isDry && hasWateringCan) {
                            tuoiNuocDryPlotBtn.classList.remove('hidden-action');
                        }
                    } 
                    // Nếu bị khô -> Hiển thị thêm nút Tưới nước
                    else if (isDry && hasWateringCan) {
                        tuoiNuocDryPlotBtn.classList.remove('hidden-action');
                    } 
                    // Nếu đất hoàn hảo (không cỏ, không khô) -> Hiển thị thêm nút Bón phân
                    else {
                        bonPhanEmptyPlotBtn.classList.remove('hidden-action');
                    }
                }

                // Cập nhật text cho các nút (logic này được giữ nguyên)
                const playerSeeds = playerData.inventory.seeds || {};
                const seedTypesCount = Object.keys(playerSeeds).filter(key => playerSeeds[key] > 0).length;
                const gieoHatButtonTextSpan = gieoHatButton.querySelector('span');
                if (gieoHatButtonTextSpan) {
                    gieoHatButtonTextSpan.textContent = seedTypesCount > 0 ? `Gieo hạt (có ${seedTypesCount} loại)` : 'Gieo hạt';
                }

                let fertilizerTypesCount = 0;
                const playerItems = playerData.inventory.items || {};
                for (const itemId in playerItems) {
                    if (playerItems[itemId] > 0) {
                        const itemData = allGameItems[itemId];
                        // KIỂM TRA MỚI: Vật phẩm có hiệu ứng phục hồi độ phì nhiêu HOẶC hiệu ứng tăng trưởng
                        if (itemData?.effects && (itemData.effects.fertilityRestore || itemData.effects.growthBoostPercent || itemData.effects.pestProtectionDurationMs || itemData.effects.healthRestorePercent)) {
                            fertilizerTypesCount++;
                        }
                    }
                }
                const bonPhanBtnText = bonPhanEmptyPlotBtn.querySelector('span');
                if (bonPhanBtnText) {
                    bonPhanBtnText.textContent = fertilizerTypesCount > 0 ? `Bón phân (có ${fertilizerTypesCount} loại)` : 'Bón phân';
                }
                // Cập nhật text cho nút Dọn cỏ (nếu hiển thị)
                if(hasWeeds) {
                     donCoButton.querySelector('span').textContent = `Dọn cỏ (${plotData.weeds.length} bụi)`;
                }
                
                plotActionModal.style.display = 'flex';
            }
        
        });
    }

    
    // Áp dụng hàm cho tất cả các ô đất có sẵn khi trang tải
    plotContainers.forEach(applyPlotClickListener);
    
    // Đưa hàm ra toàn cục để file modal-odatbikhoa.js có thể gọi
    window.applyPlotClickListener = applyPlotClickListener;
    // END: KẾT THÚC KHỐI CODE ĐƯỢC TÁCH

    // Sự kiện cho nút đóng (X)
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Sự kiện đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target === plotActionModal) {
            closeModal();
        }
    });

    // Sự kiện cho nút "Gieo hạt"
    if (gieoHatButton) {
        gieoHatButton.addEventListener('click', () => {
            closeModal();
            openInventoryForSeedSelection((selectedSeedId) => {
                currentlyHoldingSeed = selectedSeedId;
                const seedHoldingPopup = document.getElementById('seed-holding-popup');
                const seedHoldingMessage = document.getElementById('seed-holding-message');
                const itemInfo = allGameItems[selectedSeedId];
                const seedQuantity = playerData.inventory.seeds[selectedSeedId] || 0;
                
                if (seedHoldingPopup && seedHoldingMessage && itemInfo) {
                      const menuButton = document.querySelector('.menu-button');
                    if (menuButton) {
                        menuButton.classList.add('disabled');
                    }
                    seedHoldingMessage.innerHTML = 
                        `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${seedQuantity}</span>` +
                        `\n<small>Chọn vào ô đất trống để gieo hạt.</small>`;
                    seedHoldingPopup.classList.add('show');
                }
            });
        });
    }
    
   

    // Sự kiện cho nút "Thu hoạch"
    if (thuHoachButton) {
        thuHoachButton.addEventListener('click', () => {
            const plotNumber = plotActionModal.dataset.currentPlot;
            if (plotNumber) {
                harvestPlot(plotNumber);
                closeModal();
            }
        });
    }
    if (deVaoKhoButton) {
    deVaoKhoButton.addEventListener('click', () => {
        const plotNumber = plotActionModal.dataset.currentPlot;
        if (plotNumber) {
            // Gọi hàm mới từ file cay-devaokho.js
            storeHarvestedItem(plotNumber);
            closeModal();
        }
    });
}
  if (xoiBoCayButton) {
        xoiBoCayButton.addEventListener('click', () => {
            const plotNumber = plotActionModal.dataset.currentPlot;
            if (plotNumber) {
                // Đóng modal hành động hiện tại
                closeModal();
                // Mở modal xác nhận mới
                if (typeof window.showUprootConfirmModal === 'function') {
                    // Thêm một chút delay để hiệu ứng chuyển đổi mượt hơn
                    setTimeout(() => {
                        window.showUprootConfirmModal(plotNumber);
                    }, 200);
                } else {
                    console.error("Hàm showUprootConfirmModal không tồn tại.");
                }
            }
        });
    }
     // Sự kiện cho nút "Dọn cỏ"
    if (donCoButton) {
         donCoButton.addEventListener('click', () => {
            const plotNumber = plotActionModal.dataset.currentPlot;
            if (!plotNumber) return;

            // Đóng modal hành động hiện tại
            closeModal();

            // Mở modal lựa chọn cách dọn cỏ
            if (typeof window.showWeedClearingChoiceModal === 'function') {
                // Thêm delay nhỏ để hiệu ứng chuyển đổi mượt mà
                setTimeout(() => {
                    window.showWeedClearingChoiceModal(plotNumber);
                }, 200);
            }
        });
    }
      
    /**
 * Xử lý sự kiện click khi người chơi đang cầm một vật phẩm nào đó.
 * Hàm này sẽ được gọi từ bên trong trình xử lý sự kiện click của ô đất.
 * @param {string} plotNumber - Số ô đất được click.
 * @returns {boolean} - Trả về true nếu sự kiện đã được xử lý (để ngăn các hành động khác).
 */
function handleItemHoldingClick(plotNumber) {
    const itemId = currentlyHoldingItem;
    if (!itemId) return false;

    const plotData = playerData.farmPlots[plotNumber];
    const itemInfo = allGameItems[itemId];
    const hasPlant = plotData && plotData.seedId;

     if (itemId === 'binh-tuoi') {
        const WATER_COST = 0.2; // Lượng nước tiêu thụ
        const toolData = playerData.inventory.tools[itemId];

        // 1. Kiểm tra điều kiện
        if (!plotData || !plotData.isDry) {
            showGeneralNotification("Ô đất này không cần tưới nước.", 'info');
            return true; // Đã xử lý, không mở modal
        }
        if (toolData.currentWater < WATER_COST) {
            showGeneralNotification("Bình tưới không đủ nước!", 'warning');
            return true;
        }

        // 2. Thực hiện hành động tưới nước
        // Trừ nước
        toolData.currentWater -= WATER_COST;
        // Cập nhật trạng thái ô đất
        plotData.isDry = false;
        
        // 3. Thông báo và cập nhật giao diện
        showGeneralNotification(`Đã tưới nước cho ô đất ${plotNumber}.`, 'success');
        renderSinglePlot(plotNumber); // Cập nhật hình ảnh ô đất

        // 4. Cập nhật lại popup đang cầm
        // (Chúng ta cần tạo/sửa hàm updateHoldingSeedPopup để hỗ trợ cả item)
        if (typeof updateHoldingSeedPopup === 'function') {
            updateHoldingSeedPopup(); 
        }

        return true; // Đã xử lý xong, không mở modal
    }

     // Logic riêng cho "Phân bón phục hồi"
    if (itemId === 'phan-bon-phuc-hoi') {
        // 1. Kiểm tra các điều kiện
        if (!hasPlant) {
            showGeneralNotification("Phân bón này chỉ dùng cho cây đang trồng!", 'warning');
            return true; // Đã xử lý, không mở modal
        }
        const plantInfo = allGameItems[plotData.seedId];
        if (plantInfo.requiredLevel > itemInfo.effects.maxApplicableLevel) {
            showGeneralNotification(`Loại phân bón này không dùng được cho cây cấp ${plantInfo.requiredLevel}.`, 'warning');
            return true;
        }
        if ((plotData.health ?? 100) >= 100) {
            showGeneralNotification("Cây trồng đã đầy sức khỏe!", 'warning');
            return true;
        }

        // 2. Trừ vật phẩm khỏi kho
        playerData.inventory.items[itemId]--;
        
        // 3. Áp dụng hiệu ứng phục hồi
        const currentHealth = plotData.health ?? 100;
        plotData.health = Math.min(100, currentHealth + itemInfo.effects.healthRestorePercent);
        
        // 4. Hiệu ứng hình ảnh
        const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
        if (plotContainer) {
            const effectIcon = document.createElement('img');
            effectIcon.src = itemInfo.inventoryImage;
            effectIcon.className = 'fertilizing-effect-icon';
            plotContainer.appendChild(effectIcon);
            setTimeout(() => effectIcon.remove(), 2000);
        }

        // 5. Thông báo và cập nhật giao diện
        showGeneralNotification(`Đã phục hồi ${itemInfo.effects.healthRestorePercent}% sức khỏe!`, 'success');
        logPlantEvent(plotNumber, 'positive', `Được bón Phân bón Phục hồi.`);
        renderSinglePlot(plotNumber);

        // 6. Cập nhật lại popup đang cầm
        updateHoldingSeedPopup(); 

        return true; // Đã xử lý xong, không mở modal
    }
    // Logic riêng cho "Phân bón bảo vệ"
    if (itemId === 'phan-bon-bao-ve') {
        if (!hasPlant) {
            showGeneralNotification("Phân bón này chỉ có thể dùng cho ô đất đang có cây!", 'warning');
            return true; // Đã xử lý, ngăn không cho mở modal
        }
        // Nếu có cây, gọi hàm xử lý
        window.applyProtectionFertilizer(plotNumber, itemId);
        return true; // Đã xử lý
    }
    
    // Logic cho phân bón tăng trưởng (đã có)
    if (itemId === 'phan-bon-tang-truong') {
        if (hasPlant && !isPlantReady(plotNumber)) {
             window.applyGrowthFertilizer(plotNumber, currentlyHoldingItem);
             return true;
        } else {
             showGeneralNotification("Phân bón này chỉ dùng cho cây đang lớn!", 'warning');
             return true;
        }
    }
    // Logic riêng cho "Nông dân dọn cỏ"
    if (itemId === 'nong-dan-don-co') {
        // 1. Kiểm tra các điều kiện cần thiết
        if (!plotData || !plotData.weeds || plotData.weeds.length === 0) {
            showGeneralNotification("Ô đất này không có cỏ dại để dọn.", 'warning');
            return true; // Đã xử lý, không mở modal
        }
        
          if (plotData.cleaningWeeds?.active) {
            showGeneralNotification("Ô đất này đang được dọn dẹp!", 'warning');
            return true;
        }

        // 2. Nếu đủ điều kiện, bắt đầu quá trình dọn cỏ (tái sử dụng logic từ modal-donco.js)
        // Trừ vật phẩm
        playerData.inventory.items['nong-dan-don-co']--;

       

        const weedCount = plotData.weeds.length;
        const SECONDS_PER_WEED = 3;
        const totalTimeMs = weedCount * SECONDS_PER_WEED * 1000;

        // Thêm icon và thiết lập trạng thái đang dọn dẹp
        if (typeof addClearingIcon === 'function') {
            addClearingIcon(plotNumber, 'Pics/Cuahang/Vatpham/nongdandonco.png');
        }
        plotData.cleaningWeeds = {
            active: true,
            endTime: Date.now() + totalTimeMs,
            totalDuration: totalTimeMs,
            cleanerType: 'hired'
        };

        // 3. Cập nhật giao diện và thông báo
        showGeneralNotification(`Một nông dân đã bắt đầu dọn cỏ tại ô đất ${plotNumber}!`, 'success');
        renderSinglePlot(plotNumber);
        updateHoldingSeedPopup(); // Cập nhật lại số lượng trên popup

        // Nếu hết vật phẩm, đóng popup
        if ((playerData.inventory.items['nong-dan-don-co'] || 0) <= 0) {
            hideHoldingSeedPopup();
        }

        return true; // Đã xử lý xong, không mở modal
    }

    // ... có thể thêm logic cho các vật phẩm khác ở đây trong tương lai ...

    return false; // Chưa xử lý, cho phép các hành độang khác tiếp tục
}
});