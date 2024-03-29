import type { Server as BunServer, ServerWebSocket, WebSocketHandler } from 'bun'
import { Server } from './server'

type WS = ServerWebSocket<{
  socketId: string
  auth: {
    id?: string | undefined
    name?: string | undefined
    image?: string | undefined
  }
  channels: string[]
}>

interface Payload {
  type: string
  data: string
}

const handlers = new Map<string, (server: BunServer, ws: WS, payload: Payload) => void | Promise<void>>()

  .set('insert', (server, ws, payload) => {
    const { data } = payload
    ws.publish(data, 'hello world')
  })

  .set('update', (server, ws, payload) => {
    const { data } = payload
    ws.subscribe(data)
  })

  .set('unsubscribe', (server, ws, payload) => {
    console.log('server:ws:unsubscribe', payload)

    const isSubbed = (id: string) => ws.isSubscribed(id)
    // @ts-expect-error we will fix this later
    const id = payload.payload.id
    console.log('server:ws:unsubscribe', id)
    const isSubscribed = isSubbed(id)
    if (!isSubscribed) {
      ws.unsubscribe(id)
      console.log('issubbed', isSubbed(id))
    }
  })
  .set('subscribe', (server, ws, payload) => {
    const isSubbed = (id: string) => ws.isSubscribed(id)
    // @ts-expect-error we will fix this later
    const id = payload.payload.id
    console.log('server:ws:subscribe', id)
    const isSubscribed = isSubbed(id)
    if (!isSubscribed) {
      ws.subscribe(id)
      console.log('issubbed', isSubbed(id))
    }

    // ws.subscribe(payload.id)
    // console.log('server:ws:subscribe', payload)
  })

  .set('build', (server, ws, payload) => {

  })
  .set('default', (server, ws, payload) => {

  })
  .set('heartbeat', (server, ws, payload) => {

  })

export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  open (ws) {
    console.log('server:ws:open', ws.data)

    // i should probably do something here
  },
  async message (ws, message) {
    console.log('server:ws:message', ws.data, message)
  },
  drain (ws) {
    console.log('server:ws:drain', ws.data)
  },
  close (ws) {
    console.log('server:ws:close', ws.data)
  }
}
