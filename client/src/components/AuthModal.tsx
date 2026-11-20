import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import styled from 'styled-components';
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageProvider";


interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    /** Called after successful auth */
    onAuthSuccess?: (isNewUser: boolean, relationship?: string, userId?: string) => void;
    defaultTab?: "login" | "register";
    /** Optional message shown at the top of the modal (e.g. to explain why auth is required) */
    promptMessage?: string;
}

const StyledWrapper = styled.div`
  .form-box {
    width: 100%;
    background: #f1f7fe;
    overflow: hidden;
    border-radius: 16px;
    color: #010101;
    position: relative;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .form {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 24px 24px 20px;
    gap: 12px;
    text-align: center;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
    z-index: 20;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover { color: #000; background: rgba(0,0,0,0.05); }

  .title {
    font-weight: bold;
    font-size: 1.6rem;
    color: #1a1a1a;
    margin-top: 8px;
  }

  .subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 4px 0;
  }

  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  .divider span { font-size: 0.75rem; color: #9ca3af; white-space: nowrap; }

  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 10px 16px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .google-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .form-container {
    overflow: hidden;
    border-radius: 8px;
    background-color: #fff;
    margin: 0.5rem 0 0.5rem;
    width: 100%;
    border: 1px solid #e5e7eb;
  }

  .input {
    background: none;
    border: 0;
    outline: 0;
    height: 42px;
    width: 100%;
    border-bottom: 1px solid #eee;
    font-size: .95rem;
    padding: 6px 15px;
    transition: all 0.2s;
  }

  .input:last-child { border-bottom: none; }
  .input:focus { background-color: #f9fafb; }

  .form-section {
    padding: 12px;
    font-size: .85rem;
    background-color: #e0ecfb;
    box-shadow: rgb(0 0 0 / 8%) 0 -1px;
    text-align: center;
  }

  .form-section a {
    font-weight: bold;
    color: #0066ff;
    transition: color .3s ease;
    cursor: pointer;
    margin-left: 4px;
  }

  .form-section a:hover { color: #005ce6; text-decoration: underline; }

  .submit-btn {
    background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
    color: #fff;
    border: 0;
    border-radius: 24px;
    padding: 10px 16px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 4px;
  }

  .submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  }

  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
`;

export default function AuthModal({ open, onClose, onAuthSuccess, defaultTab = "login", promptMessage }: AuthModalProps) {
    const { toast } = useToast();
    const { login, register } = useAuth();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [authError, setAuthError] = useState<string | null>(null);

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const resetErrors = () => setAuthError(null);

    const switchTab = (tab: "login" | "register") => setActiveTab(tab);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await login(loginEmail, loginPassword);
            toast({ title: "Welcome back!", description: "Successfully logged in." });
            onAuthSuccess?.(false, response.user?.user_relation, response.user_id);
            onClose();
        } catch (error: any) {
            setAuthError(error.message || "Please check your credentials and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await register({
                name: registerName,
                email: registerEmail,
                password: registerPassword,
            });
            toast({ title: "Account created!", description: "Welcome to Janmasethu." });
            onAuthSuccess?.(true, result.user?.user_relation, result.user?.user_id);
            onClose();
        } catch (error: any) {
            setAuthError(error.message || "Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        // Redirect to backend Google OAuth endpoint (server-side flow)
        window.location.href = '/api/proxy/auth/google';
    };

    const isLogin = activeTab === "login";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="p-0 !border-none !bg-transparent !shadow-none w-[90vw] max-w-[380px] [&>button]:hidden z-[10001] mx-auto">
                <StyledWrapper>
                    <div className="form-box">
                        {/* Close Button */}
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <form className="form" onSubmit={isLogin ? handleLogin : handleRegister}>
                            {/* Optional prompt message (e.g. from journey gate) */}
                            {promptMessage && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-700 font-medium text-center">
                                    ✨ {promptMessage}
                                </div>
                            )}

                            <span className="title">
                                {isLogin ? t('General.Auth.auth_welcome_back') : t('General.Auth.auth_start_journey')}
                            </span>
                            <span className="subtitle">
                                {isLogin
                                    ? t('General.Auth.auth_login_subtitle')
                                    : t('General.Auth.auth_register_subtitle')}
                            </span>

                            {authError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-medium text-left">
                                    {authError}
                                </div>
                            )}

                            {/* Google Sign-In Button (server-side redirect) */}
                            <div className="flex justify-center w-full">
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        width: '100%',
                                        maxWidth: '320px',
                                        padding: '8px 24px',
                                        border: '1px solid #dadce0',
                                        borderRadius: '999px',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#3c4043',
                                        fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
                                        transition: 'box-shadow 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                    {isLogin ? t('General.Auth.auth_google_signin') : t('General.Auth.auth_google_signup')}
                                </button>
                            </div>

                            <div className="divider">
                                <span>{isLogin ? t('General.Auth.auth_or_signin_email') : t('General.Auth.auth_or_signup_email')}</span>
                            </div>

                            <div className="form-container">
                                {!isLogin && (
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder={t('General.Auth.auth_name_placeholder')}
                                        value={registerName}
                                        onChange={(e) => setRegisterName(e.target.value)}
                                        required
                                    />
                                )}
                                <input
                                    type="email"
                                    className="input"
                                    placeholder={t('General.Auth.auth_email_placeholder')}
                                    value={isLogin ? loginEmail : registerEmail}
                                    onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="password"
                                    className="input"
                                    placeholder={t('General.Auth.auth_password_placeholder')}
                                    value={isLogin ? loginPassword : registerPassword}
                                    onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button className="submit-btn" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isLogin ? t('General.Auth.auth_logging_in') : t('General.Auth.auth_creating_account')}
                                    </>
                                ) : (
                                    isLogin ? t('General.Auth.auth_login') : t('General.Auth.auth_signup')
                                )}
                            </button>
                        </form>

                        <div className="form-section">
                            <p>
                                {isLogin ? t('General.Auth.auth_no_account') : t('General.Auth.auth_have_account')}
                                <a onClick={() => switchTab(isLogin ? "register" : "login")}>
                                    {isLogin ? t('General.Auth.auth_signup') : t('General.Auth.auth_login')}
                                </a>
                            </p>
                        </div>
                    </div>
                </StyledWrapper>
            </DialogContent>
        </Dialog>
    );
}
