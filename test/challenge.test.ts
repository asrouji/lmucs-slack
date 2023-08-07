import events from '../api/events'
import SlackRequest from '../types/SlackRequest'
import SlackResponse from '../types/SlackResponse'

describe('challenge', () => {
  test('returns the slack challenge', async () => {
    const req = {
      body: {
        type: 'url_verification',
        challenge: 'test-challenge',
      },
    } as SlackRequest
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as SlackResponse
    await events(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ challenge: 'test-challenge' })
  })
})
