import React from 'react'
import './offcanvas_nav.css'

export default function offcanvas_nav() 
{

    // function openNav() {
    //     document.getElementById("mySidenav").style.width = "250px";
    //     document.getElementById("main").style.marginLeft = "250px";
    //     document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    //   }

    //   function closeNav() {
    //     document.getElementById("mySidenav").style.width = "0";
    //     document.getElementById("main").style.marginLeft = "0";
    //     document.body.style.backgroundColor = "white";
    //   }
       
  return (
    <>
        {/* <div id="mySidenav" className="sidenav">
            <a href="javascript:void(0)" className="closebtn" onClick={closeNav()}>&times;</a>
            <a href="#">About</a>
            <a href="#">Services</a>
            <a href="#">Clients</a>
            <a href="#">Contact</a>
        </div>
        <span onClick={openNav()}>open</span> */}
      <div className='left'>
        <ul class="nav">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Active</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
          </li>
        </ul>
      </div>
    </>
  )
}
