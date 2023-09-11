import Note from './Note'

// eslint-disable-next-line
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createNote (note: Note) {
  const params = {
    TableName: process.env.NOTES_TABLE,
    Item: note
  }
  try {
    await docClient.put(params).promise()
    return note
  } catch (err) {
    console.log('DynamoDB error: ', err)
    return null
  }
}

export default createNote
