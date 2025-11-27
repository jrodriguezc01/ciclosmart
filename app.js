// CicloSmart — front-end prototype (no backend) using localStorage
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const store = {
  key(k){ return `cs_${k}`; },
  get(k, def=null){ try{ return JSON.parse(localStorage.getItem(this.key(k))) ?? def; }catch{return def;} },
  set(k, v){ localStorage.setItem(this.key(k), JSON.stringify(v)); }
};

const app = {
  state: { user:null, products:[], cart:[], orders:[] },
  init(){
    this.load();
    this.seed();
    this.cache();
    if(this.mapEl) this.initMap();
    this.bind();
    this.renderAll();
  },
  cache(){
    this.toast = $('#toast');
    this.yearEl = $('#year');
    this.catalogGrid = $('#catalogGrid');
    this.sortSelect = $('#sortSelect');
    this.conditionFilter = $('#conditionFilter');
    this.searchInput = $('#searchInput');
    this.searchBtn = $('#searchBtn');

    this.loginBtn = $('#loginBtn'); this.loginLabel = $('#loginLabel');
    this.authModal = $('#authModal'); this.closeAuth = $('#closeAuth');

    this.cartBtn = $('#cartBtn'); this.cartCount = $('#cartCount');
    this.cartDrawer = $('#cartDrawer'); this.closeCart = $('#closeCart');
    this.cartItems = $('#cartItems'); this.cartSubtotal = $('#cartSubtotal');
    this.cartShipping = $('#cartShipping'); this.cartTotal = $('#cartTotal');

    this.preDemoForm = $('#preDemoForm');
    this.preDemoResult = $('#preDemoResult');
    this.mapEl = $('#csMap');

    this.sellForm = $('#sellForm');
    this.checkoutForm = $('#checkoutForm');
    this.orderResult = $('#orderResult');
  },
  bind(){
    // Category quick filters
    $$('#categorias .cat').forEach(btn=> btn.addEventListener('click', ()=>{
      this._activeCat = btn.dataset.cat || '';
      $$('#categorias .cat').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      this.renderCatalog();
      location.hash = '#catalogo';
    }));
    this.searchBtn.addEventListener('click', ()=> this.renderCatalog());
    this.searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); this.renderCatalog(); }});
    this.sortSelect.addEventListener('change', ()=> this.renderCatalog());
    this.conditionFilter.addEventListener('change', ()=> this.renderCatalog());

    // Cart
    this.cartBtn.addEventListener('click', ()=> this.toggleCart(true));
    this.closeCart.addEventListener('click', ()=> this.toggleCart(false));
    $('#goCheckout').addEventListener('click', ()=> this.toggleCart(false));

    // Sell & Checkout
    this.sellForm.addEventListener('submit', e=> this.onSell(e));
    this.checkoutForm.addEventListener('submit', e=> this.onCheckout(e));

    if(this.preDemoForm){
      this.preDemoForm.addEventListener('submit', e=> this.onPreDemo(e));
    }

    // Auth
    this.loginBtn.addEventListener('click', ()=> this.openAuth());
    this.closeAuth.addEventListener('click', ()=> this.authModal.close());
    this.authModal.addEventListener('click', (e)=>{ if(e.target===this.authModal) this.authModal.close(); });
    $$('.tab').forEach(t=> t.addEventListener('click', ()=> this.switchTab(t)));
    $('#loginForm').addEventListener('submit', e=> this.onLogin(e));
    $('#signupForm').addEventListener('submit', e=> this.onSignup(e));
  },
  load(){
    this.state.user = store.get('user', null);
    this.state.products = store.get('products', []);
    this.state.cart = store.get('cart', []);
    this.state.orders = store.get('orders', []);
  },
  save(){
    store.set('user', this.state.user);
    store.set('products', this.state.products);
    store.set('cart', this.state.cart);
    store.set('orders', this.state.orders);
  },
  seed(){
    if(this.state.products.length) return;
    const now = Date.now();
    const demo = [
      { id: crypto.randomUUID(), title:'Varilla corrugada 3/8" (100u)', category:'Acero', condition:'Nuevo', price: 9.50, qty: 100, location:'Lima', description:'Excedente de obra, almacenado bajo techo.', img:'🧱', createdAt: now-3600e3*24 },
      { id: crypto.randomUUID(), title:'Madera tornillo 2x4x3m (10 pzs)', category:'Madera', condition:'Como nuevo', price: 220, qty: 10, location:'Surco', description:'Listones rectos, sin humedad.', img:'🪵', createdAt: now-3600e3*8 },
      { id: crypto.randomUUID(), title:'Pintura látex 5 gal (3 baldes)', category:'Acabados', condition:'Nuevo', price: 170, qty: 3, location:'Miraflores', description:'Color blanco, sellado.', img:'🎨', createdAt: now-3600e3*2 },
      { id: crypto.randomUUID(), title:'Flexómetro 8m', category:'Herramientas', condition:'Usado', price: 25, qty: 4, location:'La Molina', description:'En buen estado.', img:'🧰', createdAt: now-3600e3*40 },
      { id: crypto.randomUUID(), title:'Cable THHN N°12 (rollo 100m)', category:'Eléctricos', condition:'Nuevo', price: 260, qty: 2, location:'San Borja', description:'Rollo sellado.', img:'🔌', createdAt: now-3600e3*12 },
      { id: crypto.randomUUID(), title:'Inodoro una pieza', category:'Sanitarios', condition:'Como nuevo', price: 380, qty: 1, location:'San Isidro', description:'Abierto solo para revisión.', img:'🚽', createdAt: now-3600e3*7 },
      { id: crypto.randomUUID(), title:'Azulejo cerámico 30x30 (caja 1m²)', category:'Acabados', condition:'Nuevo', price: 45, qty: 15, location:'Callao', description:'Caja cerrada.', img:'🧱', createdAt: now-3600e3*52 },
      { id: crypto.randomUUID(), title:'Guantes de obra (pack x12)', category:'Varios', condition:'Nuevo', price: 36, qty: 8, location:'Lima', description:'Talla M.', img:'🧤', createdAt: now-3600e3*5 }
    ];
    this.state.products = demo;
    this.save();
  },
  renderAll(){
    this.yearEl.textContent = new Date().getFullYear();
    this.renderAuth();
    this.renderCatalog();
    this.renderCart();
    this.renderOrders();
  },
  // --- Auth ---
  renderAuth(){
    if(this.state.user){
      this.loginLabel.textContent = this.state.user.name.split(' ')[0];
      this.loginBtn.onclick = ()=>{
        const ok = confirm(`¿Cerrar sesión de ${this.state.user.email}?`);
        if(ok){ this.state.user=null; this.save(); this.renderAll(); this.toastMsg('Sesión cerrada'); }
      };
    }else{
      this.loginLabel.textContent = 'Ingresar';
      this.loginBtn.onclick = ()=> this.openAuth();
    }
  },
  openAuth(){ this.switchTab($('.tab[data-tab="login"]')); this.authModal.showModal(); },
  switchTab(tabBtn){
    $$('.tab').forEach(t=> t.classList.remove('active'));
    tabBtn.classList.add('active');
    const name = tabBtn.dataset.tab;
    $$('.tab-panel').forEach(p=> p.classList.remove('active'));
    $(`.tab-panel[data-panel="${name}"]`).classList.add('active');
    $('#authTitle').textContent = name==='login' ? 'Ingresar' : 'Crear cuenta';
  },
  onLogin(e){
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get('email')).toLowerCase();
    const password = fd.get('password');
    const users = store.get('users', []);
    const user = users.find(u=> u.email===email && u.password===password);
    if(!user) return this.toastMsg('Credenciales inválidas', 'error');
    this.state.user = { id:user.id, name:user.name, email:user.email };
    this.save(); this.renderAuth(); this.authModal.close(); this.toastMsg('¡Bienvenido!');
  },
  onSignup(e){
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name'); const email = String(fd.get('email')).toLowerCase(); const password = fd.get('password');
    const users = store.get('users', []);
    if(users.some(u=> u.email===email)) return this.toastMsg('Ya existe una cuenta con ese correo', 'error');
    const newUser = { id: crypto.randomUUID(), name, email, password };
    users.push(newUser); store.set('users', users);
    this.state.user = { id:newUser.id, name, email }; this.save();
    this.renderAuth(); this.authModal.close(); this.toastMsg('Cuenta creada ✅');
  },
  // --- Catalog ---
  filters(){
    return {
      q: (this.searchInput.value||'').trim().toLowerCase(),
      cat: this._activeCat || '',
      cond: this.conditionFilter.value,
      sort: this.sortSelect.value
    };
  },
  productCard(p){
    const disabled = p.qty<=0 ? 'disabled' : '';
    const stock = p.qty>0 ? `${p.qty} disp.` : 'Agotado';
    return `<div class="card product">
      <div class="thumb" aria-label="Imagen">${p.img||'📦'}</div>
      <div class="title">${p.title}</div>
      <div class="meta">${p.category} • ${p.condition} • ${p.location}</div>
      <div class="price">S/ ${p.price.toFixed(2)}</div>
      <div class="meta">Stock: ${stock}</div>
      <div class="actions">
        <button class="btn primary" ${disabled} data-add="${p.id}">Añadir</button>
        <button class="btn outline" data-save="${p.id}">Guardar</button>
      </div>
    </div>`;
  },
  renderCatalog(){
    const { q, cat, cond, sort } = this.filters();
    let items = [...this.state.products];
    if(q) items = items.filter(p => [p.title,p.description,p.category,p.location].join(' ').toLowerCase().includes(q));
    if(cat) items = items.filter(p => p.category===cat);
    if(cond) items = items.filter(p => p.condition===cond);
    if(sort==='priceAsc') items.sort((a,b)=> a.price-b.price);
    if(sort==='priceDesc') items.sort((a,b)=> b.price-a.price);
    if(sort==='newest') items.sort((a,b)=> b.createdAt-a.createdAt);

    this.catalogGrid.innerHTML = items.map(p=> this.productCard(p)).join('') || '<div class="muted">No hay resultados con esos filtros.</div>';
    // Bind buttons
    $$('#catalogo [data-add]').forEach(b=> b.addEventListener('click', ()=> this.addToCart(b.dataset.add)));
    $$('#catalogo [data-save]').forEach(b=> b.addEventListener('click', ()=> this.saveForLater(b.dataset.save)));
  },
  saveForLater(id){
    if(!this.state.user) return this.openAuth();
    const key = `saves_${this.state.user.id}`;
    const list = store.get(key, []);
    if(!list.includes(id)) list.push(id);
    store.set(key, list);
    this.toastMsg('Guardado en tu lista');
  },
  // --- Cart ---
  addToCart(productId, qty=1){
    const p = this.state.products.find(x=> x.id===productId);
    if(!p) return;
    if(p.qty<=0) return this.toastMsg('Sin stock', 'error');
    const item = this.state.cart.find(i=> i.productId===productId);
    if(item){
      if(item.qty + qty > p.qty) return this.toastMsg('No hay más stock disponible', 'error');
      item.qty += qty;
    }else{
      this.state.cart.push({ productId, qty });
    }
    this.save(); this.renderCart(); this.toastMsg('Añadido al carrito 🛒');
  },
  renderCart(){
    this.cartCount.textContent = this.state.cart.reduce((a,i)=>a+i.qty,0);
    const rows = this.state.cart.map(ci=>{
      const p = this.state.products.find(x=> x.id===ci.productId);
      if(!p) return '';
      return `<div class="cart-item" data-id="${ci.productId}">
        <div class="thumb">${p.img||'📦'}</div>
        <div>
          <div style="font-weight:700">${p.title}</div>
          <div class="meta">${p.category} • ${p.condition}</div>
          <div class="meta">S/ ${p.price.toFixed(2)}</div>
          <div class="qty">
            <button class="icon" data-dec>−</button>
            <input type="number" min="1" value="${ci.qty}" />
            <button class="icon" data-inc>+</button>
            <button class="icon" data-rem style="margin-left:auto">Eliminar</button>
          </div>
        </div>
        <div style="font-weight:800">S/ ${(p.price*ci.qty).toFixed(2)}</div>
      </div>`;
    }).join('');
    this.cartItems.innerHTML = rows || '<div class="muted">Tu carrito está vacío.</div>';
    const subtotal = this.state.cart.reduce((s,ci)=>{
      const p = this.state.products.find(x=> x.id===ci.productId);
      return s + (p?p.price*ci.qty:0);
    },0);
    const shipping = subtotal>0 ? (subtotal>=500?0:20) : 0;
    const total = subtotal + shipping;
    this.cartSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
    this.cartShipping.textContent = `S/ ${shipping.toFixed(2)}`;
    this.cartTotal.textContent = `S/ ${total.toFixed(2)}`;

    // Bind qty controls
    $$('#cartItems .cart-item').forEach(row=>{
      const id = row.dataset.id;
      const p = this.state.products.find(x=> x.id===id);
      const input = $('input', row);
      $('[data-inc]', row).addEventListener('click', ()=>{
        const item = this.state.cart.find(i=> i.productId===id);
        if(item.qty+1>p.qty) return this.toastMsg('Stock insuficiente', 'error');
        item.qty+=1; this.save(); this.renderCart();
      });
      $('[data-dec]', row).addEventListener('click', ()=>{
        const item = this.state.cart.find(i=> i.productId===id);
        item.qty = Math.max(1, item.qty-1); this.save(); this.renderCart();
      });
      input.addEventListener('change', ()=>{
        let val = parseInt(input.value||'1',10);
        val = isNaN(val)?1:val;
        val = Math.max(1, Math.min(val, p.qty));
        const item = this.state.cart.find(i=> i.productId===id);
        item.qty = val; this.save(); this.renderCart();
      });
      $('[data-rem]', row).addEventListener('click', ()=>{
        this.state.cart = this.state.cart.filter(i=> i.productId!==id);
        this.save(); this.renderCart();
      });
    });
  },
  toggleCart(open){ this.cartDrawer.classList.toggle('open', open); this.cartDrawer.setAttribute('aria-hidden', String(!open)); },
  // --- Sell ---
  onSell(e){
    e.preventDefault();
    if(!this.state.user){ this.openAuth(); return; }
    const fd = new FormData(e.target);
    const p = {
      id: crypto.randomUUID(),
      title: fd.get('title'),
      category: fd.get('category'),
      condition: fd.get('condition'),
      price: parseFloat(fd.get('price')||'0'),
      qty: parseInt(fd.get('qty')||'1',10),
      location: fd.get('location') || 'Lima',
      description: fd.get('description') || '',
      img: '📦', createdAt: Date.now(), sellerId: this.state.user.id
    };
    this.state.products.unshift(p); this.save(); e.target.reset();
    this.renderCatalog(); location.hash = '#catalogo'; this.toastMsg('Producto publicado ✅');
  },
  // --- Checkout ---
  onCheckout(e){
    e.preventDefault();
    if(this.state.cart.length===0) return this.toastMsg('Carrito vacío', 'error');
    if(!this.state.user){ this.openAuth(); return; }
    const fd = new FormData(e.target);
    const shippingMethod = fd.get('shippingMethod');
    const shippingCost = shippingMethod==='express'?35 : shippingMethod==='standard'?20 : 0;
    const items = this.state.cart.map(ci=>{
      const p = this.state.products.find(x=> x.id===ci.productId);
      return { productId: ci.productId, title:p.title, qty:ci.qty, price:p.price };
    });
    const total = items.reduce((s,x)=> s+x.qty*x.price,0) + shippingCost;
    const order = {
      id: Math.random().toString(36).slice(2,10).toUpperCase(),
      userId: this.state.user.id,
      createdAt: Date.now(), items,
      shipping: { fullName: fd.get('fullName'), phone: fd.get('phone'), address: fd.get('address'), city: fd.get('city'), district: fd.get('district'), method: shippingMethod, cost: shippingCost },
      paymentMethod: fd.get('paymentMethod'), total
    };
    // Reduce stock & clear cart
    order.items.forEach(it=>{
      const p = this.state.products.find(x=> x.id===it.productId);
      if(p) p.qty -= it.qty;
    });
    this.state.orders.unshift(order); this.state.cart = []; this.save();
    this.renderCart(); this.renderCatalog(); this.renderOrders();
    this.orderResult.hidden = false;
    this.orderResult.innerHTML = `
      <div class="order">
        <div class="head"><div>Pedido <strong>#${order.id}</strong></div><div>${new Date(order.createdAt).toLocaleString()}</div></div>
        <div class="items">${order.items.map(i=> `${i.qty}× ${i.title}`).join(', ')}</div>
        <div class="items">Envío: ${order.shipping.method.toUpperCase()} — S/ ${order.shipping.cost.toFixed(2)}</div>
        <div style="margin-top:6px;font-weight:800">Total: S/ ${order.total.toFixed(2)}</div>
        <div class="items" style="margin-top:6px">Entrega: ${order.shipping.address}, ${order.shipping.district}, ${order.shipping.city}</div>
      </div>`;
    e.target.reset(); this.toastMsg('Pedido confirmado 🧾');
  },
  // --- Orders ---
  renderOrders(){
    if(!this.state.user){ $('#ordersList').innerHTML = '<div class="muted">Inicia sesión para ver tus pedidos.</div>'; return; }
    const my = this.state.orders.filter(o=> o.userId===this.state.user.id);
    if(!my.length){ $('#ordersList').innerHTML = '<div class="muted">Aún no tienes pedidos.</div>'; return; }
    $('#ordersList').innerHTML = my.map(o=>`
      <div class="order">
        <div class="head"><div>#${o.id}</div><div>${new Date(o.createdAt).toLocaleString()}</div></div>
        <div class="items">${o.items.map(i=> `${i.qty}× ${i.title}`).join(', ')}</div>
        <div class="items">Total: <strong>S/ ${o.total.toFixed(2)}</strong> • Envío: ${o.shipping.method}</div>
      </div>`).join('');
  },

  // --- Pre-demolition inventory demo (IA simplificada) ---
  onPreDemo(e){
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const area = parseFloat(fd.get('area') || '0');
    const reusePct = parseFloat(fd.get('reusePct') || '0');
    const structureType = fd.get('structureType');
    const buildingName = fd.get('buildingName') || 'Edificio sin nombre';
    const location = fd.get('location') || 'Ubicación no definida';

    if(!area || area <= 0){
      this.toastMsg('Ingresa un área válida', 'error');
      return;
    }

    const baseValuePerM2 = structureType === 'Estructura metálica' ? 35 :
                           structureType === 'Concreto armado' ? 28 : 20;

    const reusableArea = area * (reusePct / 100);
    const estimatedValue = reusableArea * baseValuePerM2;

    const kgCO2PerM2 = structureType === 'Estructura metálica' ? 18 :
                       structureType === 'Concreto armado' ? 14 : 10;
    const co2Saved = reusableArea * kgCO2PerM2;

    let recommendation;
    if(reusePct >= 50){
      recommendation = 'Alta oportunidad de reutilización. Priorizar desmontaje selectivo y venta directa en marketplace.';
    }else if(reusePct >= 25){
      recommendation = 'Oportunidad media. Combinar reutilización con reciclaje especializado.';
    }else{
      recommendation = 'Baja reutilización. Recomendable enfocar en reciclaje y acuerdos con gestores autorizados.';
    }

    if(this.preDemoResult){
      this.preDemoResult.hidden = false;
      this.preDemoResult.innerHTML = `
        <div class="order">
          <div class="head">
            <div>${buildingName}</div>
            <div>${location}</div>
          </div>
          <div class="items">
            Área útil analizada: <strong>${area.toLocaleString()} m²</strong> •
            Potencial reutilizable: <strong>${reusePct}% (${reusableArea.toFixed(0)} m²)</strong>
          </div>
          <div class="items">
            Valor estimado de materiales recuperables:
            <strong>USD ${estimatedValue.toFixed(0)}</strong>
          </div>
          <div class="items">
            CO₂ evitado (estimado):
            <strong>${co2Saved.toFixed(0)} kg</strong>
          </div>
          <div class="items" style="margin-top:8px">
            IA CicloSmart (demo): ${recommendation}
          </div>
        </div>`;
    }
  },

  // --- GIS demo map ---
  initMap(){ /* GIS demo offline: no external map library required */ },

  // --- Utils ---
  toastMsg(msg, type='info'){
    this.toast.textContent = msg;
    this.toast.className = 'toast show' + (type==='error' ? ' error':'');
    setTimeout(()=> this.toast.classList.remove('show'), 2200);
  }
};

window.addEventListener('DOMContentLoaded', ()=> app.init());
