import { DateTime } from 'luxon'
import { updateTutoringSessionDescription } from '../api/_calendar'

const date = DateTime.fromObject(
  {
    year: 2023,
    month: 8,
    day: 7,
    hour: 16,
  },
  {
    zone: 'America/Los_Angeles',
  },
)

const res = await updateTutoringSessionDescription('Aidan S', 'hello world!', date)

console.log(res ? `Updated event "${res.summary}"` : 'No event found')
