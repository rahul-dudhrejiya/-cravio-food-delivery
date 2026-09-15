// ── Centralized Authoritative Coupon Catalog ───────────────
export const VALID_COUPONS = {
    CRAVIO10: {
        code: "CRAVIO10",
        type: "percent",
        value: 10,
        minOrder: 199,
        label: "10% OFF",
        desc: "10% off on orders above ₹199",
        oneTime: false
    },
    WELCOME20: {
        code: "WELCOME20",
        type: "percent",
        value: 20,
        minOrder: 299,
        label: "20% OFF",
        desc: "20% off on orders above ₹299",
        oneTime: false
    },
    FIRST50: {
        code: "FIRST50",
        type: "flat",
        value: 50,
        minOrder: 149,
        label: "₹50 FLAT OFF",
        desc: "₹50 flat off on orders above ₹149",
        oneTime: true
    }
}

/**
 * Calculates authoritative discount value for a coupon given a subtotal.
 * @param {Object} coupon - Coupon object from VALID_COUPONS
 * @param {number} subtotal - Subtotal amount in INR
 * @returns {number} Calculated discount in INR
 */
export const calculateDiscount = (coupon, subtotal) => {
    if (!coupon || subtotal < coupon.minOrder) {
        return 0
    }
    if (coupon.type === "percent") {
        return Math.round((subtotal * coupon.value) / 100)
    }
    if (coupon.type === "flat") {
        return Math.min(coupon.value, subtotal)
    }
    return 0
}
