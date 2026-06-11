import { supabase } from '../../../lib/supabaseClient';
import { nairaToMinor } from '../../../utils/currency';
import { createProductSlug, refreshProductSlug } from '../../../utils/productSlug';

// ── helper: upload a file to Supabase Storage ─────────────────────────────────
async function uploadImage(file, folder = 'products') {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
  return urlData.publicUrl;
}

export const sellerApi = {
  getDashboard: async (sellerId) => {
    const { data, error } = await supabase.rpc('get_seller_dashboard', {
      p_seller_id: sellerId
    });

    if (error) throw error;
    return data;
  },

  getProduct: async (productId) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories!category_id(id, name, slug), subcategory:categories!subcategory_id(id, name, slug, parent_id), product_variants(*), product_images(*)')
      .eq('id', productId)
      .single();
    if (error) throw error;
    return data;
  },

  updateOrderStatus: async (orderId, status) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateReviewStatus: async (reviewId, isVerified) => {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ is_verified: isVerified })
      .eq('id', reviewId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteProduct: async (productId) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    return true;
  },

  saveSettings: async (sellerId, settings) => {
    const { error } = await supabase
      .from('seller_profiles')
      .upsert({
        user_id: sellerId,
        store_name: settings.storeName,
        store_description: settings.storeDescription,
        business_email: settings.businessEmail,
        business_phone: settings.businessPhone,
        bank_name: settings.bankName,
        account_number: settings.accountNumber,
        account_name: settings.accountName,
        notif_new_orders: settings.notifNewOrders,
        notif_low_stock: settings.notifLowStock,
        notif_payouts: settings.notifPayouts,
        notif_reviews: settings.notifReviews
      });
    if (error) throw error;
    return true;
  },

  requestWithdrawal: async (sellerId, amountMinor, feeCents, description) => {
    const { data, error } = await supabase
      .from('seller_wallet')
      .insert([{
        seller_id: sellerId,
        type: 'payout',
        amount_minor: -amountMinor,
        fee_cents: feeCents,
        net_cents: -(amountMinor - feeCents),
        status: 'pending',
        description: description
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  markNotificationsRead: async (sellerId) => {
    const { error } = await supabase
      .from('seller_notifications')
      .update({ unread: false })
      .eq('seller_id', sellerId);
    if (error) throw error;
    return true;
  },

  // ── Add Product: products + product_images + product_variants ────────────────
  addProduct: async (sellerId, productData) => {
    const slug = createProductSlug(productData.name);

    // 2. Upload thumbnail (required field in products.image)
    let thumbnailUrl = null;
    if (productData.thumbnailFile && productData.thumbnailFile instanceof File) {
      thumbnailUrl = await uploadImage(productData.thumbnailFile, 'thumbnails');
    }

    // 3. Parse features (comma-separated → JSON array)
    const featuresArray = productData.features
      ? productData.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [];

    // 4. Parse keywords
    const keywordsArray = productData.keywords
      ? productData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    // 5. Insert the product row
    const { data: product, error: pErr } = await supabase
      .from('products')
      .insert([{
        seller_id: sellerId,
        category_id: productData.categoryId,
        subcategory_id: productData.subcategoryId,
        name: productData.name,
        slug,
        brand: productData.brand || null,
        short_description: productData.shortDescription || null,
        full_description: productData.fullDescription || null,
        price_minor: nairaToMinor(productData.price),
        sale_price_minor: productData.sale_price
          ? nairaToMinor(productData.sale_price)
          : null,
        currency: productData.currency || 'NGN',
        keywords: keywordsArray,
        features: featuresArray,
        is_featured: productData.is_featured || false,
        image: thumbnailUrl || '',       // products.image = thumbnail
      }])
      .select()
      .single();

    if (pErr) throw pErr;

    // 6. Upload additional gallery images → product_images table
    const additionalFiles = Array.isArray(productData.additionalFiles)
      ? productData.additionalFiles
      : [];

    if (additionalFiles.length > 0) {
      const imageRows = await Promise.all(
        additionalFiles.map(async (file, idx) => {
          const url = await uploadImage(file, 'gallery');
          return {
            product_id: product.id,
            image_url: url,
            label: `View ${idx + 1}`,
            sort_order: idx,
          };
        })
      );
      const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
      if (imgErr) throw imgErr;
    }

    // 7. Insert all variants into product_variants
    const variants = productData.variants || [];
    if (variants.length > 0) {
      const variantRows = variants.map((v, idx) => ({
        product_id: product.id,
        sku: v.sku || `SKU-${product.id.slice(0, 8).toUpperCase()}-${idx + 1}`,
        color: v.color || null,
        size: v.size || null,
        // variant can override the base price, otherwise inherit it
        price_minor: v.price_override ? nairaToMinor(v.price_override) : null,
        stock_quantity: v.stock || 0,
      }));

      const { error: vErr } = await supabase
        .from('product_variants')
        .insert(variantRows);
      if (vErr) throw vErr;
    }

    return product;
  },

  updateProduct: async (productId, productData) => {
    const { data: currentProduct, error: currentProductError } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single();
    if (currentProductError) throw currentProductError;

    // 2. Upload thumbnail if new
    let thumbnailUrl = productData.image; // Keep existing if not provided
    if (productData.thumbnailFile && productData.thumbnailFile instanceof File) {
      thumbnailUrl = await uploadImage(productData.thumbnailFile, 'thumbnails');
    }

    const featuresArray = productData.features
      ? (typeof productData.features === 'string' ? productData.features.split(',').map((f) => f.trim()).filter(Boolean) : productData.features)
      : [];

    const keywordsArray = productData.keywords
      ? (typeof productData.keywords === 'string' ? productData.keywords.split(',').map((k) => k.trim()).filter(Boolean) : productData.keywords)
      : [];

    // 5. Update the product row
    const { data: product, error: pErr } = await supabase
      .from('products')
      .update({
        category_id: productData.categoryId,
        subcategory_id: productData.subcategoryId,
        name: productData.name,
        slug: refreshProductSlug(productData.name, currentProduct.slug),
        brand: productData.brand || null,
        short_description: productData.shortDescription || null,
        full_description: productData.fullDescription || null,
        price_minor: nairaToMinor(productData.price),
        sale_price_minor: productData.sale_price
          ? nairaToMinor(productData.sale_price)
          : null,
        currency: productData.currency || 'NGN',
        keywords: keywordsArray,
        features: featuresArray,
        is_featured: productData.is_featured || false,
        image: thumbnailUrl || '',
      })
      .eq('id', productId)
      .select()
      .single();

    if (pErr) throw pErr;

    // We skip updating additional gallery images and variants in this basic implementation for brevity,
    // or we'd delete them and recreate. Let's just recreate variants if provided:
    const variants = productData.variants || [];
    if (variants.length > 0) {
      await supabase.from('product_variants').delete().eq('product_id', productId);
      const variantRows = variants.map((v, idx) => ({
        product_id: product.id,
        sku: v.sku || `SKU-${product.id.slice(0, 8).toUpperCase()}-${idx + 1}`,
        color: v.color || null,
        size: v.size || null,
        price_minor: v.price_override ? nairaToMinor(v.price_override) : null,
        stock_quantity: v.stock || 0,
      }));
      const { error: vErr } = await supabase.from('product_variants').insert(variantRows);
      if (vErr) throw vErr;
    }

    return product;
  },

  updateSubscription: async (sellerId, planId) => {
    await new Promise(r => setTimeout(r, 800));
    // When backend is ready, implement supabase update here
    return { planId };
  },

  updateMarketing: async (sellerId, marketingData) => {
    await new Promise(r => setTimeout(r, 800));
    // When backend is ready, implement supabase update here
    return marketingData;
  },

  getCoupons: async () => {
    const { data, error } = await supabase.rpc('get_seller_coupons');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  saveCoupon: async (coupon) => {
    const discountValue = coupon.discountType === 'fixed'
      ? nairaToMinor(coupon.discountValue)
      : Number(coupon.discountValue);
    const minOrderCents = coupon.minOrder
      ? nairaToMinor(coupon.minOrder)
      : 0;

    const { data, error } = await supabase.rpc('seller_upsert_coupon', {
      p_coupon_id: coupon.id || null,
      p_code: coupon.code,
      p_label: coupon.label || null,
      p_discount_type: coupon.discountType,
      p_discount_value: discountValue,
      p_min_order_cents: minOrderCents,
      p_max_uses: coupon.maxUses || null,
      p_starts_at: coupon.startsAt || null,
      p_expires_at: coupon.expiresAt || null,
      p_is_active: Boolean(coupon.isActive),
      p_product_ids: coupon.productIds || [],
    });
    if (error) throw error;
    return data;
  },

  deleteCoupon: async (couponId) => {
    const { error } = await supabase.rpc('seller_delete_coupon', {
      p_coupon_id: couponId,
    });
    if (error) throw error;
    return true;
  },

  getAdvertisements: async (sellerId) => {
    if (!sellerId) return [];

    const { data, error } = await supabase
      .from('advertisements')
      .select(`
        *,
        product:products!product_id (
          id,
          name,
          slug,
          image,
          price_minor
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createAdvertisement: async (sellerId, advert) => {
    let imageUrl = advert.imageUrl || null;

    if (advert.imageFile && advert.imageFile instanceof File) {
      imageUrl = await uploadImage(advert.imageFile, 'advertisements');
    }

    const { data, error } = await supabase
      .from('advertisements')
      .insert({
        seller_id: sellerId,
        product_id: advert.productId || null,
        title: advert.title,
        subtitle: advert.subtitle || null,
        creative_type: advert.creativeType,
        placement: advert.placement,
        destination_url: advert.destinationUrl || null,
        image_url: imageUrl,
        package_id: advert.packageId,
        required_seller_plan: advert.requiredSellerPlan,
        eligible_plan_ids: advert.eligiblePlanIds,
        budget_minor: nairaToMinor(advert.budget),
        bid_type: advert.bidType,
        bid_minor: nairaToMinor(advert.bid),
        starts_at: advert.startsAt || null,
        ends_at: advert.endsAt || null,
        payment_status: advert.paymentReference ? 'paid' : 'pending',
        payment_reference: advert.paymentReference || null,
        approval_status: advert.paymentReference ? 'pending_review' : 'draft',
        targeting_rules: {
          categories: advert.categories || [],
          locations: advert.locations || [],
          keywords: advert.keywords || [],
        },
        creative_payload: {
          headline: advert.title,
          subtitle: advert.subtitle || '',
          imageUrl,
        },
        metadata: {
          submittedFrom: 'seller_dashboard',
          sellerPlan: advert.sellerPlan || 'starter',
        },
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getAdvertisementAnalytics: async (sellerId) => {
    const adverts = await sellerApi.getAdvertisements(sellerId);
    const advertIds = adverts.map((advert) => advert.id);

    if (!advertIds.length) {
      return {
        campaigns: [],
        totals: { impressions: 0, clicks: 0, conversions: 0, revenueMinor: 0 },
        timeline: [],
      };
    }

    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const { data: events, error } = await supabase
      .from('advertisement_events')
      .select('advertisement_id, event_type, event_value_minor, occurred_at')
      .in('advertisement_id', advertIds)
      .gte('occurred_at', since)
      .order('occurred_at', { ascending: true });

    if (error) throw error;

    const totals = (events || []).reduce((acc, event) => {
      if (event.event_type === 'impression') acc.impressions += 1;
      if (event.event_type === 'click') acc.clicks += 1;
      if (event.event_type === 'conversion') {
        acc.conversions += 1;
        acc.revenueMinor += Number(event.event_value_minor || 0);
      }
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, revenueMinor: 0 });

    return {
      campaigns: adverts,
      totals,
      events: events || [],
    };
  },

  replyReview: async (reviewId, replyText) => {
    await new Promise(r => setTimeout(r, 600));
    // When backend is ready, implement supabase insert/update here
    return { reviewId, replyText };
  }
};
