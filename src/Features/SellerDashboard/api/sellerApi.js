import { supabase } from '../../../lib/supabaseClient';

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
    // 1. Ensure profile exists (auto-heal)
    const { data: profExists } = await supabase
      .from('seller_profiles')
      .select('user_id')
      .eq('user_id', sellerId)
      .single();

    if (!profExists) {
      await supabase.from('seller_profiles').insert([{ user_id: sellerId }]);
    }

    // 2. Fetch full dashboard payload via RPC
    const { data, error } = await supabase.rpc('get_seller_dashboard', {
      p_seller_id: sellerId
    });

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

  requestWithdrawal: async (sellerId, amountCents, feeCents, description) => {
    const { data, error } = await supabase
      .from('seller_wallet')
      .insert([{
        seller_id: sellerId,
        type: 'payout',
        amount_cents: -amountCents,
        fee_cents: feeCents,
        net_cents: -(amountCents - feeCents),
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
    // 1. Resolve category_id from name
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', productData.category)
      .single();

    const slug =
      productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
      '-' +
      Date.now();

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
        category_id: catData?.id ?? null,
        name: productData.name,
        slug,
        brand: productData.brand || null,
        short_description: productData.shortDescription || null,
        full_description: productData.fullDescription || null,
        price_cents: Math.round((productData.price || 0) * 100),
        sale_price_cents: productData.sale_price
          ? Math.round(Number(productData.sale_price) * 100)
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
        price_cents: v.price_override
          ? Math.round(Number(v.price_override) * 100)
          : Math.round((productData.price || 0) * 100),
        stock_quantity: v.stock || 0,
      }));

      const { error: vErr } = await supabase
        .from('product_variants')
        .insert(variantRows);
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

  replyReview: async (reviewId, replyText) => {
    await new Promise(r => setTimeout(r, 600));
    // When backend is ready, implement supabase insert/update here
    return { reviewId, replyText };
  }
};
