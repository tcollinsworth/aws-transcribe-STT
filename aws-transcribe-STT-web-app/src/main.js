// microphone-stream indicates it will only work from localhost or https
// it's easy to setup https on the server with a cert
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from '@aws-sdk/client-transcribe-streaming'

import MicrophoneStream from 'microphone-stream'

async function getTemporaryCredentials() {
  // FIXME call to server to get temporary credentials
  const response = await fetch('https://localhost:8888/getTemporaryCredentials')
  const temporaryCredentials = await response.json()
  // console.log(await response.json())
  return temporaryCredentials
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/

// Works, but never use this in the browser
// const credentials = {
//   accessKeyId: '********************',
//   secretAccessKey: '************************',
// }

// Works, but set below from call to server to get temporary credentials
// const credentials = {
//   accessKeyId: '****************',
//   secretAccessKey: '************************',
//   sessionToken: '*****************',
// }

document.querySelector('#Transcribe').addEventListener('click', startTranscribe)

// *****************************************
// must be called by user gesture on the page
// *****************************************

async function startTranscribe() {
  try {
    const credentials = await getTemporaryCredentials()
    const client = new TranscribeStreamingClient({
      region: 'us-east-1',
      credentials,
    })

    const micStream = new MicrophoneStream()
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    })
    micStream.setStream(stream)

    const audioStream = async function* () {
      for await (const chunk of micStream) {
        yield { AudioEvent: { AudioChunk: pcmEncodeChunk(chunk) /* pcm Encoding is optional depending on the source */ } }
      }
    }

    const command = new StartStreamTranscriptionCommand({
      // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
      LanguageCode: 'en-US',
      // The encoding used for the input audio. The only valid value is pcm.
      MediaEncoding: 'pcm',
      // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
      // high-quality audio. The sample rate must match the sample rate in the audio file.
      MediaSampleRateHertz: 44100,
      AudioStream: audioStream(),
      EnablePartialResultsStabilization: true,
      PartialResultsStability: 'medium', // "high" || "medium" || "low",
    })
    const response = await client.send(command)

    for await (const event of response.TranscriptResultStream) {
      console.log('event', JSON.stringify(event, null, '  '))
      if (event.TranscriptEvent) {
        const message = event.TranscriptEvent
        // Get multiple possible results
        const results = event.TranscriptEvent.Transcript.Results
        // Print all the possible transcripts
        results.map((result) => {
          (result.Alternatives || []).map((alternative) => {
            if (!alternative.isPartial) { // Check for stable text
              const transcript = alternative.Items.map((item) => item.Content).join(' ').replace(/\s+([.,!?:;])/g, '$1')
              // FIXME replace text area data
              document.querySelector('#stt').value = transcript
              console.log(transcript)
            }
            // const transcript = alternative.Items.map((item) => item.Content).join(' ')
            // //FIXME replace text area data
            // document.querySelector('#stt').value = transcript
            // console.log(transcript)
          })
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
}

function pcmEncodeChunk(chunk) {
  const input = MicrophoneStream.toRaw(chunk)
  let offset = 0
  const buffer = new ArrayBuffer(input.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return Buffer.from(buffer)
}
