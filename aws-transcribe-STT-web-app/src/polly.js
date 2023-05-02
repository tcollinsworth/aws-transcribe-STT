import { Polly } from '@aws-sdk/client-polly'

document.querySelector('#Speak').addEventListener('click', helloWorld)

async function helloWorld() {
  try {
    const pollyClient = new Polly({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'AKIASVNUSJB36VCOC6HL',
        secretAccessKey: '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',
      },
    })

    const params = {
      OutputFormat: 'mp3',
      Text: 'Hello World!',
      VoiceId: 'Joanna',
    }

    const data = await pollyClient.synthesizeSpeech(params)
    const uInt8Array = new Uint8Array(data.AudioStream)
    const arrayBuffer = uInt8Array.buffer
    const blob = new Blob([arrayBuffer])
    const audioUrl = window.URL.createObjectURL(blob)
    const audio = new Audio(audioUrl)
    audio.play()
  } catch (err) {
    console.log(err)
  }
}
