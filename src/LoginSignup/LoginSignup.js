import React from 'react';
import './LoginSignup.css'

const LoginSignup = () => {
    return (
        <div className='addUser'>
            <h3>Sign up</h3>
            <form className='addUseraForm'>
                <div className='inputGroup'>
                    <label htmlFor='name'>Name:</label>
                    <input
                        type='text'
                        id='name'
                        autoComplete='off'
                        placeholder='Enter your name'
                    />
                    <label htmlFor='email'>Email:</label>
                    <input
                        type='email'
                        id='email'
                        autoComplete='off'
                        placeholder='Enter your email'
                    />
                    <label htmlFor='password'>Password:</label>
                    <input
                        type='password'
                        id='password'
                        autoComplete='off'
                        placeholder='Enter your password'
                    />
                    <button type='submit' >Sign up</button>
                </div>
            </form>
            <div className='login'>
                <p>Already have an account?</p>
                <button type='submit' >Log in</button>
            </div>
        </div>
    )
    
}

export default LoginSignup