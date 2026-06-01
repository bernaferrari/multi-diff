type WheelLike = {
  deltaX: number
  deltaY: number
  shiftKey: boolean
  preventDefault: () => void
}

type ScrollTarget = {
  clientHeight: number
  clientWidth: number
  scrollTo?: (options: { left?: number; top?: number }) => void
  scrollHeight: number
  scrollLeft: number
  scrollTop: number
  scrollWidth: number
}

export function routeWheelToScroller(
  event: WheelLike,
  scroller: ScrollTarget
) {
  const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX
  const verticalDelta = event.shiftKey ? 0 : event.deltaY
  const preferHorizontal =
    Math.abs(horizontalDelta) > Math.abs(verticalDelta) ||
    (event.shiftKey && horizontalDelta !== 0)

  if (preferHorizontal) {
    const maxLeft = scroller.scrollWidth - scroller.clientWidth
    if (maxLeft <= 0) return

    const nextLeft = clampScrollPosition(
      scroller.scrollLeft + horizontalDelta,
      maxLeft
    )
    if (nextLeft === scroller.scrollLeft) return
    event.preventDefault()
    setScrollPosition(scroller, { left: nextLeft })
    return
  }

  const maxTop = scroller.scrollHeight - scroller.clientHeight
  if (maxTop <= 0) return

  const nextTop = clampScrollPosition(
    scroller.scrollTop + verticalDelta,
    maxTop
  )
  if (nextTop === scroller.scrollTop) return
  event.preventDefault()
  setScrollPosition(scroller, { top: nextTop })
}

export function clampScrollPosition(value: number, max: number) {
  return Math.min(Math.max(value, 0), max)
}

function setScrollPosition(
  scroller: ScrollTarget,
  position: { left?: number; top?: number }
) {
  if (scroller.scrollTo) {
    scroller.scrollTo({
      left: position.left ?? scroller.scrollLeft,
      top: position.top ?? scroller.scrollTop,
    })
    return
  }

  if (position.left !== undefined) scroller.scrollLeft = position.left
  if (position.top !== undefined) scroller.scrollTop = position.top
}
