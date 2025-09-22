import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const el = id => document.getElementById(id);
    const STORAGE_USERS = "citycare_users_v1";
    let users = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");

    const loginPage = el("loginPage");
    const registerPage = el("registerPage");
    const showPage = (pageToShow) => {
        loginPage.classList.toggle("hidden", pageToShow !== loginPage);
        registerPage.classList.toggle("hidden", pageToShow !== registerPage);
    };
    el("goToRegister")?.addEventListener("click", e => { e.preventDefault(); showPage(registerPage); });
    el("goToLogin")?.addEventListener("click", e => { e.preventDefault(); showPage(loginPage); });

    el("registerForm")?.addEventListener("submit", e => {
        e.preventDefault();
        const email = el("emailReg").value.trim().toLowerCase();
        if (users.find(u => u.email === email)) return alert("Email already registered!");
        users.push({
            fname: el("firstnameReg").value.trim(), lname: el("lastnameReg").value.trim(),
            email: email, pw: el("passwordReg").value, role: el("roleReg").value
        });
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        alert("Registration successful! Please login.");
        el("registerForm").reset();
        showPage(loginPage);
    });

    el("loginForm")?.addEventListener("submit", e => {
        e.preventDefault();
        const email = el("emailLogin").value.trim().toLowerCase();
        const pw = el("passwordLogin").value;
        const user = users.find(u => u.email === email && u.pw === pw);
        if (!user) return alert("Invalid credentials!");
        localStorage.setItem("citycare_loggedIn", JSON.stringify(user));
        window.location.href = "index.html";
    });

    const handleGoogleAuth = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const googleUser = result.user;
                let localUser = users.find(u => u.email === googleUser.email);

                if (!localUser) {
                    const [fname, ...lnameParts] = googleUser.displayName.split(' ');
                    localUser = {
                        fname: fname || 'Google', lname: lnameParts.join(' ') || 'User',
                        email: googleUser.email, pw: '', role: 'citizen'
                    };
                    users.push(localUser);
                    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
                }
                localStorage.setItem("citycare_loggedIn", JSON.stringify(localUser));
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Google Sign-In Error:", error);
                alert(`Error during Google sign-in: ${error.message}`);
            });
    };

    el("googleSignInBtn")?.addEventListener("click", handleGoogleAuth);
    el("googleSignUpBtn")?.addEventListener("click", handleGoogleAuth);
});
