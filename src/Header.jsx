import setView from "./App.jsx";
import {useRef} from "react";

export default function Header({ setView, loggedIn }) {
  return (
    <header id="hud">
        
        <div className="header-btn" onClick={() => setView({ screen: "home"})}>
              Home
        </div>
        {/* <a className="header-btn" onClick={() => setView({ screen: "register"})}>
              Register / Log in
        </a> */}





        {/* <div className="hidden-container">            
            <div className="modal" id="example">
                <div className="modal-header">
                    <h2>Register</h2>
                </div>                                
                <div className="modal-body" id="example-txt">
                    <label htmlFor="reg-username">Username</label>
                    <input type="text" name="" id="reg-username"/>
                    <label htmlFor="">Password</label>
                    <input type="password" name="" id="reg-password"/>
                </div>
            </div>
        </div>
        <form className="login-form" action="">
                <label htmlFor="email">Email</label>
                <a href="" id="register-btn">Register</a>
                <input id="email" type="email" required />
                <label htmlFor="password">Password<a href="" id="forgot-pass">Forgot password?</a></label>
                <input id="password" type="password" required/>
                <button id="login-btn">Log in</button>
                <label htmlFor="remember-me"><input type="checkbox" name="" id="remember-me"/>Remember me</label>
        </form> */}
    </header>
  );
}

