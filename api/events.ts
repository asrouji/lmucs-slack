import SlackRequest from '../types/slackRequest'
import SlackResponse from '../types/slackResponse'
import { google } from 'googleapis'
import dotenv from 'dotenv'
import { DateTime } from 'luxon'

dotenv.config()

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
      const timestamp = req.body.event.event_ts

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

    res.status(200).send(`received message ${req.body.event.text}`)
  }
}

/**
 * Updates the description of a tutoring session matching the key on the given date.
 * @param key The key to match the tutoring session with.
 * @param message The message to set the description to.
 * @param date The date to search for the tutoring session on. Defaults to the current date.
 * @returns The event that was updated.
 */
const updateTutoringSessionDescription = async (key: string, message: string, date?: DateTime) => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CALENDAR_ID) {
    return undefined
  }

  const jwt = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`)?.join('\n'),
    ['https://www.googleapis.com/auth/calendar'],
  )

  const calendar = google.calendar({
    version: 'v3',
    auth: jwt,
  })

  const currentDateTime = date || DateTime.local({ zone: 'America/Los_Angeles' })

  // find a calendar event matching the key on this date
  const res = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: currentDateTime.startOf('day').toISO() || undefined,
    timeMax: currentDateTime.endOf('day').toISO() || undefined,
    singleEvents: true,
    orderBy: 'startTime',
  })

  // find the first event that matches the key and ends after the current time
  const event = res.data.items
    ?.filter(
      event =>
        event.end?.dateTime &&
        DateTime.fromISO(event.end.dateTime, {
          zone: 'America/Los_Angeles',
        }) > currentDateTime,
    )
    ?.find(event => event.summary?.includes(key))

  if (!event || !event.id) {
    return undefined
  }

  // update the description of the event with the given message
  await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId: event.id,
    requestBody: {
      description: message,
    },
  })

  return event
}
