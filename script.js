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
        const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showModal('successModal');
            e.target.reset();
        } else {
            showModal('errorModal');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showModal('errorModal');
    } finally {
        // Reset button
        submitButton.value = originalText;
        submitButton.disabled = false;
    }
});