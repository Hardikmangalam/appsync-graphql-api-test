// eslint-disable-next-line
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function deleteNote (noteId: string) {
  const params = {
    TableName: process.env.NOTES_TABLE,
    Key: {
      id: noteId
    }
  }
  try {
    await docClient.delete(params).promise()
    return noteId
  } catch (err) {
    console.log('DynamoDB error: ', err)
    return null
  }
}

export default deleteNote
