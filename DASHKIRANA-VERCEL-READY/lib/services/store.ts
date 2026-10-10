import {
  Product,
  Category,
  Order,
  Customer,
  OrderStatus,
  Address,
} from '../types';

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
} from '../data/mockData';

import { supabase } from '../supabase/client';

const MODE = process.env.NEXT_PUBLIC_DATA_MODE || 'supabase';
const isSupabase = MODE === 'supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'dashkirana_products',
  CATEGORIES: 'dashkirana_categories',
  ORDERS: 'dashkirana_orders',
  CUSTOMERS: 'dashkirana_customers',
};

const changed = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dashkirana_data_changed'));
  }
};

function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(
      STORAGE_KEYS.PRODUCTS,
      JSON.stringify(INITIAL_PRODUCTS)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(INITIAL_CATEGORIES)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(
      STORAGE_KEYS.ORDERS,
      JSON.stringify(INITIAL_ORDERS)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(
      STORAGE_KEYS.CUSTOMERS,
      JSON.stringify(INITIAL_CUSTOMERS)
    );
  }
}

// Convert a database product into the app's Product format.
const mapProduct = (p: any): Product => {
  const databaseImage =
    typeof p.image_url === 'string' ? p.image_url.trim() : '';

  const fallbackImage =
    typeof p.image === 'string' ? p.image.trim() : '';

  const image =
    /^https?:\/\//i.test(databaseImage)
      ? databaseImage
      : /^https?:\/\//i.test(fallbackImage)
        ? fallbackImage
        : fallbackImage || '🛒';

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.category_id || p.categoryId || '',
    category: (
      p.categories?.name ||
      p.category ||
      'Rice & Grains'
    ) as Product['category'],
    description: p.description || '',
    price: Number(p.price),
    mrp: Number(p.mrp),
    discount:
      Number(p.mrp) > Number(p.price)
        ? Math.round(
            (1 - Number(p.price) / Number(p.mrp)) * 100
          )
        : 0,
    unit: p.unit,
    stock: Number(p.stock),
    image,
    featured: !!p.featured,
    active: !!p.active,
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
  };
};

export async function getProducts(): Promise<Product[]> {
  if (isSupabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*,categories(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapProduct);
  }

  if (typeof window !== 'undefined') {
    initializeStorage();

    const d = localStorage.getItem(STORAGE_KEYS.PRODUCTS);

    if (d) {
      try {
        const parsed = JSON.parse(d);

        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
  }

  return INITIAL_PRODUCTS;
}

export async function getProductById(id: string) {
  const ps = await getProducts();
  return ps.find((p) => p.id === id) || null;
}

export async function searchProducts(
  q: string,
  category?: string
) {
  let ps = await getProducts();

  ps = ps.filter((p) => p.active);

  if (category && category !== 'All') {
    ps = ps.filter((p) => p.category === category);
  }

  if (q.trim()) {
    const x = q.toLowerCase();

    ps = ps.filter(
      (p) =>
        p.name.toLowerCase().includes(x) ||
        p.category.toLowerCase().includes(x)
    );
  }

  return ps;
}

export async function getCategories(): Promise<Category[]> {
  if (isSupabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (error) throw error;

    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon || '🛒',
    }));
  }

  if (typeof window !== 'undefined') {
    initializeStorage();

    const d = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    if (d) {
      try {
        const parsed = JSON.parse(d);

        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
  }

  return INITIAL_CATEGORIES;
}

export async function addProduct(
  input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  if (isSupabase) {
    try {
      const cats = await getCategories();
      const c = cats.find((x) => x.name === input.category);

      const { data, error } = await supabase
        .from('products')
        .insert({
          category_id: c?.id || null,
          name: input.name,
          slug: input.slug,
          description: input.description,
          price: input.price,
          mrp: input.mrp,
          stock: input.stock,
          unit: input.unit,
          image_url: input.image,
          featured: input.featured,
          active: input.active,
        })
        .select('*,categories(name)')
        .single();

      if (!error && data) {
        changed();
        return mapProduct(data);
      }

      if (error) {
        throw error;
      }
    } catch (err) {
      console.warn('Supabase addProduct warning:', err);
      throw err;
    }
  }

  // Local storage fallback
  initializeStorage();

  const products = await getProducts();

  const p = {
    ...input,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.unshift(p);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEYS.PRODUCTS,
      JSON.stringify(products)
    );
  }

  changed();

  return p;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
) {
  if (isSupabase) {
    try {
      const body: any = {};

      if (updates.name !== undefined) body.name = updates.name;
      if (updates.slug !== undefined) body.slug = updates.slug;
      if (updates.description !== undefined) {
        body.description = updates.description;
      }
      if (updates.price !== undefined) body.price = updates.price;
      if (updates.mrp !== undefined) body.mrp = updates.mrp;
      if (updates.stock !== undefined) body.stock = updates.stock;
      if (updates.unit !== undefined) body.unit = updates.unit;
      if (updates.image !== undefined) {
        body.image_url = updates.image;
      }
      if (updates.featured !== undefined) {
        body.featured = updates.featured;
      }
      if (updates.active !== undefined) {
        body.active = updates.active;
      }

      if (updates.category !== undefined) {
        const cats = await getCategories();

        body.category_id =
          cats.find((c) => c.name === updates.category)?.id || null;
      }

      body.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('products')
        .update(body)
        .eq('id', id)
        .select('*,categories(name)')
        .single();

      if (error) throw error;

      if (data) {
        changed();
        return mapProduct(data);
      }
    } catch (err) {
      console.warn('Supabase updateProduct warning:', err);
      throw err;
    }
  }

  initializeStorage();

  const products = await getProducts();
  const i = products.findIndex((p) => p.id === id);

  if (i < 0) return null;

  products[i] = {
    ...products[i],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEYS.PRODUCTS,
      JSON.stringify(products)
    );
  }

  changed();

  return products[i];
}

export async function updateStock(
  id: string,
  stock: number
) {
  return updateProduct(id, { stock });
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*,order_items(*),addresses(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((o: any) => ({
      id: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,

      items: (o.order_items || []).map((i: any) => ({
        productId: i.product_id,
        productName: i.product_name,
        unit: i.unit,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image || '🛒',
      })),

      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.delivery_fee),
      total: Number(o.total),
      address: o.addresses || {},
      paymentMethod: o.payment_method,
      status: o.status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));
  }

  let localOrders: Order[] = [];

  if (typeof window !== 'undefined') {
    initializeStorage();

    const d = localStorage.getItem(STORAGE_KEYS.ORDERS);

    if (d) {
      try {
        localOrders = JSON.parse(d);
      } catch {}
    }
  }

  return localOrders.length > 0
    ? localOrders
    : INITIAL_ORDERS;
}

export async function getOrderById(id: string) {
  const os = await getOrders();
  return os.find((o) => o.id === id) || null;
}

export async function createOrder(
  orderData: Omit<
    Order,
    'id' | 'createdAt' | 'updatedAt' | 'status'
  >
): Promise<Order> {
  if (isSupabase) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error(
          'Please sign in before placing an order.'
        );
      }

      const a = orderData.address as Address;

      const { data: addr, error: ae } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          name: a.name,
          phone: a.phone,
          address_line: a.addressLine,
          area: a.area,
          city: a.city,
          pincode: a.pincode,
          landmark: a.landmark || '',
          delivery_instructions: a.deliveryInstructions || '',
        })
        .select()
        .single();

      if (ae) throw ae;

      if (!addr) {
        throw new Error('Could not save the delivery address.');
      }

      const { data: o, error: oe } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          address_id: addr.id,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          payment_method: orderData.paymentMethod,
          status: 'Placed',
        })
        .select()
        .single();

      if (oe) throw oe;

      if (!o) {
        throw new Error('Could not create the order.');
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderData.items.map((i) => ({
            order_id: o.id,
            product_id: i.productId,
            product_name: i.productName,
            unit: i.unit,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          }))
        );

      if (itemsError) throw itemsError;

      changed();

      return {
        ...orderData,
        id: o.id,
        status: 'Placed',
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      };
    } catch (err) {
      console.warn('Supabase createOrder error:', err);
      throw err;
    }
  }

  // Local mode only
  initializeStorage();

  const orders = await getOrders();

  const o = {
    ...orderData,
    id: `DK${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'Placed' as OrderStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(o);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEYS.ORDERS,
      JSON.stringify(orders)
    );
  }

  changed();

  return o;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        changed();
        return getOrderById(data.id);
      }
    } catch (err) {
      console.error(
        'Supabase updateOrderStatus error:',
        err
      );
      throw err;
    }
  }

  initializeStorage();

  const orders = await getOrders();
  const i = orders.findIndex((o) => o.id === id);

  if (i < 0) return null;

  orders[i].status = status;
  orders[i].updatedAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEYS.ORDERS,
      JSON.stringify(orders)
    );
  }

  changed();

  return orders[i];
}

export async function getCustomers(): Promise<Customer[]> {
  const customerMap = new Map<string, Customer>();

  // Add initial customers
  for (const c of INITIAL_CUSTOMERS) {
    customerMap.set(c.phone, c);
  }

  // Incorporate placed orders to keep customer stats accurate
  const orders = await getOrders();

  for (const o of orders) {
    if (o.customerPhone) {
      const existing = customerMap.get(o.customerPhone);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.total;

        if (
          new Date(o.createdAt) >
          new Date(existing.lastOrderDate)
        ) {
          existing.lastOrderDate = o.createdAt;
        }
      } else {
        customerMap.set(o.customerPhone, {
          id: `cust-${o.customerPhone}`,
          name: o.customerName || 'Customer',
          phone: o.customerPhone,
          totalOrders: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
        });
      }
    }
  }

  if (isSupabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id,full_name,phone,created_at')
        .eq('role', 'customer');

      if (data && data.length > 0) {
        for (const p of data) {
          if (p.phone && !customerMap.has(p.phone)) {
            customerMap.set(p.phone, {
              id: p.id,
              name: p.full_name || 'Customer',
              phone: p.phone,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: p.created_at,
            });
          }
        }
      }
    } catch {}
  }

  return Array.from(customerMap.values());
}
