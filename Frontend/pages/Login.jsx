import {useState} from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate ,Link } from "react-router-dom"
import "./Login.css"

function Login(){
    const [email,setemail] = useState("")
    const [password,setpassword] = useState("")
    const [loading , setloading] = useState(false)
    const {login} = useAuth()
    const navigate = useNavigate()


     async function handleSubmit(e){
        e.preventDefault()
        try{
            setloading(true)
            await login (email,password)
            navigate("/home")
        }
        catch(error){
            console.log(error)
        }
        finally{
            setloading(false)
        }
    }

   return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Please enter your details to sign in</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            type="email" // Changed for validation
            placeholder="Email Address"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
          <input
            className="login-input"
            type="password" // Changed for security
            placeholder="Password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            required
          />
          <button 
            className="login-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/sign" className="signup-link">
          New User? Sign up
        </Link>
      </div>
    </div>
  );

}
export default Login