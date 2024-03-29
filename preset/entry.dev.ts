import '#internal/nitro/virtual/polyfill'
import { parentPort } from 'node:worker_threads'
import { websocket } from './websocket'
import { setServer } from './server'

// @ts-expect-error it is there
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'

// @ts-expect-error it is there
import { runNitroTask } from '#internal/nitro/task'

// @ts-expect-error it is there
import { tasks } from '#internal/nitro/virtual/tasks'

// console.log('custom dev server')
const nitroApp = useNitroApp()

// @ts-expect-error H3App is App
const handler = toWebHandler(nitroApp.h3App)

nitroApp.router.get(
  '/_nitro/tasks',
  // @ts-expect-error type import errors
  defineEventHandler((event) => {
    return {
      tasks: Object.fromEntries(
        Object.entries(tasks).map(([name, task]) => [
          name,
          // @ts-expect-error type import errors
          { description: task.description }
        ])
      )
    }
  }
  )
)
nitroApp.router.use(
  '/_nitro/tasks/:name',
  // @ts-expect-error type import errors
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    const payload = {
      ...getQuery(event),
      ...(await readBody(event).catch(() => ({})))
    }
    return await runNitroTask(name, payload)
  }
  )
)

// const routes = nitroApp.h3App.stack
// console.log('routes', routes);
const server = Bun.serve({
  port: 0,
  reusePort: true,
  async fetch (request, server) {
    try {
      return await handler(request, { server, request })
    } catch (error) {
      console.error(request.url, error)
    }
  },
  websocket
})

// @ts-expect-error event is typed differently
nitroApp.router.get('/api/server', defineEventHandler(event => server.port))
// console.log('server', server);

setServer(server)

// serverHooks.callHook('start', server)

parentPort?.postMessage({
  event: 'listen',
  address: { host: 'localhost', port: server.port }
})

// console.log(Bun.main, Bun.isMainThread, Bun.origin, Bun.argv);

// Trap unhandled errors
trapUnhandledNodeErrors()

// Graceful shutdown
async function onShutdown (signal?: string) {
  // console.log('onShutdown')
  server.stop(true)
  await nitroApp.hooks.callHook('close')
  Bun.gc(true)
  Bun.shrink()
  parentPort?.postMessage({ event: 'exit' })
}

parentPort?.on('message', async (msg) => {
  if (msg && msg.event === 'shutdown') { await onShutdown() }
})

console.log('finished')
