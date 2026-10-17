import handler from 'vinext/server/fetch-handler'

interface ShipyardEnv {
  CRON_SECRET: string
}

type WorkerContext = Parameters<typeof handler.fetch>[2]
interface CronController {
  scheduledTime: number
  cron: string
  noRetry(): void
}

const shipyardWorker = {
  fetch(request: Request, env: ShipyardEnv, ctx: WorkerContext) {
    return handler.fetch(request, env, ctx)
  },

  async scheduled(_controller: CronController, env: ShipyardEnv, ctx: WorkerContext) {
    const request = new Request('https://internal.shipyard/api/cron/rollup', {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    })
    const response = await handler.fetch(request, env, ctx)
    if (!response.ok) {
      throw new Error(`Analytics rollup failed with status ${response.status}`)
    }
  },
}

export default shipyardWorker
