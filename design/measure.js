// Dev-only: compares rendered text ink boxes and element boxes with the Figma export (1280px frame).
// Run in the browser console on the dev server:
//   await (Object.getPrototypeOf(async function () {}).constructor)(await (await fetch('/__design/measure.js')).text())(); __report
await document.fonts.ready
const ink = (node) => {
  const el = node.parentElement; const cs = getComputedStyle(el)
  const r = document.createRange(); r.selectNodeContents(node); const rect = r.getBoundingClientRect()
  const c = document.createElement('canvas').getContext('2d')
  c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; c.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing
  let txt = node.textContent.trim(); if (cs.textTransform === 'uppercase') txt = txt.toUpperCase()
  const m = c.measureText(txt); const base = rect.top + m.fontBoundingBoxAscent
  return [rect.left - m.actualBoundingBoxLeft, rect.left + m.actualBoundingBoxRight, base - m.actualBoundingBoxAscent, base + m.actualBoundingBoxDescent]
}
const find = (t) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.trim() === t) return n }
const box = (sel, i = 0) => { const e = document.querySelectorAll(sel)[i]; if (!e) return null; const b = e.getBoundingClientRect(); return [b.left, b.right, b.top, b.bottom] }
const T = {
 '[Overview]':[233.7,323.8,24.2,37.9], '92.6%':[252.4,324.4,133.6,152.5], '27':[506.4,532.7,133.6,152.5], '86':[760.4,786.7,133.6,152.5], '1.8 s':[1014.4,1084.1,133.6,152.5],
 'Eval Pass Rate':[284.1,378.4,102.0,111.1], 'Avg. Latency':[1045.5,1127.1,102.5,113.6], '73 failed':[250.5,298.3,170.4,179.6], 'p95 response':[1012.9,1090.2,170.6,182.0], '14%':[1201,1224.1,170.6,179.7],
 '118,629':[251.4,350,272.1,293.4], '67,546':[768.4,852.6,272.1,293.4], 'Yearly':[670.1,696.4,247.5,257.1], 'View all':[1187.1,1219.9,247.5,255.1],
 'Agent Health':[251.5,332.6,577,588.5], 'Filter':[1114.8,1135.7,576.5,584.1], 'Export':[1186.8,1214,576.9,586],
 'Role':[399.6,426.5,605,614.1], 'Sentinel':[287.7,343.9,637,646.1], 'Courier':[287.6,336.5,773.4,782.1], 'Healthy':[544.5,585.5,637,646.6], '$0.4213':[898.9,947.2,636.1,647.2], '1,627 ms':[1037.7,1093.3,773.4,784.0],
 'Overview':[35.7,83.7,78.8,87.1], 'Agents':[35.3,71.1,108,118.4], 'Pipelines':[36,81,136.8,147.3], 'Deployments':[36,102.6,200,210.3], 'Evals':[36,61.5,229,237.1], 'Traces':[35.5,69.5,258,266.1], 'Team':[35.5,62.5,321,329.1], 'Settings':[35.6,77.4,349.8,360.4], 'Build & Ship':[11.7,61.9,177.1,183.1], 'Manage':[11.7,44.9,298.1,304.1],
 'Token Budget':[19.9,81.1,680.6,686.6], '612K / 1M':[20,55.8,723.9,730.9], 'Resets in 9 days':[130.2,190.9,724,731.6], '@adeebrq':[57.9,95.9,777.7,785.1], 'Owner':[58,82.2,789.6,795.6], 'AQ':[24.3,40.1,782.2,791.8],
 'us-east':[935.1,962.9,394.1,399.6], '28,370 reqs':[935.1,979.1,420.1,427.6], '42 ms':[1003,1025.5,420.1,426.1], 'Last Month':[1166.4,1232,286,295.1],
}
const B = {
 '.glyph-tile':[250,275,93.5,118.5], '.glyph-tile@3':[1012,1037,93.5,118.5], '.chart-card .btn':[658,724,239,265], '.chart-card .btn@1':[1175,1233,239,265],
 '.health__search':[940,1077,568,594], '.btn--tool':[1085,1148,568,594], '.btn--tool@1':[1156,1227,568,594], '.pill':[516.6,614.1,631.25,650.75], '.pill@4':[516.6,614.1,767.25,786.75],
 '.success .dotbar':[653.1,825.7,629.9,652.1], '.agent__avatar':[253,279,628,654], '.agent__avatar@4':[253,279,764,790], '.health__actions svg':[1192.3,1208.5,636.9,640.2],
 '.topbar__search':[1040,1177,19,43], '.topbar__avatar':[1225,1245,21,41], '.topbar__bell svg':[1189,1201,25,37], '.topbar__divider':[1212.5,1213.5,21,41],
 '.nav-item':[11,200,70,95], '.nav-item@7':[11,200,341,366], '.token-card':[11,200,670,740.5], '.token-card .dotbar':[20.19,191.8,706.29,716.71], '.user-card':[11,200,766,807], '.user-card__initials':[19.5,45.5,774.5,798.5],
 '.region-tip':[928,1033,385,434.5], '.world__marker':[892.04,903.76,384.65,396.37], '.world__canvas':[771,1232,311,513], '.inference-plot':[249,724,305,520],
 '.sidebar__logo':[11,31,21.8,40.3], '.sidebar__collapse svg':[191.8,200.2,27.3,34.7], '.chart-card':[231,738,225,537], '.chart-card@1':[749,1245,225,537], '.health':[231,1245,556,799], '.kpi-strip':[231,1245,70,206],
}
const out = []; const f = (v) => (v >= 0 ? '+' : '') + v.toFixed(1)
for (const [t, e] of Object.entries(T)) { const n = find(t); if (!n) { out.push(t + ' ?'); continue } const d = ink(n).map((v, i) => v - e[i]); if (d.some((x) => Math.abs(x) > 0.6)) out.push(`${t.padEnd(16)} ${d.map(f).join(' ')}`) }
out.push('--- boxes')
for (const [k, e] of Object.entries(B)) { const [sel, i] = k.split('@'); const g = box(sel, +i || 0); if (!g) { out.push(k + ' ?'); continue } const d = g.map((v, j) => v - e[j]); if (d.some((x) => Math.abs(x) > 0.6)) out.push(`${k.padEnd(22)} ${d.map(f).join(' ')}`) }
window.__report = out.join('\n')
