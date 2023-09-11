import { useEffect, useState } from "react";
import './App.css';
import { listNotes, ListNotesQuery } from "./graphql";
import { API, graphqlOperation, Amplify } from "aws-amplify";
import awsconfig from "./aws-config";
Amplify.configure(awsconfig);

function App() {
  const [notes, setNotes] = useState<ListNotesQuery | undefined>(undefined);
  const [loading, setLoading] = useState<Boolean>(false);

  useEffect(() => {
    async function loadNotes() {
      setLoading(true);
      const { data } = await API.graphql(graphqlOperation(listNotes)) as { data: ListNotesQuery };
      console.log("Notes Data:", data);
      setNotes(data);
      setLoading(false);
    }
    loadNotes();
  }, []);

  if (loading) return <p className="App-main">loading ...</p>;

  return (
    <div className="App">
      <header className="App-header">All Notes</header>
      <div className="App-main">
        {notes?.listNotes?.map((note, index) => (
          <div key={index}>
            <p>
              {note?.id} - {note?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
