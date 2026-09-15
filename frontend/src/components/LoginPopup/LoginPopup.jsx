import { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
import { toast } from 'react-toastify'


const LoginPopup = ({ setShowLogin, }) => {

  const { url, setToken } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Sign Up");
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (currState === "Sign Up") {
      if (!data.name.trim()) {
        toast.error("Please enter your name");
        return;
      }
      if (data.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
    }

    setLoading(true);

    try {
      let newUrl = url;
      let payload = { email: data.email, password: data.password };

      if (currState === "Login") {
        newUrl += "/api/user/login";
      } else {
        newUrl += "/api/user/register";
        payload.name = data.name.trim();
      }

      const response = await axios.post(newUrl, payload);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("userName", response.data.user.name);
          localStorage.setItem("userEmail", response.data.user.email);
        }
        setShowLogin(false);

        toast.success(`Welcome to Cravio, ${response.data.user?.name || ''}! 🎉`);
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errMsg);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>

        {/* Header */}
        <div className='login-popup-title'>
          <h2>{currState === 'Sign Up' ? 'Create Account' : 'Welcome Back!'}</h2>
          <button
            type="button"
            className='login-popup-close'
            onClick={() => setShowLogin(false)}
          >
            <img src={assets.cross_icon} alt="close" />
          </button>
        </div>

        <p className='login-popup-subtitle'>
          {currState === 'Sign Up'
            ? 'Join Cravio and enjoy fresh pure veg food delivered to your door.'
            : 'Sign in to your Cravio account to continue ordering.'}
        </p>

        {/* Input Fields */}
        <div className="login-popup-inputs">
          {currState === 'Sign Up' && (
            <input type="text" name='name' onChange={onChangeHandler} value={data.name} placeholder="Your Full Name" required />
          )}
          <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder="Email Address" required />
          <input type="password" name='password' onChange={onChangeHandler} value={data.password} placeholder="Password" required />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? "Please wait..." : (currState === 'Sign Up' ? 'Create Account →' : 'Sign In →')}
        </button>

        {/* Terms */}
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to Cravio's terms of service and privacy policy.</p>
        </div>

        {/* Switch state */}
        <p className='login-popup-switch'>
          {currState === "Login"
            ? <>New to Cravio? <span onClick={() => { setCurrState("Sign Up"); setData(prev => ({ ...prev, name: "" })) }}>Create account</span></>
            : <>Already have an account? <span onClick={() => { setCurrState("Login"); setData(prev => ({ ...prev, name: "" })) }}>Sign in</span></>
          }
        </p>

      </form>
    </div>
  )
}

export default LoginPopup