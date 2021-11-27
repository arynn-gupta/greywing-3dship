import React from 'react';
import './App.css';
import './ship.js';

function App() {
  var screenWidth;
  var screenHeight;

  init();

  function init() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
  }

  var maxDegrees = 90;

  window.onmousemove = function (event) {
    var mouseX = event.pageX / screenWidth;
    var mouseY = event.pageY / screenHeight;
    var yDegrees = mouseX * maxDegrees - 0.5 * maxDegrees;
    var xDegrees = -0.5 * (mouseY * maxDegrees - 0.5 * maxDegrees);

    document.getElementsByClassName('logo')[0].style.transform =
      'rotateY(' + yDegrees + 'deg) rotateX(' + xDegrees + 'deg)';
  };
  return (
    <div className='App'>
      <div className='container'>
        Grey<div className='logo'>W</div>ing
      </div>
    </div>
  );
}

export default App;
