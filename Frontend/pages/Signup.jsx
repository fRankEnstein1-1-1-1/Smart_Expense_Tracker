import { useState } from "react";
import {useNavigate,Link} from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import "./Signup.css"

function Signup(){
const [name,setname] = useState("")
const [email,setemail]  = useState("")
const [password,setpassword] = useState("")
const[loading,isloading] = useState(false)
const {register} = useAuth()

const navigate = useNavigate()

const handleSubmit = async(e) =>{
    e.preventDefault()
    try{
        isloading(true)
    await register(name,email,password)
    navigate("/home")
    }
    catch(error){
        console.log(error)
    }
    finally{
        isloading(false)
    }
}
return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            className="signup-input"
            type="text"
            value={name}
            onChange={(e) => setname(e.target.value)}
            placeholder="Full Name"
            required
          />
          <input
            className="signup-input"
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            placeholder="Email Address"
            required
          />
          <input
            className="signup-input"
            type="password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button className="signup-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <Link to="/" className="login-link">
          Existing user? Sign in
        </Link>
      </div>
    </div>
  );
}
export default Signup