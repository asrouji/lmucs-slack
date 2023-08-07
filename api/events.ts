export default async function events(
  req: { body: { type: string; challenge: string } },
  res: { send: (message: string) => void },
) {
  const type = req.body.type

  if (type == 'url_verification') {
    res.send(req.body.challenge)
  } else if (type == 'event_callback') {
    console.log(req.body)
  }
}
