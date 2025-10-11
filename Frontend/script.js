let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('errorModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    
    if (event.target === successModal) {
        closeModal();
    }
    if (event.target === errorModal) {
        closeModal();
    }
}

// Close modal when clicking X button
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = closeModal;
});

// Contact form handling
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('input[type="submit"]');
    
    // Show loading state
    const originalText = submitButton.value;
    submitButton.value = 'Sending...';
    submitButton.disabled = true;
    
    try {
        const requestData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Debug logging
        console.log('Sending data:', requestData);
        
        const response = await fetch('https://portfolio-backend-t4iq.onrender.com/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (response.ok && result.success) {
            showModal('successModal');
            e.target.reset();
        } else {
            console.error('Server error:', result);
            
            // Enhanced error logging to see specific validation errors
            if (result.errors) {
                console.error('Validation errors:', result.errors);
                result.errors.forEach((error, index) => {
                    console.error(`Error ${index + 1}:`, error);
                });
            }
            
            showModal('errorModal');
        }
        
    } catch (error) {
        console.error('Network error:', error);
        showModal('errorModal');
    } finally {
        // Reset button
        submitButton.value = originalText;
        submitButton.disabled = false;
    }
});

