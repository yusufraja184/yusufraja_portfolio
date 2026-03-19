document.addEventListener("DOMContentLoaded", () => {
    // Navbar scroll effect
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const themeIcon = themeToggle.querySelector("i");
    
    // Check local storage for theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-mode");
        themeIcon.classList.replace("fa-sun", "fa-moon");
    }
    
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("light-mode");
        
        if (body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
            themeIcon.classList.replace("fa-sun", "fa-moon");
        } else {
            localStorage.setItem("theme", "dark");
            themeIcon.classList.replace("fa-moon", "fa-sun");
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Close mobile menu on link click
    document.querySelectorAll(".nav-links li a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-links li a");

    window.addEventListener("scroll", () => {
        let current = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute("id");
            }
        });

        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href").includes(current)) {
                item.classList.add("active");
            }
        });
    });

    // Simple scroll animation for elements
    const fadeElements = document.querySelectorAll(".fade-in, .stagger-in, .stat-card");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.6s ease-out";
        observer.observe(el);
    });

    // Add High-Tech Matrix Background
    const canvas = document.getElementById('matrix-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const characters = '01';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array.from({ length: columns }).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(12, 14, 20, 0.05)';
            if (document.body.classList.contains("light-mode")) {
                 ctx.fillStyle = 'rgba(240, 244, 248, 0.05)';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = document.body.classList.contains("light-mode") ? '#0084ff' : '#00e676';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        setInterval(drawMatrix, 50);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Typing Effect Logic
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const words = ['Data Science Engineer', 'C++ & Python Developer', 'Problem Solver'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function typeEffect() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingText.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let speed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentWord.length) {
                speed = 2000; // Pause at end of word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 500; // Pause before new word
            }
            
            setTimeout(typeEffect, speed);
        }
        
        typeEffect();
    }

    // Contact Form Submission Handling
    const contactForm = document.getElementById("contact-form");
    const formResponse = document.getElementById("form-response");
    
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById("submit-btn");
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span>Sending... <i class="fas fa-spinner fa-spin"></i></span>';
            submitBtn.disabled = true;
            
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formObject)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    formResponse.textContent = result.message || "Message sent successfully!";
                    formResponse.className = "form-response success";
                    contactForm.reset();
                } else {
                    formResponse.textContent = result.error || "Failed to send message.";
                    formResponse.className = "form-response error";
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                formResponse.textContent = "A network error occurred. Please try again later.";
                formResponse.className = "form-response error";
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clear response message after 5 seconds
                setTimeout(() => {
                    formResponse.textContent = "";
                    formResponse.className = "form-response";
                }, 5000);
            }
        });
    }
});
