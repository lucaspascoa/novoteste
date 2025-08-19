import { Product, AuditLog } from "@/api/entities";

export class StockManager {
  static async reduceStock(productId, quantity, user, reason = "Venda confirmada") {
    try {
      const products = await Product.list();
      const currentProduct = products.find(p => p.id === productId);
      
      if (!currentProduct) {
        throw new Error(`Produto com ID ${productId} não encontrado`);
      }

      const originalData = { ...currentProduct };
      const newStock = Math.max(0, (currentProduct.stock || 0) - quantity);
      
      let stockStatus = "in_stock";
      let productStatus = currentProduct.status;
      
      if (newStock === 0) {
        stockStatus = "out_of_stock";
        if (!currentProduct.allow_zero_stock) {
          productStatus = "inactive";
        }
      } else if (newStock <= (currentProduct.minimum_stock || 0)) {
        stockStatus = "low_stock";
      }

      const updatedData = {
        ...currentProduct,
        stock: newStock,
        stock_status: stockStatus,
        status: productStatus
      };

      await Product.update(productId, updatedData);

      await AuditLog.create({
        entity_name: "Product",
        entity_id: productId,
        action: "UPDATE",
        changes: {
          before: originalData,
          after: updatedData
        },
        performed_by_id: user?.id,
        performed_by_name: user?.full_name || "Sistema"
      });

      return {
        success: true,
        newStock,
        stockStatus,
        wasDeactivated: productStatus === "inactive" && originalData.status === "active"
      };
    } catch (error) {
      console.error("Erro ao reduzir estoque:", error);
      return { success: false, error: error.message };
    }
  }

  static async increaseStock(productId, quantity, user, reason = "Reposição de estoque") {
    try {
      const products = await Product.list();
      const currentProduct = products.find(p => p.id === productId);
      
      if (!currentProduct) {
        throw new Error(`Produto com ID ${productId} não encontrado`);
      }

      const originalData = { ...currentProduct };
      const newStock = (currentProduct.stock || 0) + quantity;
      
      let stockStatus = "in_stock";
      let productStatus = currentProduct.status;
      
      if (newStock <= (currentProduct.minimum_stock || 0) && newStock > 0) {
        stockStatus = "low_stock";
      }
      
      if (currentProduct.status === "inactive" && newStock > 0) {
        productStatus = "active";
      }

      const updatedData = {
        ...currentProduct,
        stock: newStock,
        stock_status: stockStatus,
        status: productStatus
      };

      await Product.update(productId, updatedData);

      await AuditLog.create({
        entity_name: "Product",
        entity_id: productId,
        action: "UPDATE",
        changes: {
          before: originalData,
          after: updatedData
        },
        performed_by_id: user?.id,
        performed_by_name: user?.full_name || "Sistema"
      });

      return {
        success: true,
        newStock,
        stockStatus,
        wasReactivated: productStatus === "active" && originalData.status === "inactive"
      };
    } catch (error) {
      console.error("Erro ao aumentar estoque:", error);
      return { success: false, error: error.message };
    }
  }

  static async processOrderStatusChange(order, oldStatus, newStatus, user) {
    const results = [];
    
    try {
      const stockReducingStatuses = ["Em preparação", "Pronto para retirada", "Saiu para entrega", "Finalizado"];
      const stockRestoringStatuses = ["Cancelado"];

      const wasStockReduced = stockReducingStatuses.includes(oldStatus);
      const shouldReduceStock = stockReducingStatuses.includes(newStatus);
      const shouldRestoreStock = stockRestoringStatuses.includes(newStatus);

      if (!wasStockReduced && shouldReduceStock) {
        for (const item of order.products) {
          const result = await this.reduceStock(
            item.id, 
            item.quantity, 
            user, 
            `Pedido ${newStatus} - #${order.id}`
          );
          results.push({ productId: item.id, action: 'reduce', result });
        }
      }

      if (shouldRestoreStock && wasStockReduced) {
        for (const item of order.products) {
          const result = await this.increaseStock(
            item.id, 
            item.quantity, 
            user, 
            `Pedido cancelado - #${order.id}`
          );
          results.push({ productId: item.id, action: 'restore', result });
        }
      }

    } catch (error) {
      console.error("Erro ao processar mudança de status do pedido:", error);
    }

    return results;
  }

  static async getLowStockProducts() {
    try {
      const products = await Product.filter({ status: "active" });
      return products.filter(product => {
        const stock = product.stock || 0;
        const minStock = product.minimum_stock || 0;
        return stock <= minStock;
      });
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error);
      return [];
    }
  }

  static async recalculateAllStockStatus() {
    try {
      const products = await Product.list();
      const updatePromises = [];

      for (const product of products) {
        const stock = product.stock || 0;
        const minStock = product.minimum_stock || 0;
        
        let stockStatus = "in_stock";
        let productStatus = product.status;

        if (stock === 0) {
          stockStatus = "out_of_stock";
          if (!product.allow_zero_stock && product.status === "active") {
            productStatus = "inactive";
          }
        } else if (stock <= minStock) {
          stockStatus = "low_stock";
        }

        if (product.stock_status !== stockStatus || product.status !== productStatus) {
          updatePromises.push(
            Product.update(product.id, {
              ...product,
              stock_status: stockStatus,
              status: productStatus
            })
          );
        }
      }

      await Promise.all(updatePromises);
      return { success: true, updatedCount: updatePromises.length };
    } catch (error) {
      console.error("Erro ao recalcular status de estoque:", error);
      return { success: false, error: error.message };
    }
  }
}

export const useStockManager = () => {
  return {
    reduceStock: StockManager.reduceStock,
    increaseStock: StockManager.increaseStock,
    processOrderStatusChange: StockManager.processOrderStatusChange,
    getLowStockProducts: StockManager.getLowStockProducts,
    recalculateAllStockStatus: StockManager.recalculateAllStockStatus
  };
};