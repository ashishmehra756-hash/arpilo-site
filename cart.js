/* arpilo.ca cart: bracelets only (Etsy sells the rest). Built into site/cart.js by site_build.py,
   which fills in CFG. The cart lives in this browser only; prices are re-checked against every
   PayPal payment before anything ships. */
(function () {
  var CFG = {"clientId": "BAAQVRrimYHVsuTti72omEa0fW3qJox6diO_CJ3ZUCZnQxTetog1MLdM5HuhH_xhBdHB4KJ7XW1IrmYbPg", "ship": 5.0, "freeFrom": 30.0, "minOrder": 9.99, "five": 34.99, "email": "hello@arpilo.ca"};
  var KEY = 'arpilo-cart';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} badge(); }
  function money(n) { return 'CA$' + n.toFixed(2); }

  /* Deal pieces: every 5 for CFG.five (34.99); fewer than 5 pay their own price. ARPILO15 (the card in every
     Etsy box) takes 15% off after the bundle. Free delivery is judged before the code, so using the
     code never makes delivery reappear. */
  function totals(cart) {
    var deal = [], full = 0, count = 0;
    cart.forEach(function (it) {
      count += it.q;
      for (var i = 0; i < it.q; i++) { if (it.d) deal.push(it.p); else full += it.p; }
    });
    deal.sort(function (a, b) { return b - a; });
    var n = deal.length, fives = Math.floor(n / 5);
    var bundled = deal.slice(0, 5 * fives).reduce(function (a, b) { return a + b; }, 0);
    var items = full + deal.reduce(function (a, b) { return a + b; }, 0);
    var bundle = Math.round((bundled - CFG.five * fives) * 100) / 100;
    var sub = items - bundle;
    var code = codeOn() ? Math.round(sub * RATE[codeOn()] * 100) / 100 : 0;
    var ship = count === 0 || sub >= CFG.freeFrom || cart.some(function (it) { return it.f; }) ? 0 : CFG.ship;
    return { items: items, bundle: bundle, code: code, discount: bundle + code, sub: sub,
             ship: ship, total: sub - code + ship, count: count, toFive: n % 5 >= 3 ? 5 - n % 5 : 0 };
  }
  var RATE = {ARPILO15: 0.15};
  function codeOn() { try { var c = localStorage.getItem(KEY + '-code'); return RATE[c] ? c : ''; } catch (e) { return ''; } }

  function badge() {
    var c = load().reduce(function (a, it) { return a + it.q; }, 0);
    document.querySelectorAll('.cartlink').forEach(function (a) { a.textContent = 'Cart' + (c ? ' (' + c + ')' : ''); });
  }

  /* Product page: chooser, live price, add to cart. */
  function product() {
    var box = document.getElementById('buyform'); if (!box) return;
    var P = JSON.parse(box.dataset.p), sel = document.getElementById('pick'), price = document.getElementById('liveprice');
    var add = document.getElementById('add'), msg = document.getElementById('added');
    var gal = document.querySelectorAll('.gallery .main img');
    function show() {
      var i = sel.selectedIndex;
      price.textContent = money(P.prices[i]);
      var st = document.getElementById('story'); if (st) st.textContent = (P.stories || [])[i] || '';
      var bl = document.getElementById('belief'); if (bl) bl.textContent = (P.beliefs || [])[i] || '';
      var dn = document.getElementById('dealnote'); if (dn) dn.style.display = P.deal[i] ? '' : 'none';
      if (gal.length === sel.options.length && gal[i]) gal[i].scrollIntoView({ block: 'nearest', inline: 'start' });
    }
    sel.onchange = show; show();
    add.onclick = function () {
      var i = sel.selectedIndex, c = load(), name = P.choices.length > 1 ? P.title + ' - ' + P.choices[i] : P.title;
      var hit = c.filter(function (it) { return it.n === name; })[0];
      if (hit) hit.q += 1; else c.push({ n: name, p: P.prices[i], d: P.deal[i], f: !!P.free, q: 1 });
      save(c);
      msg.innerHTML = 'Added. <a href="../cart.html">View cart</a>';
    };
  }

  /* Cart page. */
  function cartPage() {
    var root = document.getElementById('cart'); if (!root) return;
    function draw() {
      var c = load(), t = totals(c);
      if (!c.length) { root.innerHTML = '<p>Your cart is empty. <a href="index.html#bracelets">See the bracelets.</a></p>'; return; }
      var rows = c.map(function (it, k) {
        return '<tr><td>' + it.n + (it.d ? ' <span class="dealtag">deal</span>' : '') + '</td>' +
          '<td class="q"><button data-k="' + k + '" data-v="-1" aria-label="One fewer">&minus;</button> ' + it.q +
          ' <button data-k="' + k + '" data-v="1" aria-label="One more">+</button></td>' +
          '<td class="r">' + money(it.p * it.q) + '</td></tr>';
      }).join('');
      var toFree = CFG.freeFrom - t.sub;
      root.innerHTML = '<table class="carttable">' + rows + '</table>' +
        '<dl class="sums"><dt>Items</dt><dd>' + money(t.items) + '</dd>' +
        (t.bundle > 0 ? '<dt>5 for ' + money(CFG.five) + '</dt><dd>&minus;' + money(t.bundle) + '</dd>' : '') +
        (t.code > 0 ? '<dt>' + codeOn() + '</dt><dd>&minus;' + money(t.code) + '</dd>' : '') +
        '<dt>Delivery</dt><dd>' + (t.ship ? money(t.ship) : 'Free') + '</dd>' +
        '<dt class="tot">Total</dt><dd class="tot">' + money(t.total) + '</dd></dl>' +
        (t.toFive ? '<p class="dealnote">Add ' + t.toFive + ' more glow or opalite bracelets: any 5 for CA$34.99, with free delivery.</p>'
          : t.ship && toFree > 0 ? '<p class="note">Add ' + money(toFree) + ' more for free delivery.</p>' : '') +
        '<form class="codebox" id="codebox"><input id="code" placeholder="Code" autocomplete="off" value="' +
        codeOn() + '"><button type="submit">' + (codeOn() ? 'Remove' : 'Apply') + '</button></form>' +
        '<p class="note" id="codemsg"></p>' +
        '<div id="paybox"></div>';
      root.querySelectorAll('button[data-k]').forEach(function (b) {
        b.onclick = function () {
          var c = load(), it = c[+b.dataset.k]; it.q += +b.dataset.v;
          if (it.q <= 0) c.splice(+b.dataset.k, 1);
          save(c); draw();
        };
      });
      document.getElementById('codebox').onsubmit = function (e) {
        e.preventDefault();
        var v = document.getElementById('code').value.trim().toUpperCase();
        try {
          if (codeOn()) localStorage.removeItem(KEY + '-code');
          else if (RATE[v]) localStorage.setItem(KEY + '-code', v);
          else { document.getElementById('codemsg').textContent = 'That code is not recognised.'; return; }
        } catch (err) {}
        draw();
      };
      pay(c, t);
    }
    draw();
  }

  function pay(c, t) {
    var box = document.getElementById('paybox');
    if (t.sub < CFG.minOrder) {          /* a lone small order costs more to send than it earns */
      box.innerHTML = '<p class="dealnote">Orders start at ' + money(CFG.minOrder) + ' in items, before delivery. Add ' +
        money(CFG.minOrder - t.sub) + ' more to check out.</p>';
      return;
    }
    var lines = c.map(function (it) { return it.q + ' x ' + it.n; }).join('\n');
    if (!CFG.clientId) {
      var body = 'I would like:\n' + lines + (t.code ? '\nCode: ' + codeOn() : '') + '\n\nTotal ' + money(t.total) + ' (delivery ' + (t.ship ? money(t.ship) : 'free') +
        ')\n\nShip to:\n';
      box.innerHTML = '<a class="btn big" href="mailto:' + CFG.email + '?subject=' + encodeURIComponent('arpilo.ca order') +
        '&body=' + encodeURIComponent(body) + '">Order by email</a>' +
        '<p class="note">We reply the same day with a payment link.</p>';
      return;
    }
    function render() {
      box.innerHTML = '';
      window.paypal.Buttons({
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [{
              description: 'arpilo.ca order' + (t.code ? ' (' + codeOn() + ')' : ''),
              amount: { currency_code: 'CAD', value: t.total.toFixed(2), breakdown: {
                item_total: { currency_code: 'CAD', value: t.items.toFixed(2) },
                shipping: { currency_code: 'CAD', value: t.ship.toFixed(2) },
                discount: { currency_code: 'CAD', value: Math.max(0, t.discount).toFixed(2) } } },
              items: c.map(function (it) {
                return { name: it.n.slice(0, 127), quantity: String(it.q), category: 'PHYSICAL_GOODS',
                  unit_amount: { currency_code: 'CAD', value: it.p.toFixed(2) } };
              })
            }],
            application_context: { shipping_preference: 'GET_FROM_FILE', brand_name: 'Arpilo' }
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function () {
            save([]); try { localStorage.removeItem(KEY + '-code'); } catch (e) {}
            document.getElementById('cart').innerHTML = '<h2>Thank you.</h2><p>Your order is paid. It leaves Victoria in ' +
              '1&ndash;3 business days, and the tracking number comes by email.</p>';
          });
        },
        onError: function () {
          box.insertAdjacentHTML('beforeend', '<p class="note">PayPal could not start. Email us at ' + CFG.email + ' and we will sort it.</p>');
        }
      }).render('#paybox');
    }
    if (window.paypal) return render();
    var s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(CFG.clientId) + '&currency=CAD&intent=capture';
    s.onload = render; document.head.appendChild(s);
  }

  badge(); product(); cartPage();
})();
