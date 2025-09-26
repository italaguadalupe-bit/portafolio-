// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .stat-card, .timeline-item, .skill-item');
    animateElements.forEach(el => observer.observe(el));
});

// ===== VALIDACIÓN Y ENVÍO DE FORMULARIO CON FORMSPREE =====

// Función para validar el formato del email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para mostrar errores en campos específicos
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    // Agregar clase de error al campo
    field.classList.add('error');
    
    // Mostrar mensaje de error
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Función para limpiar errores de un campo
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    // Quitar clase de error del campo
    field.classList.remove('error');
    
    // Ocultar mensaje de error
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
}

// Función para limpiar todos los errores
function clearAllErrors() {
    clearFieldError('nombre');
    clearFieldError('email');
    clearFieldError('mensaje');
}

// Función para validar el formulario completo
function validateForm() {
    let isValid = true;
    
    // Obtener valores de los campos
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    // Limpiar errores anteriores
    clearAllErrors();
    
    // Validar campo Nombre
    if (!nombre) {
        showFieldError('nombre', 'El nombre es obligatorio');
        isValid = false;
    } else if (nombre.length < 2) {
        showFieldError('nombre', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar campo Email
    if (!email) {
        showFieldError('email', 'El correo electrónico es obligatorio');
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'Por favor, ingresa un correo electrónico válido');
        isValid = false;
    }
    
    // Validar campo Mensaje
    if (!mensaje) {
        showFieldError('mensaje', 'El mensaje es obligatorio');
        isValid = false;
    } else if (mensaje.length < 10) {
        showFieldError('mensaje', 'El mensaje debe tener al menos 10 caracteres');
        isValid = false;
    }
    
    return isValid;
}

// Manejo del envío del formulario con Formspree
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevenir envío por defecto
            
            // Validar formulario antes de enviar
            if (!validateForm()) {
                showNotification('Por favor, corrige los errores en el formulario', 'error');
                return;
            }
            
            // Mostrar estado de carga
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                // Crear FormData con los datos del formulario
                const formData = new FormData(this);
                
                // Enviar datos a Formspree
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Éxito: mostrar mensaje de confirmación
                    contactForm.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    // Mostrar notificación adicional
                    showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                    
                    // Limpiar formulario (por si se vuelve a mostrar)
                    this.reset();
                    clearAllErrors();
                    
                } else {
                    // Error del servidor
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al enviar el mensaje');
                }
                
            } catch (error) {
                // Error de red o validación
                console.error('Error:', error);
                showNotification('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
            } finally {
                // Restaurar estado del botón
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
        
        // Validación en tiempo real para mejorar UX
        const fields = ['nombre', 'email', 'mensaje'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            
            // Limpiar errores cuando el usuario empiece a escribir
            field.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    clearFieldError(fieldId);
                }
            });
            
            // Validar campo cuando pierda el foco
            field.addEventListener('blur', function() {
                const value = this.value.trim();
                
                if (fieldId === 'nombre' && value && value.length < 2) {
                    showFieldError(fieldId, 'El nombre debe tener al menos 2 caracteres');
                } else if (fieldId === 'email' && value && !validateEmail(value)) {
                    showFieldError(fieldId, 'Por favor, ingresa un correo electrónico válido');
                } else if (fieldId === 'mensaje' && value && value.length < 10) {
                    showFieldError(fieldId, 'El mensaje debe tener al menos 10 caracteres');
                }
            });
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .stat-content h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        if (target && target > 0) {
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    const displayValue = Math.ceil(current);
                    
                    if (counter.textContent.includes('%')) {
                        counter.textContent = displayValue + '%';
                    } else if (counter.textContent.includes('+')) {
                        counter.textContent = displayValue + '+';
                    } else {
                        counter.textContent = displayValue;
                    }
                    
                    requestAnimationFrame(updateCounter);
                } else {
                    if (counter.textContent.includes('%')) {
                        counter.textContent = target + '%';
                    } else if (counter.textContent.includes('+')) {
                        counter.textContent = target + '+';
                    } else {
                        counter.textContent = target;
                    }
                }
            };
            
            updateCounter();
        }
    });
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        // Uncomment the line below to enable typing effect
        // typeWriter(heroTitle, originalText, 50);
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add fade-in animation to main content
    const mainContent = document.querySelectorAll('section');
    mainContent.forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Initialize page styles for loading animation
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelectorAll('section');
    mainContent.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
});

// Add hover effects to service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Add click-to-copy functionality for email
document.addEventListener('DOMContentLoaded', () => {
    const emailElement = document.querySelector('.contact-item p');
    if (emailElement && emailElement.textContent.includes('@')) {
        emailElement.style.cursor = 'pointer';
        emailElement.title = 'Click para copiar';
        
        emailElement.addEventListener('click', () => {
            const email = emailElement.textContent.trim();
            navigator.clipboard.writeText(email).then(() => {
                showNotification('Email copiado al portapapeles', 'success');
            }).catch(() => {
                showNotification('No se pudo copiar el email', 'error');
            });
        });
    }
});

// Add smooth reveal animation for timeline items
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        timelineObserver.observe(item);
    });
});

