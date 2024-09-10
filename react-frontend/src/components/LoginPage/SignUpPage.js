import React, { useEffect, useState } from 'react';
import { classNames } from 'primereact/utils';
import { connect } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputOtp } from 'primereact/inputotp';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../services/restClient';

import GoogleOauth from './GoogleOauth';
import FacebookOauth from './FacebookOauth';
import GithubOauth from './GithubOauth';
import AppleOauth from './AppleOauth';
// import { deviceDetect } from "react-device-detect";
const SignUpPage = (props) => {
    const navigate = useNavigate();
    const isSignup = /signup/.test(location.pathname);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [maskPassword, setMaskPassword] = useState(true);
    const [isVerified, setVerified] = useState(false);
    const [code, setCode] = useState();
    const [codeError, setCodeError] = useState('');
    const [genCode, setGenCode] = useState();

    const onEnter = (e) => {
        if (e.key === 'Enter') signup();
    };

    const signup = async () => {
        if (validatePassword()) {
            const user = await _getUserEmail();
            if (user?.data?.length === 0) {
                props.createUser({ name, email, password }).then(async (res) => {
                    navigate('/login');
                });
            } else {
                navigate('/login');
            }
        }
    };

    const validatePassword = () => {
        let isValid = true;
        if (password !== confirmPassword) {
            setPasswordError('password is correct.');
            isValid = false;
        }
        return isValid;
    };

    const validate = () => {
        let isValid = true;
        let re = /\S+@\S+\.\S+/;
        if (email === '') {
            setEmailError('Email is required.');
            isValid = false;
        } else if (!re.test(email)) {
            setEmailError('Please Enter a valid email');
            isValid = false;
        }

        if (name === '') {
            setNameError('name is required');
            isValid = false;
        } else if (name?.length < 3) {
            setNameError('Must be at least 3 characters long');
            isValid = false;
        }

        return isValid;
    };

    const renderPasswordPolicyErrors = () => {
        const { passwordPolicyErrors } = props;
        if (!(Array.isArray(passwordPolicyErrors) && passwordPolicyErrors.length)) return null;
        return passwordPolicyErrors.map((message, i) => {
            return (
                <p className="m-0" key={'pass-policy-' + i}>
                    <small className="p-error">{message}</small>
                </p>
            );
        });
    };

    const _getUserEmail = async () => {
        return await client.service('users').find({
            query: {
                email: email
            }
        });
    };

    const _getEmail = async () => {
        return await client.service('userInvites').find({
            query: {
                emailToInvite: email
            }
        });
    };

    const _setUserInvite = async (id, count) => {
        return await client.service('userInvites').patch(id, {
            sendMailCounter: count,
            status: true
        });
    };

    const validateEmailSentCount = (userInvite) => {
        if (userInvite.sendMailCounter > 3) {
            props.alert({
                title: 'Too many retries',
                type: 'error',
                message: 'Proceed to contact admin.'
            });
            return false;
        }
        return true;
    };

    const createUserInvite = async (code) => {
        const _data = {
            emailToInvite: email,
            status: false,
            code: code,
            sendMailCounter: 0
        };
        return await client.service('userInvites').create(_data);
    };

    const resendMail = async () => {
        if (!validate()) return;

        const userInviteData = await _getEmail();
        let userInvite = userInviteData?.data[0];
        let _code = null;
        if (!userInvite?.code) {
            _code = codeGen();
            setGenCode(_code);
            userInvite = await createUserInvite(_code);
            console.log(userInvite);
        } else {
            setGenCode(userInvite.code);
        }
        if (!validateEmailSentCount(userInvite)) return;

        const _mail = {
            name: 'onCodeVerifyEmail',
            type: 'signup',
            from: 'info@cloudbasha.com',
            recipients: [email, 'kana@cloudbasha.com'],
            status: true,
            data: { name: name, code: _code ? _code : userInvite.code },
            subject: 'signup verify processing',
            templateId: 'onCodeVerify'
        };

        setLoading(true);
        await client.service('mailQues').create(_mail);
        props.alert({
            title: 'Verification email sent.',
            type: 'success',
            message: 'Proceed to check your email inbox.'
        });
        _setUserInvite(userInvite._id, Number(userInvite.sendMailCounter) + 1);
        setLoading(false);
    };

    const codeGen = () => {
        let _code = Math.floor(Math.random() * 999999);
        while (_code < 100001) {
            _code = Math.floor(Math.random() * 999999);
        }
        return _code;
    };

    const verify = async () => {
        const userInviteData = await _getEmail();
        let userInvite = userInviteData?.data[0];
        if (Number(code) === Number(genCode) || Number(code) === Number(userInvite?.code)) {
            setVerified(true);
            props.alert({
                title: 'Verification successful.',
                type: 'success',
                message: 'Proceed to create your account.'
            });
        } else {
            setCodeError('Code verification failed');
            props.alert({
                title: 'Verification failed.',
                type: 'error',
                message: 'Proceed to contact admin.'
            });
        }
    };

    const customInput = ({ events, props }) => {
        return (
            <>
                <input {...events} {...props} type="number" className="custom-otp-input-sample" />
                {props.id === 2 && (
                    // <div className="px-3">
                    <i className="pi pi-minus p-0 ml-2 mr-2" />
                    // </div>
                )}
            </>
        );
    };

    const inputOTP = () => {
        return (
            <div className="w-full">
                <style scoped>
                    {`
                    .custom-otp-input-sample {
                        width: 48px;
                        height: 48px;
                        font-size: 24px;
                        appearance: none;
                        text-align: center;
                        transition: all 0.2s;
                        border-radius: 0;
                        border: 1px solid var(--surface-400);
                        background: transparent;
                        outline-offset: -2px;
                        outline-color: transparent;
                        border-right: 0 none;
                        transition: outline-color 0.3s;
                        color: var(--text-color);
                    }

                    .custom-otp-input-sample:focus {
                        outline: 2px solid var(--primary-color);
                    }

                    .custom-otp-input-sample:first-child,
                    .custom-otp-input-sample:nth-child(5) {
                        border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                    }

                    .custom-otp-input-sample:nth-child(3),
                    .custom-otp-input-sample:last-child {
                        border-top-right-radius: 12px;
                        border-bottom-right-radius: 12px;
                        border-right-width: 1px;
                        border-right-style: solid;
                        border-color: var(--surface-400);
                    }
                `}
                </style>
                <p className="font-bold text-xl mb-2">Authenticate Your Email Address</p>
                <p className="text-color-secondary block mb-5">Please enter the code sent to your email.</p>
                <InputOtp
                    value={code}
                    onChange={(e) => {
                        setCode(e.value);
                        setCodeError(null);
                    }}
                    length={6}
                    inputTemplate={customInput}
                    style={{ gap: 0 }}
                />
                <small className="p-error">{codeError}</small>
                <div className="flex justify-content-between mt-5 align-self-stretch">
                    <Button label="Resend Code" loading={loading} link className="p-0" onClick={resendMail}></Button>
                    <Button label="Submit Code" loading={loading} onClick={verify}></Button>
                </div>
            </div>
        );
    };

    return (
        <div className="grid p-fluid flex flex-column align-items-center h-screen">
            <div
                className={classNames('col-12 lg:col-5 px-6', {
                    'mt-8 pt-8': isSignup
                })}
            >
                <div className="card">
                    <div>
                        <p>
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </div>
                    <div style={{ height: '20px' }} />
                    <div className="flex flex-column align-items-center">
                        <h4>Sign Up (Customer Portal)</h4>
                        <div className="col-12 lg:col-8">
                            <p className="m-0">Name</p>
                            <InputText
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setNameError(null);
                                }}
                                className={nameError !== '' ? 'p-invalid' : ''}
                                onKeyDown={onEnter}
                            ></InputText>
                            <small className="p-error">{nameError}</small>
                        </div>
                        <div className="col-12 lg:col-8">
                            <p className="m-0">Email</p>
                            <InputText
                                type="text"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value.trim().toLowerCase());
                                    setEmailError(null);
                                }}
                                className={emailError !== '' ? 'p-invalid' : ''}
                                onKeyDown={onEnter}
                            ></InputText>
                            <small className="p-error">{emailError}</small>
                        </div>
                        <div className={classNames('col-12 lg:col-8', { hidden: !isVerified })}>
                            <p className="m-0">Password</p>
                            <span className="p-input-icon-right">
                                <i className={`pi ${maskPassword ? 'pi-eye' : 'pi-eye-slash'} cursor-pointer`} onClick={() => setMaskPassword(!maskPassword)} title={`${maskPassword ? 'Show' : 'Hide'} password`} />
                                <InputText
                                    type={maskPassword ? 'password' : 'text'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value.trim());
                                        setPasswordError(null);
                                    }}
                                    className={passwordError !== '' ? 'p-invalid' : ''}
                                    onKeyDown={onEnter}
                                ></InputText>
                            </span>
                            <small className="p-error">{passwordError}</small>
                            {renderPasswordPolicyErrors()}
                            <p className="m-0">Confirm Password</p>
                            <span className="p-input-icon-right">
                                <i className={`pi ${maskPassword ? 'pi-eye' : 'pi-eye-slash'} cursor-pointer`} onClick={() => setMaskPassword(!maskPassword)} title={`${maskPassword ? 'Show' : 'Hide'} password`} />
                                <InputText
                                    type={maskPassword ? 'password' : 'text'}
                                    placeholder="Enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value.trim());
                                    }}
                                    onKeyDown={onEnter}
                                ></InputText>
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-content-center mt-3">
                        <div className={classNames('col-6 lg:col-6', { hidden: !isVerified })}>
                            <Button label="Sign Up" className="p-button-raised p-button-rounded" onClick={signup}></Button>
                        </div>
                        <div className={classNames('col-12 lg:col-10', { hidden: isVerified })}>{inputOTP()}</div>
                    </div>
                    {/* <div className="flex flex-column align-items-center mt-3">
                        <div className="col-12 lg:col-8">
                            <div className="flex">
                                <p className="m-0">Or Signup with</p>
                                <hr
                                    style={{
                                        width: '60%',
                                        marginLeft: '5%',
                                        marginTop: '3%',
                                        borderTop: '1px solid #000'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-12 lg:col-8">
                            <GoogleOauth props={props} type={'signup'} />
                        </div>
                       <div className="col-12 lg:col-8">
                            <FacebookOauth props={props} type={'signup'} />
                        </div>
                        <div className="col-12 lg:col-8">
                            <GithubOauth props={props} type={'signup'} />
                        </div>
                        <div className="col-12 lg:col-8">
                            <AppleOauth props={props} type={'signup'} />
                        </div>
                    </div> */}
                </div>
            </div>
            <div style={{ height: '100px' }} />
        </div>
    );
};

const mapState = (state) => {
    const { isLoggedIn, passwordPolicyErrors } = state.auth;
    return { isLoggedIn, passwordPolicyErrors };
};
const mapDispatch = (dispatch) => ({
    createUser: (data) => dispatch.auth.createUser(data),
    alert: (data) => dispatch.toast.alert(data)
});

export default connect(mapState, mapDispatch)(SignUpPage);
