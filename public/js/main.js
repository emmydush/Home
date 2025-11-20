// Main JavaScript file for the Household Workers App

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission handling
    const forms = document.querySelectorAll('form:not(#login-form):not(#signup-form)');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Simple validation
            let isValid = true;
            form.querySelectorAll('.form-control').forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#dc3545';
                } else {
                    input.style.borderColor = '#ced4da';
                }
            });
            
            if (isValid) {
                // In a real app, you would send this data to your server
                console.log('Form submitted:', data);
                
                // Show success message with dialog box
                showSuccessDialog('Form submitted successfully!');
                form.reset();
            } else {
                showErrorDialog('Please fill in all required fields.');
            }
        });
    });

    // Mobile menu toggle (if needed)
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }

    // Socket.io connection for real-time features
    // Note: This would connect to your server-side Socket.io implementation
    /*
    const socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });
    */
});

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Show success dialog function
function showSuccessDialog(message) {
    // Create dialog if it doesn't exist
    let dialog = document.getElementById('success-dialog');
    if (!dialog) {
        dialog = createSuccessDialog();
    }
    
    // Set message and show dialog
    const content = dialog.querySelector('.dialog-content');
    if (content) {
        content.textContent = message;
    }
    
    dialog.classList.add('show');
    
    // Auto close after 5 seconds
    setTimeout(() => {
        dialog.classList.remove('show');
    }, 5000);
}

// Show error dialog function
function showErrorDialog(message) {
    // Create dialog if it doesn't exist
    let dialog = document.getElementById('error-dialog');
    if (!dialog) {
        dialog = createErrorDialog();
    }
    
    // Set message and show dialog
    const content = dialog.querySelector('.dialog-content');
    if (content) {
        content.textContent = message;
    }
    
    dialog.classList.add('show');
    
    // Auto close after 5 seconds
    setTimeout(() => {
        dialog.classList.remove('show');
    }, 5000);
}

// Create success dialog element
function createSuccessDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-box';
    dialog.id = 'success-dialog';
    dialog.innerHTML = `
        <button class="dialog-close">&times;</button>
        <div class="dialog-header">
            <span class="dialog-icon">✓</span>
            <h3 class="dialog-title">Success</h3>
        </div>
        <div class="dialog-content">
            Operation completed successfully!
        </div>
        <div class="dialog-footer">
            <button class="btn-dialog btn-dialog-primary">OK</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    const closeBtn = dialog.querySelector('.dialog-close');
    const okBtn = dialog.querySelector('.btn-dialog');
    
    const closeDialog = () => dialog.classList.remove('show');
    
    closeBtn.addEventListener('click', closeDialog);
    okBtn.addEventListener('click', closeDialog);
    
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            closeDialog();
        }
    });
    
    return dialog;
}

// Create error dialog element
function createErrorDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-box error';
    dialog.id = 'error-dialog';
    dialog.innerHTML = `
        <button class="dialog-close">&times;</button>
        <div class="dialog-header">
            <span class="dialog-icon">✗</span>
            <h3 class="dialog-title">Error</h3>
        </div>
        <div class="dialog-content">
            An error occurred. Please try again.
        </div>
        <div class="dialog-footer">
            <button class="btn-dialog btn-dialog-secondary">OK</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    const closeBtn = dialog.querySelector('.dialog-close');
    const okBtn = dialog.querySelector('.btn-dialog');
    
    const closeDialog = () => dialog.classList.remove('show');
    
    closeBtn.addEventListener('click', closeDialog);
    okBtn.addEventListener('click', closeDialog);
    
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            closeDialog();
        }
    });
    
    return dialog;
}

// Example of how to use the notification function
// showNotification('This is a success message', 'success');