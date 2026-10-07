'use client';
import { useEffect, useState } from 'react';
import { BottomNav } from '../../components/BottomNav';
import { ProductCard } from '../../components/ProductCard';
import { Product, CartItem, Category } from '../../lib/types';
import { getProducts, getCategories } from '../../lib/services/store';
import Link from 'next/link';

export default function ProductsPage() {
  const [products,setProducts]=useState<Product[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [q,setQ]=useState(''); const [cat,setCat]=useState('All'); const [cart,setCart]=useState<CartItem[]>([]);
  useEffect(()=>{getProducts().then(setProducts);getCategories().then(setCategories);const s=localStorage.getItem('dashkirana_cart');if(s)setCart(JSON.parse(s));},[]);
  const save=(c:CartItem[])=>{setCart(c);localStorage.setItem('dashkirana_cart',JSON.stringify(c));};
  const add=(p:Product)=>{const x=cart.find(i=>i.product.id===p.id);save(x?cart.map(i=>i.product.id===p.id?{...i,quantity:Math.min(p.stock,i.quantity+1)}:i):[...cart,{product:p,quantity:1}]);};
  const qty=(id:string,n:number)=>save(n<=0?cart.filter(i=>i.product.id!==id):cart.map(i=>i.product.id===id?{...i,quantity:n}:i));
  const list=products.filter(p=>p.active&&(!q||p.name.toLowerCase().includes(q.toLowerCase())||p.category.toLowerCase().includes(q.toLowerCase()))&&(cat==='All'||p.category===cat));
  return <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto customer-shell"><header className="sticky top-0 z-20 bg-white border-b p-3"><div className="flex justify-between items-center"><Link href="/" className="font-black text-lg">DASH<span className="text-emerald-600">KIRANA</span></Link><Link href="/cart" className="bg-emerald-600 text-white rounded-full px-3 py-1.5 text-xs font-bold">Cart ({cart.reduce((a,i)=>a+i.quantity,0)})</Link></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search groceries..." className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"/></header><main className="p-4"><div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">{['All',...categories.map(c=>c.name)].map(c=><button key={c} onClick={()=>setCat(c)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold ${cat===c?'bg-emerald-600 text-white':'bg-white border text-gray-700'}`}>{c}</button>)}</div><div className="flex justify-between items-center mt-3 mb-3"><h1 className="font-black">{cat==='All'?'All Groceries':cat}</h1><span className="text-xs text-gray-500">{list.length} items</span></div><div className="grid grid-cols-2 gap-3">{list.map(p=><ProductCard key={p.id} product={p} cartQuantity={cart.find(i=>i.product.id===p.id)?.quantity||0} onAddToCart={add} onUpdateQuantity={qty}/>)}</div>{!list.length&&<div className="text-center bg-white rounded-2xl p-8 text-sm text-gray-500">No products found.</div>}</main><BottomNav cartCount={cart.reduce((a,i)=>a+i.quantity,0)}/></div>
}
