export type SlackResponse = {
  send: (message: string) => void
  status: (code: number) => { send: (message?: { challenge: string | undefined }) => void }
}

export default SlackResponse
