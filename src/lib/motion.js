import { useEffect } from 'react'

const STAGGER_MS = 85
const MAX_STAGGER = 8
const FX_SELECTOR = '.fx-card, .fx-glow'

export const useScrollReveal = () => {
  useEffect(() => {
    const reveal = el => el.setAttribute('data-in', '')

    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.rv').forEach(reveal)
      return undefined
    }

    const io = new IntersectionObserver(entries => {
      entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, i) => {
          e.target.style.setProperty('--rv-d', `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`)
          reveal(e.target)
          io.unobserve(e.target)
        })
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' })

    const watch = el => {
      if (!el.hasAttribute('data-in')) io.observe(el)
    }

    const scan = node => {
      if (node.nodeType !== 1) return
      if (node.matches('.rv')) watch(node)
      node.querySelectorAll('.rv').forEach(watch)
    }

    scan(document.body)

    const mo = new MutationObserver(records => {
      records.forEach(r => r.addedNodes.forEach(scan))
    })
    mo.observe(document.body, { childList: true, subtree: true })

    const onMove = e => {
      const card = e.target.closest?.(FX_SELECTOR)
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      card.style.setProperty('--my', `${e.clientY - rect.top}px`)
    }
    const onTilt = e => {
      const card = e.target.closest?.('.fx-tilt')
      if (!card || e.pointerType === 'touch') return
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      card.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`)
      card.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
    }
    const onOut = e => {
      const card = e.target.closest?.('.fx-tilt')
      if (!card || card.contains(e.relatedTarget)) return
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointermove', onTilt, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointermove', onTilt)
      document.removeEventListener('pointerout', onOut)
    }
  }, [])
}
