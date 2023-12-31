type SlackRequest = {
  body: {
    token: string
    team_id: string
    context_team_id: string
    context_enterprise_id: string | null
    api_app_id: string
    event: {
      client_msg_id: string
      type: string
      text: string
      user: string
      ts: string
      blocks: unknown[]
      channel: string
      event_ts: string
      channel_type: string
    }
    type: string
    event_id: string
    event_time: number
    authorizations: {
      enterprise_id: string | null
      team_id: string
      user_id: string
      is_bot: boolean
      is_enterprise_install: boolean
    }[]
    is_ext_shared_channel: boolean
    event_context: string
    challenge: string | undefined
  }
}

export default SlackRequest
