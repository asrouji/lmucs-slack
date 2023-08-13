import SlackRequest from '../types/slackRequest'
import SlackResponse from '../types/slackResponse'
import { updateTutoringSessionDescription } from './_calendar'

export default async function events(req: SlackRequest, res: SlackResponse) {
  const type = req.body.type

  if (type == 'url_verification') {
    res.status(200).send({
      challenge: req.body.challenge,
    })
  } else if (type == 'event_callback') {
    if (req.body.event.type === 'message') {
      const messageContent = req.body.event.text
      const userId = req.body.event.user
      const channelId = req.body.event.channel
      const timestamp = req.body.event.ts

      try {
        const response = (await fetch(`https://slack.com/api/users.profile.get?user=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          },
        })) as { json: () => Promise<SlackResponse> }

        const data = await response.json()

        const splitName = data.profile.real_name.split(' ')
        const tutorName = `${splitName[0]} ${splitName[1][0]}.`

        const calendarUpdateResult = await updateTutoringSessionDescription(tutorName, messageContent)

        if (!calendarUpdateResult) {
          return res.status(500).send()
        }

        // react to the message with a checkmark
        await fetch(
          `https://slack.com/api/reactions.add?channel=${channelId}&name=white_check_mark&timestamp=${timestamp}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            },
          },
        )
      } catch (error) {
        console.error(error)
        return res.status(500).send()
      }
    }

    res.status(200).send()
  }
}
