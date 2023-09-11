// eslint-disable-next-line
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function listNotes () {
  const params = {
    TableName: process.env.NOTES_TABLE
  }
  try {
    const data = await docClient.scan(params).promise()
    return data.Items
  } catch (err) {
    console.log('DynamoDB error: ', err)
    return null
  }
}

export default listNotes
