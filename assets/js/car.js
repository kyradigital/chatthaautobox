/* Single vehicle page */
(function () {
  const { cfg, esc, fmtPrice, fmtKm, placeholder, fetchCar, initNav, fillBrand, waLink, reveal } = window.COB;
  fillBrand();
  initNav();

  const root = document.querySelector(".car-layout");
  const id = new URLSearchParams(location.search).get("id");

  const notFound = () => {
    root.innerHTML = `<div class="not-found"><h1>Vehicle not found</h1><p class="muted">It may have been sold or removed.</p><a class="btn btn-red" href="index.html#inventory">See all cars</a></div>`;
  };

  if (!id) return notFound();

  fetchCar(id).then((c) => {
    if (!c) return notFound();
    const name = `${c.year ? c.year + " " : ""}${c.make} ${c.model}${c.variant ? " " + c.variant : ""}`;
    document.title = `${name} — ${cfg.brand} ${cfg.brandSub || ""}`.trim();

    const imgs = [...new Set([c.cover_image, ...(c.images || [])].filter(Boolean))];
    const specs = [
      ["Year", c.year], ["Mileage", fmtKm(c.mileage)], ["Engine", c.engine],
      ["Transmission", c.transmission], ["Fuel", c.fuel], ["Body type", c.body_type],
      ["Drive", c.drive], ["Colour", c.color],
    ].filter(([, v]) => v != null && v !== "");

    const msg = `Hi ${cfg.brand}, I'm interested in the ${name}${c.price ? ` (${fmtPrice(c.price)})` : ""}. Is it still available?\n${location.href}`;
    const wa = waLink(msg);
    const statusLabel = { available: "Available", reserved: "Reserved", sold: "Sold" }[c.status] || "";

    root.innerHTML = `
      <div class="gallery reveal">
        <div class="g-main">
          ${imgs.length ? `<img src="${esc(imgs[0])}" alt="${esc(name)}" />` : placeholder}
          ${imgs.length > 1 ? `<span class="g-count">1 / ${imgs.length}</span>` : ""}
        </div>
        ${imgs.length > 1 ? `<div class="g-thumbs">${imgs.map((u, i) => `<button class="${i === 0 ? "active" : ""}" data-i="${i}"><img src="${esc(u)}" alt="" loading="lazy" /></button>`).join("")}</div>` : ""}
      </div>
      <aside class="car-info reveal" style="--d:120ms">
        <span class="status status-${esc(c.status)}">${esc(statusLabel)}</span>
        <div class="car-meta">${esc(c.make)}</div>
        <h1 class="car-h1">${esc(c.model)}${c.variant ? ` <span>${esc(c.variant)}</span>` : ""}</h1>
        <div class="car-price">${esc(fmtPrice(c.price))}</div>
        <dl class="spec-grid">
          ${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
        <div class="cta-row">
          ${wa ? `<a class="btn btn-red" href="${esc(wa)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>` : ""}
          ${cfg.phone ? `<a class="btn btn-ghost" href="tel:${esc(cfg.phone.replace(/\s/g, ""))}">Call ${esc(cfg.phone)}</a>` : ""}
          ${!wa && !cfg.phone ? `<a class="btn btn-red" href="index.html#contact">Contact us</a>` : ""}
        </div>
        ${c.description ? `<div class="desc"><h3>About this car</h3><p>${esc(c.description).replace(/\n/g, "<br>")}</p></div>` : ""}
      </aside>`;
    reveal(root);
    if (imgs.length) initGallery(imgs, name);
  }).catch((e) => { console.error(e); notFound(); });

  function initGallery(imgs, name) {
    let cur = 0;
    const main = root.querySelector(".g-main img");
    const countEl = root.querySelector(".g-count");
    const thumbs = root.querySelectorAll(".g-thumbs button");
    const lb = document.getElementById("lightbox");
    const lbImg = lb.querySelector("img");

    const show = (i) => {
      cur = (i + imgs.length) % imgs.length;
      main.classList.add("swap");
      setTimeout(() => { main.src = imgs[cur]; main.classList.remove("swap"); }, 160);
      thumbs.forEach((t, j) => t.classList.toggle("active", j === cur));
      thumbs[cur]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      if (countEl) countEl.textContent = `${cur + 1} / ${imgs.length}`;
      if (!lb.hidden) lbImg.src = imgs[cur];
    };

    thumbs.forEach((t) => t.addEventListener("click", () => show(+t.dataset.i)));
    main.addEventListener("click", () => { lbImg.src = imgs[cur]; lbImg.alt = name; lb.hidden = false; document.body.style.overflow = "hidden"; });
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
    lb.querySelector(".lb-close").onclick = close;
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    lb.querySelector(".lb-prev").onclick = () => show(cur - 1);
    lb.querySelector(".lb-next").onclick = () => show(cur + 1);
    if (imgs.length < 2) lb.querySelectorAll(".lb-nav").forEach((b) => (b.hidden = true));
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }
})();
