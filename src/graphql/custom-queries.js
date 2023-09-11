export const getScreens = meeting_id => {
  return /* GraphQL */ `
    query GetScreens {
      getScreens(meeting_id: ${meeting_id}) {
        statusCode
        body
        headers
      }
    }
  `;
};
