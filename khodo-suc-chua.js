/* START OF FILE JS/khodo-suc-chua.js */

/**
 * Tính toán và cập nhật hiển thị sức chứa của kho đồ.
 * Hàm này sẽ được gọi mỗi khi kho đồ được mở hoặc có sự thay đổi.
 */
window.updateInventoryCapacityDisplay = function() {
    // Lấy phần tử DOM để hiển thị
    const capacityElement = document.getElementById('inventory-capacity-display');
    if (!capacityElement) {
        console.error("Không tìm thấy phần tử #inventory-capacity-display.");
        return;
    }

    // Lấy các kho vật phẩm từ dữ liệu người chơi
    const seeds = playerData.inventory.seeds || {};
    const harvested = playerData.inventory.harvested || {};
    const items = playerData.inventory.items || {};
    const tools = playerData.inventory.tools || {};

    // Tính tổng số lượng của từng loại
    const seedCount = Object.values(seeds).reduce((sum, count) => sum + count, 0);
    const harvestedCount = Object.values(harvested).reduce((sum, count) => sum + count, 0);
    const itemCount = Object.values(items).reduce((sum, count) => sum + count, 0);
    
   
    const toolCount = Object.values(tools).reduce((sum, tool) => {
        // Kiểm tra xem 'tool' là đối tượng (như Bình tưới) hay chỉ là một con số
        if (typeof tool === 'object' && tool !== null && tool.owned) {
            return sum + tool.owned; // Nếu là object, chỉ cộng thuộc tính 'owned'
        } else if (typeof tool === 'number') {
            return sum + tool; // Nếu là số, cộng trực tiếp
        }
        return sum; // Bỏ qua nếu không phải định dạng mong muốn
    }, 0);
   
    
    // Tính tổng số lượng vật phẩm hiện có
    const totalItems = seedCount + harvestedCount + itemCount + toolCount;
    
    // Sức chứa tối đa (lấy từ cấp độ kho hiện tại)
    const warehouseLevel = playerData.warehouseLevel || 1;
    const maxCapacity = window.getMaxCapacity(warehouseLevel);

    // Cập nhật nội dung HTML
    capacityElement.innerHTML = `Sức chứa: <strong>${totalItems} / ${maxCapacity}</strong>`;
};

/**
 * Kiểm tra xem kho có đủ chỗ để thêm một lượng vật phẩm mới không.
 * @param {number} quantityToAdd - Số lượng vật phẩm dự định thêm vào.
 * @returns {boolean} - true nếu đủ chỗ, false nếu không.
 */
window.canAddToInventory = function(quantityToAdd) {
    // Lấy các kho vật phẩm từ dữ liệu người chơi
    const seeds = playerData.inventory.seeds || {};
    const harvested = playerData.inventory.harvested || {};
    const items = playerData.inventory.items || {};
    const tools = playerData.inventory.tools || {};

    // Tính tổng số lượng vật phẩm hiện có
    const seedCount = Object.values(seeds).reduce((sum, count) => sum + count, 0);
    const harvestedCount = Object.values(harvested).reduce((sum, count) => sum + count, 0);
    const itemCount = Object.values(items).reduce((sum, count) => sum + count, 0);

    
    const toolCount = Object.values(tools).reduce((sum, tool) => {
        if (typeof tool === 'object' && tool !== null && tool.owned) {
            return sum + tool.owned;
        } else if (typeof tool === 'number') {
            return sum + tool;
        }
        return sum;
    }, 0);
 

    const totalItems = seedCount + harvestedCount + itemCount + toolCount;

    // Sức chứa tối đa (lấy từ cấp độ kho hiện tại)
    const warehouseLevel = playerData.warehouseLevel || 1;
    const maxCapacity = window.getMaxCapacity(warehouseLevel);

    // Kiểm tra
    return (totalItems + quantityToAdd) <= maxCapacity;
};
/* END OF FILE JS/khodo-suc-chua.js */