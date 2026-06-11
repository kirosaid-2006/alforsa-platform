// Forsa Client-Side JavaScript
document.addEventListener('DOMContentLoaded', () => {
    
    // Auto-dismiss Flash Messages after 5 seconds
    const flashMessages = document.querySelectorAll('.flash-message');
    if (flashMessages.length > 0) {
        setTimeout(() => {
            flashMessages.forEach(msg => {
                msg.style.opacity = '0';
                msg.style.transition = 'opacity 0.5s ease';
                setTimeout(() => msg.remove(), 500);
            });
        }, 5000);
    }

    // Survey Conditional Logic (for outcome survey page)
    const outcomeRadios = document.querySelectorAll('input[name="outcome"]');
    const viaPlatformDiv = document.getElementById('via_platform_group');
    
    if (outcomeRadios.length > 0 && viaPlatformDiv) {
        outcomeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'hired') {
                    viaPlatformDiv.style.display = 'block';
                    // Make it required
                    const viaPlatformInputs = viaPlatformDiv.querySelectorAll('input[type="radio"]');
                    viaPlatformInputs.forEach(input => input.required = true);
                } else {
                    viaPlatformDiv.style.display = 'none';
                    const viaPlatformInputs = viaPlatformDiv.querySelectorAll('input[type="radio"]');
                    viaPlatformInputs.forEach(input => {
                        input.required = false;
                        input.checked = false;
                    });
                }
            });
        });
    }

    // AJAX Apply / Reveal Contact Info Button
    const applyBtn = document.getElementById('btn-apply-reveal');
    if (applyBtn) {
        applyBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const jobId = this.getAttribute('data-job-id');
            const contactSection = document.getElementById('contact-info-section');
            
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = 'جاري المعالجة... ⏳';
            this.disabled = true;

            try {
                const response = await fetch(`/jobs/${jobId}/apply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Hide button, show contact section
                    this.style.display = 'none';
                    contactSection.style.display = 'block';
                    
                    // Fill data
                    if (data.phone) {
                        const phoneEl = document.getElementById('c-phone');
                        phoneEl.textContent = data.phone;
                        phoneEl.href = `tel:${data.phone}`;
                    }
                    if (data.whatsapp) {
                        const waEl = document.getElementById('c-whatsapp');
                        waEl.textContent = data.whatsapp;
                        waEl.href = `https://wa.me/2${data.whatsapp}`;
                    }
                    if (data.email) {
                        const emailEl = document.getElementById('c-email');
                        emailEl.textContent = data.email;
                        emailEl.href = `mailto:${data.email}`;
                    }
                    
                    // Show success message
                    if (data.message) {
                        const alert = document.createElement('div');
                        alert.className = 'flash-message flash-success';
                        alert.textContent = data.message;
                        contactSection.prepend(alert);
                    }
                    
                } else {
                    if (response.status === 401) {
                        window.location.href = '/auth/login?redirect=/jobs/' + document.getElementById('job-slug').value;
                    } else {
                        alert(data.error || 'حدث خطأ، يرجى المحاولة مرة أخرى');
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }
                }
            } catch (err) {
                console.error(err);
                alert('حدث خطأ في الاتصال بالسيرفر.');
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }
});
