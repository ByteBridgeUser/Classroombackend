
import './App.css';
import React, { useState } from "react";
import { useNavigate ,Router} from "react-router-dom";
import {
  
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  getAuth
} from "firebase/auth";
import { auth } from "./firebase";
import OtpInput from 'react-otp-input';



function App() {
  

  const [number, setNumber] = useState("");
  const [flag, setFlag] = useState(false);
  const [btn, setbtn] = useState(false);
  const [btn2, setbtn2] = useState(false);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState("");
  // const [otp, setOtp] = useState('');
  // const navigate=useNavigate();

 

  function setUpRecaptha(number) {
    try {
      console.log(number)
      // let numberf="+91"+number;
      const recaptchaVerifier = new RecaptchaVerifier(
        "r",
        {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("recapchta done");
            console.log(response)
          }},
        auth
      );
      recaptchaVerifier.render();
      console.log(number);
      return signInWithPhoneNumber(auth, number, recaptchaVerifier);
      
    } catch (error) {
      console.log(error.message)
      
    }
    
  }
  
  const getOtp = async (e) => {
    setbtn(true);
    try {
      e.preventDefault();
      let numberf="+91"+number;
      console.log(numberf)
    
    
      const response = await setUpRecaptha(numberf);
        setResult(response);
        setFlag(true);
        console.log(response);


        
      
    } catch (error) {
      console.log(error.message)
      
    }
   
   };
  const onChange = (e)=>{
    setNumber(e.target.value)
}
  const onChange2 = (e)=>{
    setOtp(e.target.value)
}
const verifyOtp = async (e) => {
  setbtn2(true);
  e.preventDefault();

  try {
    await result.confirm(otp);


    // navigate("/driverpanel");
    alert("signed in")
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      console.log("Auth", currentuser.accessToken);
      localStorage.setItem("tokencabzee",currentuser.accessToken);
      
      // setUser(currentuser);\
    })

  } catch (err) {
    alert(err.message);
  
};}







  return (<>

  
<


  


    

  </> );
}

export default App;
