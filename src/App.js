import React, { useState, useEffect, useRef } from 'react';
import Layout from './Layout';
import jwt_decode from "jwt-decode";


function App() {
  //return <h1>Lotion</h1>;
  const [user, setUser] = useState({});
  

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwt_decode(response.credential);
    console.log(userObject);
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;
  }

  function handleSignOut(event) {
    setUser({});
    document.getElementById("signInDiv").hidden = false;
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "771499498177-eb4bsupflvgfin9m49jahtl9ujnoiq6p.apps.googleusercontent.com",
      callback: handleCallbackResponse
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large"}
    );

    google.accounts.id.prompt();
  }, []);

  // If we have no user: sign in button
  // If we have a user: show the log out button
  return(
    <div className="App">
      <div id="signInDiv"></div>
      { Object.keys(user).length !== 0 && 
        <button onClick={ (e) => handleSignOut(e)}>{user.name} (Log Out)</button>
      }
      { user &&
        <div>
        </div>
      }
    </div>
  );
}

export default App;
