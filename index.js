const MARGIN = {top: 40, left: 200, bottom: 200, right: 200};
const C = 400;
const WIDTH = C + MARGIN.left + MARGIN.right;
const HEIGHT = C + MARGIN.top + MARGIN.bottom;


const set = (e, attributes) => {
  for (const k in attributes) e.setAttribute(k, attributes[k]);
};

var svg;
const create = (type, attributes={}, parent=svg) => {
  const e = document.createElementNS('http://www.w3.org/2000/svg', type);
  set(e, attributes);
  parent.appendChild(e);
  return e;
};

const text = (content, attributes={}) => {
  var e = create('text', Object.assign({style: 'user-select: none'}, attributes));
  e.textContent = content;
  return e;
};

svg = create('svg', {width: WIDTH, height: HEIGHT, 'stroke-width': 4, fill: 'none',
                     viewBox: `-${MARGIN.left} -${MARGIN.top} ${WIDTH} ${HEIGHT}`},
             document.getElementById('figure'));

const cc = create('rect', {stroke: '#ddd', width: C, height: C});
const a_ = create('line', {stroke: 'red'});
const a__ = create('line', {stroke: 'red'});
const b = create('line', {stroke: 'blue'});
const b_ = create('line', {stroke: 'blue'});
const aa = create('path', {stroke: 'red'});
const bb = create('path', {stroke: 'blue'});

const cLabel = text('c', {fill: 'black', x: C / 2, y: -5});
const aLabel = text('a', {fill: 'red'});
const bLabel = text('b', {fill: 'blue'});
const aaLabel = text('a.a', {fill: 'red'});
const bbLabel = text('b.b', {fill: 'blue'});
const abLabel = text('a.b', {fill: 'purple'});
const baLabel = text('b.a', {fill: 'purple'});

const p = create('circle', {fill: 'black', r: 4});
const theorem = document.getElementById('theorem');
const equation = document.getElementById('equation');


const path = (x, y, ...deltas) =>
      ({d: `M ${x} ${y} ` + deltas.map(({dx, dy}) => `l ${dx} ${dy}`).join(' ')});

const square = (x, y, dx, dy) => path(x, y,
                                      {dx: dx, dy: dy},
                                      {dx: -dy, dy: dx},
                                      {dx: -dx, dy: -dy},
                                      {dx: dy, dy: -dx});

const line = (x, y, dx, dy) => ({x1: x, y1: y, x2: x + dx, y2: y + dy});

const move = (ax, ay, right=false) => {
  const bx = C - ax;
  const by = -ay;

  if (!right && Math.abs(ax * bx + ay * by) < 6000) {
    // Thales' theorem says that right triangle lie on a circle.
    // Closest point on a circle is along the radius through current point.
    const x = ax - C / 2;
    const y = ay;
    const k = Math.sqrt(C * C / (x * x + y * y)) / 2;
    return move(k * x + C / 2, k * y, true);
  }

  if (right) {
    theorem.innerText = 'Pythagorean Theorem';
    equation.innerText = 'c.c = a.a + b.b';
    set(abLabel, {visibility: 'hidden'});
    set(baLabel, {visibility: 'hidden'});
  } else {
    theorem.innerText = 'Law of Cosines';
    equation.innerText = 'c.c = a.a + b.b + 2a.b';
    set(abLabel, {visibility: 'visible'});
    set(baLabel, {visibility: 'visible'});
  }

  set(p, {cx: ax, cy: ay});
  set(aa, square(0, 0, ax, ay));
  set(bb, square(ax - ay, ay + ax, bx, by));
  set(a_, line(C, 0, -ay, ax));
  set(a__, line(0, C, ax, ay));
  set(b, line(C, 0, -bx, -by));
  set(b_, line(0, C, by, -bx));

  set(aLabel, {x: ax / 2, y: ay / 2 - 5});
  set(bLabel, {x: ax + bx / 2 - 5, y: ay + by / 2 - 5});
  set(aaLabel, {x: (ax - ay) / 2, y: (ax + ay) / 2});
  set(bbLabel, {x: C - (bx - by) / 2, y: C - (bx + by) / 2});
  set(abLabel, {x: C - (bx + ay) / 2, y: (ax - by) / 2});
  set(baLabel, {x: (ax + by) / 2, y: C - (bx + by) / 2});
};


// see https://x.st/javascript-coroutines
const coroutine = f => {
  const o = f();
  o.next();
  return x => o.next(x);
};

const loop = coroutine(function*() {
  while(e = yield) {
    if (e.type === 'mousedown') {
      while (e = yield) {
        if (e.type === 'mousemove') move(e.offsetX - MARGIN.left, e.offsetY - MARGIN.top);
        else if (e.type === 'mouseup') break;
      }
    }
  }
});

p.addEventListener('mousedown', loop);
svg.addEventListener('mousemove', loop);
document.addEventListener('mouseup', loop);


move(100, 100);
