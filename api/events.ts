import SlackRequest from '../types/slackRequest'
import SlackResponse from '../types/slackResponse'

export default async function events(req: SlackRequest, res: SlackResponse) {
  const type = req.body.type

  if (type == 'url_verification') {
    res.status(200).send({
      challenge: req.body.challenge,
    })
  } else if (type == 'event_callback') {
    console.log(req.body.event.type)

    if (req.body.event.type === 'message') {
      const message = req.body.event.text
      const userId = req.body.event.user

      let response: { json: () => Promise<SlackResponse> } = { json: async () => ({ ok: false }) } as unknown as {
        json: () => Promise<SlackResponse>
      }

      try {
        response = (await fetch('https://slack.com/api/users.profile.get', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            'user': userId,
          },
        })) as unknown as { json: () => Promise<SlackResponse> }
      } catch (error) {
        console.error(error)
      }

      const data = (await response.json()) as unknown as {
        ok: boolean
        user: {
          profile: {
            real_name: string
          }
        }
      }

      console.log(data)

      console.log(`Message from "${data.user.profile.real_name}": "${message}"`)
    }
  }

  res.status(200).send()
}
