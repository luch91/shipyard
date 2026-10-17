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
    // This stays in-process through vinext's handler, but must use the canonical
    // host so production host-enforcement middleware does not turn it into a 308.
    const request = new Request('https://genshipyard.com/api/cron/rollup', {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    })
    const response = await handler.fetch(request, env, ctx)
    if (!response.ok) {
      throw new Error(`Analytics rollup failed with status ${response.status}`)
    }
  },
}

export default shipyardWorker
