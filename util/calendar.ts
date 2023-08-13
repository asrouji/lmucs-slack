import { google } from 'googleapis'
import dotenv from 'dotenv'
import { DateTime } from 'luxon'

dotenv.config()

/**
 * Updates the description of a tutoring session matching the key on the given date.
 * @param key The key to match the tutoring session with.
 * @param message The message to set the description to.
 * @param date The date to search for the tutoring session on. Defaults to the current date.
 * @returns The event that was updated.
 */
export const updateTutoringSessionDescription = async (key: string, message: string, date?: DateTime) => {
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
