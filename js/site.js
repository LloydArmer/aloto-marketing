/*
 * ALOTO Prediction Pro website. The store links all live here.
 * Leave a store link empty ('') and its badge shows "Coming soon".
 * When Google Play goes live, paste its link below and nothing else needs changing.
 */
const LINKS = {
  appStore: 'https://apps.apple.com/gb/app/id6805768246',
  googlePlay: '', // e.g. 'https://play.google.com/store/apps/details?id=com.alotoprediction.app'
}

document.documentElement.classList.remove('no-js')

// store badges
document.querySelectorAll('[data-store]').forEach((a) => {
  const url = LINKS[a.dataset.store]
  if (url) {
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    a.classList.add('live')
  } else {
    a.classList.add('soon')
    a.removeAttribute('href')
    a.setAttribute('aria-disabled', 'true')
    a.setAttribute('title', 'Coming soon')
  }
})
// header: solid once scrolled, menu on phones
const header = document.querySelector('.site-header')
const onScroll = () => header && header.classList.toggle('solid', window.scrollY > 20)
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })
const menu = document.querySelector('.menu-btn')
menu?.addEventListener('click', () => {
  const open = header.classList.toggle('open')
  menu.setAttribute('aria-expanded', String(open))
})

// top menu dropdowns: hover on a computer; tap the arrow on a phone or tablet
const items = [...document.querySelectorAll('.nav-item')]
const closeAll = (except) =>
  items.forEach((it) => {
    if (it === except) return
    it.classList.remove('open')
    it.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false')
  })
items.forEach((it) => {
  const btn = it.querySelector('.sub-toggle')
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = !it.classList.contains('open')
    closeAll(it)
    it.classList.toggle('open', open)
    it.classList.toggle('closed', !open)
    btn.setAttribute('aria-expanded', String(open))
  })
  it.addEventListener('mouseleave', () => it.classList.remove('closed'))
})
document.addEventListener('click', (e) => !e.target.closest('.nav-item') && closeAll())
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  closeAll()
  document.activeElement?.blur()
})
// a menu link to another part of the same page closes the phone menu
document.querySelectorAll('.nav-links a').forEach((a) =>
  a.addEventListener('click', () => {
    header?.classList.remove('open')
    menu?.setAttribute('aria-expanded', 'false')
    closeAll()
    a.blur()
  }),
)

// tabs (coaches / athletes)
document.querySelectorAll('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]')]
  tabs.forEach((t) =>
    t.addEventListener('click', () => {
      tabs.forEach((x) => {
        const on = x === t
        x.setAttribute('aria-selected', String(on))
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on
      })
    }),
  )
})

// pricing: open the athletes or clubs plans from a link such as pricing.html#clubs
const openTab = () => {
  const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)))
  const panel = el && el.getAttribute('role') === 'tabpanel' ? el : null
  const tab = panel && document.querySelector(`[role="tab"][aria-controls="${panel.id}"]`)
  if (!tab) return
  tab.click()
  ;(document.getElementById('plans') || panel).scrollIntoView()
}
openTab()
window.addEventListener('hashchange', openTab)

// side-scrolling rails: arrows, progress bar, and pills that jump to a slide
document.querySelectorAll('[data-rail]').forEach((wrap) => {
  const rail = wrap.querySelector('.rail')
  const items = [...rail.children]
  const prev = wrap.querySelector('.prev')
  const next = wrap.querySelector('.next')
  const bar = wrap.querySelector('.bar i')
  const pills = [...wrap.querySelectorAll('.pills button')]
  const left = (i) => items[i].offsetLeft - items[0].offsetLeft
  const step = () => (items.length > 1 ? left(1) : rail.clientWidth)
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth
    wrap.classList.toggle('fits', max < 4 || rail.clientWidth === 0)
    prev.disabled = rail.scrollLeft < 4
    next.disabled = rail.scrollLeft > max - 4
    bar.style.width = `${(rail.clientWidth / rail.scrollWidth) * 100}%`
    bar.style.left = `${(rail.scrollLeft / rail.scrollWidth) * 100}%`
    const at = Math.round(rail.scrollLeft / step())
    pills.forEach((p, i) => p.setAttribute('aria-selected', String(i === at)))
  }
  const go = (x) => rail.scrollTo({ left: x, behavior: 'smooth' })
  prev.addEventListener('click', () => go(rail.scrollLeft - step()))
  next.addEventListener('click', () => go(rail.scrollLeft + step()))
  pills.forEach((p, i) => p.addEventListener('click', () => go(left(i))))
  rail.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  // links such as features.html#tests open that slide
  const fromHash = () => {
    const i = items.findIndex((x) => x.id && `#${x.id}` === location.hash)
    if (i < 0) return
    rail.scrollLeft = left(i)
    wrap.scrollIntoView()
  }
  fromHash()
  window.addEventListener('hashchange', fromHash)
  update()
  // panels that start hidden (pricing tabs) measure once shown
  new ResizeObserver(update).observe(rail)
})

// pricing: monthly or yearly
document.querySelectorAll('[data-billing]').forEach((tabs) => {
  tabs.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)))
      const yearly = b.dataset.period === 'yearly'
      document.querySelectorAll('[data-monthly]').forEach((el) => {
        el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly
      })
      document.querySelectorAll('[data-per]').forEach((el) => {
        el.textContent = yearly ? el.dataset.perYearly : el.dataset.per
      })
    }),
  )
})

// fade sections in as they scroll into view
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' }) : null
document.querySelectorAll('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('in')))

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
