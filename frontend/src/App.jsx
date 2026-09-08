import { useEffect, useRef, useState, Fragment } from "react";
import { registerParticipant } from "./services/registrationApi";
import "./index.css";

import aceLogo from "./assets/ace-logo.png";
import currentTeam from "./assets/ace-current-team.jpg";
import previousTeam from "./assets/ace-previous-team.jpg";
import cseHome from "./assets/csehome.png";


/* =========================================================
   FLOATING ACE — CONTENT
========================================================= */

const ACE_ITEMS = [
    {
        id: 1,
        title: "Association for Computing Machinery",
        text: "Where ideas turn into action.",
    },
    {
        id: 2,
        title: "Built by Students",
        text: "Driven by curiosity, creativity, and code.",
    },
    {
        id: 3,
        title: "Innovate. Lead. Excel.",
        text: "Think beyond the ordinary.",
    },
    {
        id: 4,
        title: "Learn. Build. Share.",
        text: "Grow together, one idea at a time.",
    },
    {
        id: 5,
        title: "More Than a Club",
        text: "A community of CSE students and creators.",
    },
    {
        id: 6,
        title: "Carry the Legacy",
        text: "Every generation leaves something behind.",
    },
    {
        id: 7,
        title: "Your Ideas Matter",
        text: "Every great project starts with a thought.",
    },
    {
        id: 8,
        title: "The Story Continues",
        text: "The next chapter belongs to you.",
    },
];

const ACE_POPUP_AUTO_DISMISS_MS = 4000;

const TOAST_AUTO_DISMISS_MS = 6000;
const TOAST_EXIT_DURATION_MS = 320;


/* =========================================================
   FOOTER TEXT ANIMATION HELPERS

   splitLetters -> used only for the short "ACE" wordmark,
   where each individual letter sliding in reads as an
   intentional flourish.

   splitWords -> used for longer footer lines. Real space
   text nodes are kept BETWEEN the word <span> elements
   (not inside them), so normal line-wrapping still works
   correctly on narrow screens — only the words themselves
   animate, not raw single letters that would otherwise
   break mid-word on wrap.
========================================================= */

function splitLetters(text, startDelay = 0, step = 0.06) {

    return text.split("").map((char, index) => (

        <span
            key={`l-${index}`}
            className="letter-anim"
            style={{
                transitionDelay:
                    `${startDelay + index * step}s`,
            }}
        >
            {char}
        </span>

    ));

}

function splitWords(text, startDelay = 0, step = 0.05) {

    const words = text.split(" ");
    const nodes = [];

    words.forEach((word, index) => {

        nodes.push(

            <span
                key={`w-${index}`}
                className="word-anim"
                style={{
                    transitionDelay:
                        `${startDelay + index * step}s`,
                }}
            >
                {word}
            </span>

        );

        if (index < words.length - 1) {
            nodes.push(" ");
        }

    });

    return nodes;

}


function App() {

    /* =====================================================
       REFS
    ===================================================== */

    const heroRef = useRef(null);
    const aboutRef = useRef(null);
    const formRef = useRef(null);
    const footerRef = useRef(null);

    const acePopupTimerRef = useRef(null);

    const toastAutoTimerRef = useRef(null);
    const toastExitTimerRef = useRef(null);


    /* =====================================================
       HEADER & ROUTING STATE
    ===================================================== */

    const [scrolled, setScrolled] = useState(false);


    /* =====================================================
       FLOATING ACE STATE
    ===================================================== */

    const [activeAcePopup, setActiveAcePopup] = useState(null);

    const [formActive, setFormActive] = useState(false);


    /* =====================================================
       FOOTER REVEAL STATE
    ===================================================== */

    const [footerInView, setFooterInView] = useState(false);


    /* =====================================================
       REGISTRATION FORM STATE
    ===================================================== */

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        branch: "",
        gender: "",
        year: "",
        mode: "Normal",
        registrationType: "ACM India",
        payment: "",
        goodies: "",
    });


    /* =====================================================
       SUBMISSION STATE
    ===================================================== */

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    /* =====================================================
       SUCCESS TOAST STATE

       "hidden"  -> not rendered at all
       "visible" -> entrance animation, timer running
       "closing" -> exit animation playing, then unmounts
    ===================================================== */

    const [toastPhase, setToastPhase] = useState("hidden");

    const [toastData, setToastData] = useState({
        name: "",
        aceId: "",
        message: "",
        emailStatus: "",
    });


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    useEffect(() => {

        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };

    }, []);


    /* =====================================================
       FOOTER SCROLL REVEAL

       One-time reveal: once the footer has entered the
       viewport, the observer disconnects so the letters/
       words don't replay every time the user scrolls
       past it again.
    ===================================================== */

    useEffect(() => {

        const node = footerRef.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {
                        setFooterInView(true);
                        observer.unobserve(entry.target);
                    }

                });

            },
            { threshold: 0.25 }
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };

    }, []);


    /* =====================================================
       ACE POPUP — AUTO DISMISS
    ===================================================== */

    useEffect(() => {

        if (acePopupTimerRef.current) {
            clearTimeout(acePopupTimerRef.current);
        }

        if (activeAcePopup !== null) {

            acePopupTimerRef.current = setTimeout(() => {
                setActiveAcePopup(null);
            }, ACE_POPUP_AUTO_DISMISS_MS);

        }

        return () => {

            if (acePopupTimerRef.current) {
                clearTimeout(acePopupTimerRef.current);
            }

        };

    }, [activeAcePopup]);


    /* =====================================================
       ACE POPUP — CLICK OUTSIDE TO CLOSE
    ===================================================== */

    useEffect(() => {

        const handleDocumentClick = (e) => {

            const clickedAce =
                e.target.closest(".ace-item");

            const clickedPopup =
                e.target.closest(".ace-popup");

            if (!clickedAce && !clickedPopup) {
                setActiveAcePopup(null);
            }

        };

        document.addEventListener(
            "click",
            handleDocumentClick
        );

        return () => {

            document.removeEventListener(
                "click",
                handleDocumentClick
            );

        };

    }, []);


    /* =====================================================
       ACE CLICK HANDLER
    ===================================================== */

    const handleAceClick = (id) => {

        if (formActive) {
            return;
        }

        setActiveAcePopup((previous) => (
            previous === id ? null : id
        ));

    };


    /* =====================================================
       FORM FOCUS / BLUR — PAUSE + RESUME ACE LAYER
    ===================================================== */

    const handleFormFocus = () => {

        setFormActive(true);

        setActiveAcePopup(null);

    };

    const handleFormBlur = (e) => {

        // Only treat it as "left the form" if focus moved
        // somewhere outside the form entirely.

        if (!e.currentTarget.contains(e.relatedTarget)) {
            setFormActive(false);
        }

    };


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const scrollToHero = () => {

        heroRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    };


    const scrollToAbout = () => {

        aboutRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

    };


    const scrollToForm = () => {

        formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

    };


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");

    };


    /* =====================================================
       SUCCESS TOAST — CLOSE (manual or timed)
    ===================================================== */

    const closeToast = () => {

        setToastPhase("closing");

        if (toastExitTimerRef.current) {
            clearTimeout(toastExitTimerRef.current);
        }

        toastExitTimerRef.current = setTimeout(() => {
            setToastPhase("hidden");
        }, TOAST_EXIT_DURATION_MS);

    };


    /* =====================================================
       SUCCESS TOAST — AUTO DISMISS TIMER
    ===================================================== */

    useEffect(() => {

        if (toastAutoTimerRef.current) {
            clearTimeout(toastAutoTimerRef.current);
        }

        if (toastPhase === "visible") {

            toastAutoTimerRef.current = setTimeout(() => {
                closeToast();
            }, TOAST_AUTO_DISMISS_MS);

        }

        return () => {

            if (toastAutoTimerRef.current) {
                clearTimeout(toastAutoTimerRef.current);
            }

        };

    }, [toastPhase]);


    /* =====================================================
       CLEAR ANY PENDING TOAST TIMERS ON UNMOUNT
    ===================================================== */

    useEffect(() => {

        return () => {

            if (toastAutoTimerRef.current) {
                clearTimeout(toastAutoTimerRef.current);
            }

            if (toastExitTimerRef.current) {
                clearTimeout(toastExitTimerRef.current);
            }

        };

    }, []);


    /* =====================================================
       FORM SUBMISSION

       On success the registration form stays on screen —
       no page swap. A toast slides in to confirm the
       registration, the form clears itself for the next
       entrant, and the toast dismisses itself shortly
       after (or the user can close it immediately).
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            /*
                Backend expects the complete Gmail address.

                Frontend only asks the EBMs to enter
                the username part.
            */

            const emailUsername =
                formData.email.trim().toLowerCase().replace(/@.*$/, "");

            const email =
                `${emailUsername}@gmail.com`;


            const response =
                await registerParticipant({
                    ...formData,
                    typeOfRegistration: formData.registrationType,
                    email,
                });


            setToastData({
                name: formData.name,
                aceId: response.aceId || "",
                message: response.message,
                emailStatus: response.emailStatus,
            });

            setToastPhase("visible");


            setFormData({
                name: "",
                email: "",
                phone: "",
                branch: "",
                gender: "",
                year: "",
                mode: "Normal",
                registrationType: "ACM India",
                payment: "",
                goodies: "",
            });

        } catch (err) {

            const message =
                err.response?.data?.message ||
                "Registration failed. Please try again.";

            setError(message);

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="app">


            {/* ELEGANT COSMIC ASTEROID SHOWER BACKGROUND */}
            <div className="asteroid-container" aria-hidden="true">
                <div className="asteroid asteroid-1" />
                <div className="asteroid asteroid-2" />
                <div className="asteroid asteroid-3" />
                <div className="asteroid asteroid-4" />
                <div className="asteroid asteroid-5" />
                <div className="asteroid asteroid-6" />
                <div className="asteroid asteroid-7" />
                <div className="asteroid asteroid-8" />
                <div className="asteroid asteroid-9" />
                <div className="asteroid asteroid-10" />
                <div className="asteroid asteroid-11" />
                <div className="asteroid asteroid-12" />
            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <header
                className={`site-header ${
                    scrolled ? "scrolled" : ""
                }`}
            >

                <div className="header-inner">


                    {/* ACE BRAND */}

                    <div
                        className="brand"
                        onClick={scrollToHero}
                        role="button"
                        tabIndex={0}
                    >

                        <img
                            src={aceLogo}
                            alt="ACM Logo"
                            className="header-logo"
                        />

                        <div className="brand-text">

                            <strong>ACM</strong>

                            <span>
                                SRKR Engineering College
                            </span>

                        </div>

                    </div>


                    {/* NAVIGATION */}

                    <nav className="header-nav">

                        <button onClick={scrollToAbout}>
                            About
                        </button>

                        <button onClick={scrollToForm}>
                            Register
                        </button>

                    </nav>

                </div>

            </header>



            {/* =================================================
                SUCCESS TOAST

                Fixed to the viewport so it appears above
                whatever the user is looking at — it never
                replaces the hero, form, or about content.
            ================================================= */}

            {toastPhase !== "hidden" && (

                <div
                    className={`success-toast marvel-toast ${
                        toastPhase === "closing"
                            ? "toast-closing"
                            : "toast-visible"
                    }`}
                    role="status"
                >

                    <div className="toast-icon marvel-icon">
                        🛡️
                    </div>


                    <div className="toast-body">

                        <div className="marvel-quote-box">
                            <span className="marvel-quote-badge">⚡ MARVEL HERO DIRECTIVE ⚡</span>
                            <blockquote className="marvel-quote-text">
                                “With great power comes great responsibility.”
                            </blockquote>
                        </div>

                        <strong>
                            Freshers Assembled! Welcome to ACM, {toastData.name}.
                        </strong>

                        {toastData.aceId && (
                            <div className="marvel-hero-id-box">
                                <span className="marvel-hero-id-label">MEMBER / PASS ID</span>
                                <span className="marvel-hero-id-code">{toastData.aceId}</span>
                            </div>
                        )}

                        <p className="marvel-toast-sub">
                            Your official ACM 2026 Hero Pass has been issued successfully.
                        </p>

                        {toastData.message && (

                            <p className="toast-message">
                                {toastData.message}
                            </p>

                        )}

                        {toastData.emailStatus === "Failed" && (

                            <p className="toast-warning">
                                Your registration is safe in our system. The ACM team can resend your confirmation email if required.
                            </p>

                        )}

                    </div>


                    <button
                        type="button"
                        className="toast-close"
                        onClick={closeToast}
                        aria-label="Close notification"
                    >
                        ×
                    </button>


                    {toastPhase === "visible" && (

                        <div
                            className="toast-progress marvel-progress"
                            aria-hidden="true"
                        ></div>

                    )}

                </div>

            )}



            {/* =================================================
                HERO
            ================================================= */}

            <section
                ref={heroRef}
                className="hero"
                style={{
                    backgroundImage:
                        `url(${cseHome})`,
                }}
            >

                <div className="hero-overlay"></div>


                <div className="hero-content">


                    {/* HERO LOGO */}

                    <div className="hero-logo-container">

                        <img
                            src={aceLogo}
                            alt="ACM Logo"
                            className="hero-logo"
                        />

                    </div>


                    {/* HERO TITLE */}

                    <h1>
                        Welcome to ACM
                    </h1>


                    {/* TAGLINE */}

                    <p className="tagline">
                        Innovate. Lead. Excel.
                    </p>


                    {/* DESCRIPTION */}

                    <p className="description">
                        The Official CSE Student Club
                        at SRKR Engineering College
                    </p>


                    {/* FEATURES */}

                    <div className="features">

                        <span>
                            &lt;/&gt;&nbsp;
                            CSE Powered
                        </span>

                        <span>
                            ♧&nbsp;
                            Student Driven
                        </span>

                        <span>
                            ♜&nbsp;
                            Future Focused
                        </span>

                    </div>


                    {/* REGISTER BUTTON */}

                    <button
                        className="primary-button hero-button"
                        onClick={scrollToForm}
                    >

                        Register Now

                        <span>
                            →
                        </span>

                    </button>

                </div>

            </section>



            {/* =================================================
                REGISTRATION SECTION
            ================================================= */}

            <section
                className="registration-section"
                ref={formRef}
            >


                {/* FLOATING ACE — interactive */}

                <div
                    className={`floating-ace-layer ${
                        formActive ? "paused" : ""
                    }`}
                >

                    {ACE_ITEMS.map((item) => (

                        <Fragment key={item.id}>

                            <button
                                type="button"
                                className={`floating-ace ace-item ace-${item.id} ${
                                    activeAcePopup === item.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleAceClick(item.id)
                                }
                                disabled={formActive}
                                tabIndex={
                                    formActive ? -1 : 0
                                }
                                aria-label={
                                    `${item.title} — ${item.text}`
                                }
                            >
                                ACM
                            </button>

                            {activeAcePopup === item.id && (

                                <div
                                    className={`ace-popup ace-popup-${item.id}`}
                                    role="status"
                                >

                                    <strong>
                                        {item.title}
                                    </strong>

                                    <p>
                                        {item.text}
                                    </p>

                                </div>

                            )}

                        </Fragment>

                    ))}

                </div>



                {/* REGISTRATION HEADING */}

                <div className="section-heading">

                    <span className="section-eyebrow">
                        AVENGERS INITIATIVE • ACM 2026
                    </span>

                    <h2>
                        FRESHERS ASSEMBLE TO ACM
                    </h2>

                    <p>
                        With great power comes great responsibility. Step up, join the elite CSE assembly, and shape the future.
                    </p>

                </div>



                {/* REGISTRATION FORM */}

                <form
                    className="registration-card"
                    onSubmit={handleSubmit}
                    onFocus={handleFormFocus}
                    onBlur={handleFormBlur}
                >


                    {/* INTRO */}

                    <div className="form-intro">

                        <span className="form-badge">🛡️ AVENGERS ASSEMBLE PASS</span>

                        <strong>
                            Freshers Assemble to ACM
                        </strong>

                        <span>
                            Fill in your hero dossier to claim your official ACM pass
                        </span>

                    </div>



                    {/* SECTION 1: PERSONAL DETAILS */}
                    <div className="form-section-header">
                        <span className="section-step-num">01</span>
                        <span className="section-step-title">Personal Details</span>
                    </div>

                    {/* NAME */}

                    <div className="field">

                        <label>
                            <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Full Name <span className="req-star">*</span>
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />

                    </div>



                    {/* EMAIL */}

                    <div className="field">

                        <label>
                            <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            Gmail Address <span className="req-star">*</span>
                        </label>

                        <div className="email-input-wrapper">

                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter Gmail username"
                                required
                            />

                            <span className="gmail-suffix">
                                @gmail.com
                            </span>

                        </div>

                    </div>



                    {/* PHONE + DEPARTMENT */}

                    <div className="field-row">

                        <div className="field">

                            <label>
                                <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                Phone Number <span className="req-star">*</span>
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit number"
                                pattern="[0-9]{10}"
                                maxLength="10"
                                required
                            />

                        </div>


                        <div className="field">

                            <label>
                                <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                                Department <span className="req-star">*</span>
                            </label>

                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Department
                                </option>

                                <option value="CSE">
                                    CSE
                                </option>

                                <option value="AIML">
                                    AIML
                                </option>

                                <option value="CIC">
                                    CIC
                                </option>

                                <option value="IT">
                                    IT
                                </option>

                                <option value="AIDS">
                                    AIDS
                                </option>

                                <option value="CSBS">
                                    CSBS
                                </option>

                                <option value="CSIT">
                                    CSIT
                                </option>

                                <option value="CSD">
                                    CSD
                                </option>

                                <option value="ECE">
                                    ECE
                                </option>

                                <option value="EEE">
                                    EEE
                                </option>

                                <option value="CIVIL">
                                    Civil
                                </option>

                                <option value="MECH">
                                    Mechanical
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* SECTION 2: OPTIONS & PREFERENCES */}
                    <div className="form-section-header">
                        <span className="section-step-num">02</span>
                        <span className="section-step-title">Preferences & Year</span>
                    </div>

                    {/* GENDER + PAYMENT */}

                    <div className="field-row">

                        <div className="field">

                            <label>
                                <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"></path><path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"></path></svg>
                                Gender <span className="req-star">*</span>
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div className="field">

                            <label>
                                <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                Payment Mode <span className="req-star">*</span>
                            </label>

                            <select
                                name="payment"
                                value={formData.payment}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Mode
                                </option>

                                <option value="Online">
                                    Online
                                </option>

                                <option value="Offline">
                                    Offline
                                </option>

                            </select>

                        </div>

                    </div>



                    {/* YEAR */}

                    <div className="field">

                        <label>
                            <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Year of Study <span className="req-star">*</span>
                        </label>

                        <div className="radio-group">
                            {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
                                <label key={yr} className="radio-option">
                                    <input
                                        type="radio"
                                        name="year"
                                        value={yr}
                                        checked={formData.year === yr}
                                        onChange={handleChange}
                                        required
                                    />
                                    {yr}
                                </label>
                            ))}
                        </div>

                    </div>



                    {/* ADMISSION MODE */}

                    <div className="field">

                        <label>
                            <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                            Admission Mode <span className="req-star">*</span>
                        </label>

                        <div className="radio-group">
                            {["Normal", "Lateral"].map((m) => (
                                <label key={m} className="radio-option">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value={m}
                                        checked={formData.mode === m}
                                        onChange={handleChange}
                                        required
                                    />
                                    {m}
                                </label>
                            ))}
                        </div>

                    </div>



                    {/* GOODIES */}

                    <div className="field">

                        <label>
                            <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                            Goodies / Swag Kit <span className="req-star">*</span>
                        </label>

                        <div className="radio-group">

                            <label className="radio-option">

                                <input
                                    type="radio"
                                    name="goodies"
                                    value="Yes"
                                    checked={
                                        formData.goodies ===
                                        "Yes"
                                    }
                                    onChange={handleChange}
                                    required
                                />

                                Received

                            </label>


                            <label className="radio-option">

                                <input
                                    type="radio"
                                    name="goodies"
                                    value="No"
                                    checked={
                                        formData.goodies ===
                                        "No"
                                    }
                                    onChange={handleChange}
                                />

                                Not Received

                            </label>

                        </div>

                    </div>



                    {/* TYPE OF REGISTRATION */}

                    <div className="field">

                        <label>
                            <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Type of Registration <span className="req-star">*</span>
                        </label>

                        <div className="radio-group">

                            <label className={`radio-option ${formData.registrationType === "ACM India" ? "selected" : ""}`}>

                                <input
                                    type="radio"
                                    name="registrationType"
                                    value="ACM India"
                                    checked={
                                        formData.registrationType === "ACM India"
                                    }
                                    onChange={handleChange}
                                    required
                                />

                                ACM India

                            </label>


                            <label className={`radio-option ${formData.registrationType === "Local Body Chapter" ? "selected" : ""}`}>

                                <input
                                    type="radio"
                                    name="registrationType"
                                    value="Local Body Chapter"
                                    checked={
                                        formData.registrationType === "Local Body Chapter"
                                    }
                                    onChange={handleChange}
                                />

                                Local Body Chapter

                            </label>

                        </div>

                    </div>



                    {/* ERROR */}

                    {error && (

                        <div className="error-message">
                            {error}
                        </div>

                    )}



                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >

                        {loading ? (
                            <span className="submit-loading">
                                <span className="spinner"></span> Processing Registration...
                            </span>
                        ) : (
                            <span className="submit-content">
                                Freshers Assemble to ACM
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </span>
                        )}

                    </button>

                </form>

            </section>



            {/* =================================================
                ABOUT / ACE STORY
            ================================================= */}

            <section
                ref={aboutRef}
                className="ace-story"
            >


                {/* ABOUT HEADING */}

                <div className="story-heading">

                    <span className="story-eyebrow">
                        THE ACM COMMUNITY · SINCE 2006
                    </span>

                    <h2>
                        More Than Two Decades.
                    </h2>

                    <p>
                        For over 20 years, ACM has been
                        carried forward by one generation
                        of CSE students after another.
                        What you see here is just the
                        latest handoff in a much longer
                        story.
                    </p>

                </div>



                {/* STORY CONTENT */}

                <div className="story-container">


                    {/* LEFT: STORY TEXT */}

                    <div className="story-text">

                        <h3>
                            Built by Students.
                            <br />
                            Carried Forward by Students.
                        </h3>


                        <p>
                            Since 2006, ACM has grown through
                            the ideas, efforts, and experience
                            of every batch that has passed
                            through it — far more generations
                            than any single photo could
                            ever hold.
                        </p>


                        <p>
                            These two photos capture the ongoing journey of ACM, passing the torch from one generation of CSE leaders to the next.
                        </p>



                        {/* TIMELINE */}

                        <div className="story-timeline">

                            <div className="timeline-item">

                                <span className="timeline-dot"></span>

                                <div>

                                    <strong>
                                        Previous Leadership
                                    </strong>

                                    <p>
                                        The outgoing team who paved the way.
                                    </p>

                                </div>

                            </div>


                            <div className="timeline-line"></div>


                            <div className="timeline-item">

                                <span className="timeline-dot active"></span>

                                <div>

                                    <strong>
                                        Current Team
                                    </strong>

                                    <p>
                                        Continuing the legacy and driving innovation forward.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>



                    {/* =================================================
                        RIGHT: GENERATION PHOTO STORY
                    ================================================= */}

                    <div className="story-visual">

                        <div className="generation-gallery">


                            {/* TEAM PHOTO 1 */}

                            <div className="generation-card previous-generation">

                                <img
                                    src={previousTeam}
                                    alt="ACM leadership team"
                                />

                                <div className="generation-label">


                                    ACM SBM 2025

                                </div>

                            </div>



                            {/* CONNECTOR */}

                            <div
                                className="generation-path"
                                aria-hidden="true"
                            >

                                <svg
                                    viewBox="0 0 110 110"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >

                                    <circle
                                        className="path-dot"
                                        cx="12"
                                        cy="12"
                                        r="4"
                                    />

                                    <path
                                        className="path-curve"
                                        d="M 17 17 Q 55 55 90 88"
                                    />

                                    <circle
                                        className="path-arrow-circle"
                                        cx="96"
                                        cy="94"
                                        r="16"
                                    />

                                    <text
                                        x="96"
                                        y="99"
                                        textAnchor="middle"
                                        className="path-arrow-glyph"
                                    >
                                        →
                                    </text>

                                </svg>

                            </div>



                            {/* TEAM PHOTO 2 */}

                            <div className="generation-card current-generation">

                                <img
                                    src={currentTeam}
                                    alt="ACM team"
                                />

                                <div className="generation-label">
                                        ACM SBM 2026
                                    

                                </div>

                            </div>

                        </div>

                    </div>

                </div>



                {/* =================================================
                    OFFICIAL FOOTER — letters/words animate in
                    once this footer scrolls into view
                ================================================= */}

                <div
                    ref={footerRef}
                    className={`story-footer ${
                        footerInView ? "in-view" : ""
                    }`}
                >

                    <div className="story-footer-brand">

                        <span className="footer-ace-mark">
                            {splitLetters("ACM", 0)}
                        </span>

                        <p>
                            {splitWords(
                                "Association for Computing Machinery",
                                0.2
                            )}
                        </p>

                    </div>

                    <div className="story-footer-meta">

                        <p>
                            {splitWords(
                                "SRKR Engineering College · Est. 2006",
                                0.45
                            )}
                        </p>

                        <p>
                            {splitWords(
                                "Carrying forward 20+ years of student " +
                                "leadership in Computer Science & Engineering.",
                                0.6
                            )}
                        </p>

                    </div>

                </div>

            </section>

            {/* COSMIC PLANET HORIZON LANDSCAPE */}
            <div className="planet-horizon-wrapper" aria-hidden="true">
                <div className="planet-horizon-arc" />
            </div>

        </div>

    );
}


export default App;
