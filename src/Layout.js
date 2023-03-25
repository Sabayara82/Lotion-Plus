import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import NoteList from "./NoteList";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "./utils";
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const localStorageKey = "lotion-v1";

function Layout() {
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  const [collapse, setCollapse] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);
  const [accessToken, setAccessToken] = useState(null);
  

  /*
  useEffect(() => {
    const height = mainContainerRef.current.offsetHeight;
    mainContainerRef.current.style.maxHeight = `${height}px`;
    const existing = localStorage.getItem(localStorageKey);
    if (existing) {
      try {
        setNotes(JSON.parse(existing));
      } catch {
        setNotes([]);
      }
    }
  }, []);


  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);
  */

  // Google sign in
  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState(null);
  const [signedIn, setSignedIn] = useState(false);

  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(() => {
      if (user) {
        setAccessToken(user.access_token); 
        console.log(accessToken); 
        axios
          .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: 'application/json'
            }
          })
          .then((res) => {
            setProfile(res.data);
          })
          .catch((err) => console.log(err));
      }
    },
    [ user ]
  );

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  useEffect(() => {
    if (currentNote < 0) {
      return;
    }
    if (!editMode) {
      navigate(`/notes/${currentNote + 1}`);
      return;
    }
    navigate(`/notes/${currentNote + 1}/edit`);
  }, [notes]);

  const saveNote = async (note, index, user) => {
    setEditMode(false);
    note.body = note.body.replaceAll("<p><br></p>", "");
    setNotes([
      ...notes.slice(0, index),
      { ...note },
      ...notes.slice(index + 1),
    ]);
    setCurrentNote(index);
    const email = profile.email;

    const res = await fetch(
      "https://aul2ci566ue5wwmansvau2fo3q0bdsrh.lambda-url.ca-central-1.on.aws/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication": accessToken
        },
        body: JSON.stringify({...note, email: profile.email})
      }
    );
  };

  const deleteNote = async (index, user) => {
    const noteId = notes[index].id;
    const email = profile.email;
    {accessToken ? console.log(accessToken):console.log("accessToken failed")};
    const res = await fetch(
      "https://sxuav6odmwl3zbgadhuja6kbrq0fqper.lambda-url.ca-central-1.on.aws/",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication": accessToken
        },
        body: JSON.stringify({id: noteId, email: email})
      }
    );
    setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
    setCurrentNote(0);
    setEditMode(false);
  };

  const getNotes = async (profile) => {
    const email = profile.email;
    console.log(email);
    const res = await fetch(
      "https://z7ynxwj6rihdzqg4gwnvpygdgq0aoelw.lambda-url.ca-central-1.on.aws/",
      {
        method: "GET",
        headers: {
          "Content-Type" : "application/json",
          "Authentication": accessToken
        }
      }
    );
    const data = await res.json();
    console.log("Data: " + data.data);
    setNotes(data.data);
  }

  const addNote = () => {
    setNotes([
      {
        id: uuidv4(),
        title: "Untitled",
        body: "",
        when: currentDate(),
      },
      ...notes,
    ]);
    setEditMode(true);
    setCurrentNote(0);
  };

  return (
    <div>
    {profile ? (<div id="container">
      <header>
        <aside>
          <button id="menu-button" onClick={() => setCollapse(!collapse)}>
            &#9776;
          </button>
        </aside>
        <div id="app-header">
          <h1>
            <Link to="/notes">Lotion</Link>
          </h1>
          <h6 id="app-moto">Like Notion, but worse.</h6>
        </div>
        <div id="right">
        <div id="absolute">{signedIn ? "" : ""}</div>
        <button id={signedIn ? ("log-out-button"):("log-out-button-hidden")} onClick={() => logOut()}>{profile.name} (Log out)</button>
      </div>
      </header>
      <div id="main-container" ref={mainContainerRef}>
        <aside id="sidebar" className={collapse ? "hidden" : null}>
          <header>
            <div id="notes-list-heading">
              <h2>Notes</h2>
              <button id="new-note-button" onClick={addNote}>
                +
              </button>
            </div>
          </header>
          <div id="notes-holder">
            <NoteList notes={notes} />
          </div>
        </aside>
        <div id="write-box">
          <Outlet context={[notes, saveNote, deleteNote]} />
        </div>
      </div>
    </div>) : (
      <div id="login">
        <header>
          <aside> 
            <button id="menu-button" onClick={() => setCollapse(!collapse)}>
              &#9776;
            </button>
          </aside>
          <div id="app-header">
              <h1>
                <Link to="/notes">Lotion</Link>
              </h1>
              <h6 id="app-moto">Like Notion, but worse.</h6>
            </div>
            <aside>&nbsp;</aside>
        </header>
        <div id = "sign-in">
          <GoogleLogin onSuccess={() => {login();setSignedIn(true);}}
            onError = {(error) => console.log("Login Failed: ", error)}/>
      </div>
      </div>
    )}
  </div>
  );
}

export default Layout;
