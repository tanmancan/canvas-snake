import React, { useEffect } from "react";
import { GameController } from "../GameController";

import "./App.css";

function App() {
  useEffect(() => {
    const gameController = GameController.create();
    gameController.run();
  }, []);
  return <div id="board"></div>;
}

export default App;
