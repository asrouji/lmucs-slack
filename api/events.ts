import SlackRequest from '../types/slackRequest'
import SlackResponse from '../types/slackResponse'

export default async function events(req: SlackRequest, res: SlackResponse) {
  const type = req.body.type

  if (type == 'url_verification') {
    res.status(200).send({
      challenge: req.body.challenge,
    })
  } else if (type == 'event_callback') {
    res.status(200).send()
    if (req.body.event.type === 'message') {
      const message = req.body.event.text
      const userId = req.body.event.user

      const response = await fetch(
        `https://slack.com/api/users.info?token=${process.env.SLACK_BOT_TOKEN}&user=${userId}&pretty=1`,
      )

      const data = (await response.json()) as {
        ok: boolean
        user: {
          profile: {
            first_name: string
            last_name: string
          }
        }
      }

      const name = `${data.user.profile.first_name} ${data.user.profile.last_name.slice(0, 1)}`

      console.log(`Message from "${name}": "${message}"`)
    }
  }
}
