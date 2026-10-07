package com.dualmark.studio.billing;

import android.app.Activity;
import java.util.List;

/**
 * DualMark Studio — Official Google Play Billing 6.x Modular Contract
 *
 * Provides a decoupled interface layer between the packaging frontend and Google Play Console
 * in-app products / subscription tiers (e.g. tier_pro_monthly, tier_enterprise_annual).
 *
 * Prepared for developer integration with com.android.billingclient:billing:6.2.1.
 */
public interface BillingManagerContract {

    interface BillingCallback {
        void onBillingSetupFinished(boolean isReady, String message);
        void onProductsQueried(List<ProductDetailItem> products);
        void onPurchaseSuccess(String sku, String purchaseToken, String orderId);
        void onPurchaseError(int responseCode, String debugMessage);
    }

    class ProductDetailItem {
        public String productId;
        public String title;
        public String formattedPrice;
        public String billingPeriod;

        public ProductDetailItem(String productId, String title, String formattedPrice, String billingPeriod) {
            this.productId = productId;
            this.title = title;
            this.formattedPrice = formattedPrice;
            this.billingPeriod = billingPeriod;
        }
    }

    void initialize(Activity activity, BillingCallback callback);
    void queryProducts(List<String> productIds);
    void launchBillingFlow(Activity activity, String productId);
    void verifyAndConsumePurchase(String purchaseToken);
    boolean isBillingSupported();
    void destroy();
}
