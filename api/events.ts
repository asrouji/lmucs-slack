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
    console.log(req.body)
  }
}
