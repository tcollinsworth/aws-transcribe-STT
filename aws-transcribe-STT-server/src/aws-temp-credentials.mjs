import AWS from 'aws-sdk'

import express from 'express'
import wrap from 'express-async-wrap'

const router = new express.Router()

export default router

router.get('/getTemporaryCredentials', wrap(getTemporaryCredentials))

const credentials = new AWS.Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const sts = new AWS.STS({
  region: 'us-east-1',
  credentials,
})

// Transcribe policies https://docs.aws.amazon.com/transcribe/latest/dg/streaming-setting-up.html
// Must add http/2 and websocket policies documented above to role that will be used to get temp credentials

const AWS_TRANSCRIBE_POLICY_DOCUMENT = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Action: [
        'transcribe:StartStreamTranscription', // HTTP/2
        'transcribe:StartStreamTranscriptionWebSocket', // WS
      ],
      Resource: '*',
    },
  ],
})

async function getTemporaryCredentials(req, resp) {
  try {
    resp.setHeader('Access-Control-Allow-Origin', '*')
    resp.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE',
    )
    resp.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    const data = await sts.assumeRole(params).promise()
    const tempCredentials = {
      accessKeyId: `${data.Credentials.AccessKeyId}`,
      secretAccessKey: `${data.Credentials.SecretAccessKey}`,
      sessionToken: `${data.Credentials.SessionToken}`,
    }
    // console.log('data', JSON.stringify(data, null, '  '))
    // console.log('tempCredentials', JSON.stringify(tempCredentials, null, '  '))
    resp.json(tempCredentials)
  } catch (err) {
    console.log(err)
  }
}

// Create a new params object
const params = {
  DurationSeconds: 900, // 15 minutes minimum
  Policy: AWS_TRANSCRIBE_POLICY_DOCUMENT,
  RoleArn: 'arn:aws:iam::183451666551:role/soft-skill-simulator-transcribe-x', // FIXME use soft-skill-simulator-transcribe in EC2
  RoleSessionName: 'testRoleSessionName', // FIXME should be random, use UUID
}

// getTemporaryCredentials()
