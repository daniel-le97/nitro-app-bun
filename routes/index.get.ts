export default eventHandler(() => {
  return `${Bun.nanoseconds() / 1e9} seconds`
})
