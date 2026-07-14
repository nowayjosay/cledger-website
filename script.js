(function () {
  'use strict';

  /* ── Hamburger menu ── */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Scroll-reveal ── */
  var revealTargets = document.querySelectorAll('[data-animate], .feature-card');

  if ('IntersectionObserver' in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* Fallback: show everything immediately */
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── Stagger feature cards ── */
  document.querySelectorAll('.feature-card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 80) + 'ms';
  });

})();

/* ── World map (D3 + topojson) ── */
(async function initWorldMap() {
  var container = document.getElementById('cledger-world-map');
  if (!container || typeof d3 === 'undefined' || typeof topojson === 'undefined') return;

  var W = 800, H = 420;

  var svg = d3.select(container)
    .append('svg')
    .attr('viewBox', '0 0 ' + W + ' ' + H)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  var defs = svg.append('defs');

  /* Dot fill pattern */
  var pat = defs.append('pattern')
    .attr('id', 'wdots')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5)
    .attr('height', 5);
  pat.append('circle')
    .attr('cx', 2).attr('cy', 2).attr('r', 1.4)
    .attr('fill', '#b8cfdf');

  /* Drop shadow for pins */
  var filt = defs.append('filter')
    .attr('id', 'pinshadow')
    .attr('x', '-40%').attr('y', '-40%')
    .attr('width', '180%').attr('height', '180%');
  filt.append('feDropShadow')
    .attr('dx', 0).attr('dy', 2)
    .attr('stdDeviation', 3)
    .attr('flood-color', 'rgba(0,0,0,0.18)');

  /* Projection */
  var proj = d3.geoNaturalEarth1()
    .scale(W / 6.1)
    .translate([W / 2, H / 2 + 12]);

  var geoPath = d3.geoPath().projection(proj);

  /* Load world atlas */
  var world;
  try {
    world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  } catch (e) {
    console.warn('Cledger: world map data failed to load', e);
    return;
  }

  var countries = topojson.feature(world, world.objects.countries);

  /* Draw countries */
  svg.append('g')
    .selectAll('path')
    .data(countries.features)
    .join('path')
    .attr('d', geoPath)
    .attr('fill', 'url(#wdots)')
    .attr('stroke', 'none');

  /* Pin data: [flag emoji, [lon, lat]] */
  var pins = [
    ['🇳🇴', [10,   62]],
    ['🇬🇧', [-2,   54]],
    ['🇫🇷', [2,    46]],
    ['🇺🇸', [-100, 40]],
    ['🇦🇪', [54,   24]],
    ['🇲🇦', [-5,   32]],
    ['🇧🇷', [-51, -10]],
    ['🇦🇴', [18,  -12]],
    ['🇿🇦', [25,  -29]],
    ['🇦🇺', [134, -25]],
  ];

  /* Project each pin to screen coords */
  var pts = pins.map(function(p) {
    var xy = proj(p[1]);
    return { flag: p[0], x: xy[0], y: xy[1] };
  });

  /* Connection pairs (index into pts) */
  var arcs = [
    [3, 1],  /* USA  -> UK            */
    [3, 2],  /* USA  -> France        */
    [1, 0],  /* UK   -> Norway        */
    [2, 5],  /* France -> Morocco     */
    [5, 6],  /* Morocco -> Brazil     */
    [6, 7],  /* Brazil  -> Angola     */
    [7, 8],  /* Angola  -> S. Africa  */
    [8, 9],  /* S. Africa -> Australia */
    [2, 4],  /* France -> UAE         */
    [4, 7],  /* UAE   -> Angola       */
  ];

  /* Draw dashed arcs */
  var arcG = svg.append('g');
  arcs.forEach(function(pair) {
    var a = pts[pair[0]], b = pts[pair[1]];
    var mx = (a.x + b.x) / 2;
    /* Raise control point proportional to horizontal distance */
    var lift = Math.abs(b.x - a.x) * 0.28 + 20;
    var my = Math.min(a.y, b.y) - lift;
    arcG.append('path')
      .attr('d', 'M' + a.x + ',' + a.y + ' Q' + mx + ',' + my + ' ' + b.x + ',' + b.y)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', '5 4')
      .attr('opacity', 0.75);
  });

  /* Draw pins */
  var PR = 13; /* pin radius in SVG units */
  var pinG = svg.append('g');

  pts.forEach(function(p) {
    var g = pinG.append('g').attr('transform', 'translate(' + p.x + ',' + p.y + ')');

    /* Small dot below pin */
    g.append('circle')
      .attr('cy', PR + 4)
      .attr('r', 3.5)
      .attr('fill', '#7db8d8')
      .attr('opacity', 0.55);

    /* Pin circle */
    g.append('circle')
      .attr('r', PR)
      .attr('fill', '#ffffff')
      .attr('stroke', '#dce8f0')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#pinshadow)')
      .attr('class', 'wpin-circle');

    /* Flag emoji */
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', PR * 1.15)
      .attr('y', 0.5)
      .text(p.flag);
  });

})();

