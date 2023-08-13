export type SlackResponse = {
  send: (message: string) => void
  status: (code: number) => { send: (message?: string | { challenge: string | undefined }) => void }
  profile: {
    real_name: string
  }
}

export default SlackResponse
