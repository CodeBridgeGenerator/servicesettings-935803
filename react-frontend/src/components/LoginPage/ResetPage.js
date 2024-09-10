import React, { useEffect, useState } from 'react';
import { classNames } from 'primereact/utils';
import { connect } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import client from '../../services/restClient';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPage = (props) => {
    const navigate = useNavigate();
    const isReset = /reset/.test(location.pathname);
    const urlParams = useParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [maskPassword, setMaskPassword] = useState(true);

    useEffect(() => {
        checkChangePassword();
    }, [urlParams.singleChangeForgotPasswordId]);

    const checkChangePassword = async () => {
        const changePasswordData = await client.service('userChangePassword').find({ query: { _id: urlParams.singleChangeForgotPasswordId } });
        if (changePasswordData?.data?.length !== 0) {
            setEmail(changePasswordData?.data[0]?.userEmail);
        } else {
            setEmail('email not found');
        }
    };

    const onEnter = (e) => {
        if (e.key === 'Enter') savePassword();
    };

    const savePassword = async () => {
        if (validate()) {
            const userData = await client.service('users').find({ query: { email } });
            if (userData?.data?.length === 1)
                props.patchUser({ _id: userData?.data[0]?._id, data: { password: password } }).then((res) => {
                    // navigate("/login");
                });
        }
    };

    const validate = () => {
        let isValid = true;
        let re = /\S+@\S+\.\S+/;
        if (!password.length) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Must be at least 6 characters long and have at least one letter, digit, uppercase, lowercase and symbol');
            isValid = false;
        }

        if (password !== confirmPassword) {
            setPasswordError('Confirm Password is not correct');
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
    return (
        <div className="grid p-fluid flex flex-column align-items-center h-screen">
            <div
                className={classNames('col-12 lg:col-5 px-6', {
                    'mt-8 pt-8': isReset
                })}
            >
                <div className="card">
                    <div>
                        <p>
                            Already have an account? <a href="/login">Login</a>
                        </p>
                    </div>
                    <div style={{ height: '20px' }} />
                    <div className="flex flex-column align-items-center">
                        <h4>Change Password</h4>
                        <h4>for</h4>
                        <div className="col-12 lg:col-8">
                            <p className="text-xl flex justify-content-center">{email}</p>
                        </div>
                        <div className="col-12 lg:col-8">
                            <p className="m-0">New Password</p>
                            <span className="p-input-icon-right">
                                <i className={`pi ${maskPassword ? 'pi-eye' : 'pi-eye-slash'} cursor-pointer`} onClick={() => setMaskPassword(!maskPassword)} title={`${maskPassword ? 'Show' : 'Hide'} password`} />
                                <InputText
                                    type={maskPassword ? 'password' : 'text'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError(null);
                                    }}
                                    className={passwordError !== '' ? 'p-invalid' : ''}
                                    onKeyDown={onEnter}
                                ></InputText>
                            </span>
                            <small className="p-error">{passwordError}</small>
                            {renderPasswordPolicyErrors()}
                        </div>
                        <div className="col-12 lg:col-8">
                            <p className="m-0">Confirm Password</p>
                            <span className="p-input-icon-right">
                                <i className={`pi ${maskPassword ? 'pi-eye' : 'pi-eye-slash'} cursor-pointer`} onClick={() => setMaskPassword(!maskPassword)} title={`${maskPassword ? 'Show' : 'Hide'} password`} />
                                <InputText
                                    type={maskPassword ? 'password' : 'text'}
                                    placeholder="Enter your confirmed password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                    }}
                                ></InputText>
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-content-center mt-3">
                        <div className="col-6 lg:col-6">
                            <Button label="reset Password" className="p-button-raised p-button-rounded" onClick={savePassword}></Button>
                        </div>
                    </div>
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
    alert: (data) => dispatch.toast.alert(data),
    patchUser: (data) => dispatch.auth.patchUser(data)
});

export default connect(mapState, mapDispatch)(ResetPage);
