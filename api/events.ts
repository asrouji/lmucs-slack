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

      try {
        const response = (await fetch('https://slack.com/api/users.profile.get', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            'body': JSON.stringify({ user: userId }),
          },
        })) as unknown as { json: () => Promise<SlackResponse> }

        const data = (await response.json()) as unknown as {
          ok: boolean
          profile: {
            real_name: string
          }
        }
        console.log(`Message from "${data.profile.real_name}": "${message}"`)
      } catch (error) {
        console.error(error)
      }
    }
  }

  res.status(200).send()
}
