import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Layout from "./Layout";
import WriteBox from "./WriteBox";
import Empty from "./Empty";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Empty />} />
          <Route path="/notes" element={<Empty />} />
          <Route
            path="/notes/:noteId/edit"
            element={<WriteBox edit={true} />}
          />
          <Route path="/notes/:noteId" element={<WriteBox edit={false} />} />
          {/* any other path */}
          <Route path="*" element={<Empty />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <GoogleOAuthProvider clientId="771499498177-eb4bsupflvgfin9m49jahtl9ujnoiq6p.apps.googleusercontent.com">
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>
  </>
);

reportWebVitals();