import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const ws = new WebSocket("wss://rw-bingo-board-viewer.onrender.com");
ws.onopen = () => {
  console.log("connected");
  ws.send("Spectator connected");
};
ws.onclose = () => {
  console.log("connection closed");
};
ws.onerror = () => (e) => {
  console.log(e);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App socket={ws} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
