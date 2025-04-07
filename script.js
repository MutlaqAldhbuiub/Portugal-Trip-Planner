// Update last updated date
document.addEventListener('DOMContentLoaded', function() {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = now.toLocaleDateString();
    }

    // Save checkbox state to localStorage
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // Load saved checkbox states
    checkboxes.forEach(checkbox => {
        const savedState = localStorage.getItem(checkbox.id);
        if (savedState === 'true') {
            checkbox.checked = true;
        }
        
        // Add event listener to save state when changed
        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
            updateProgressSummary();
        });
    });

    // Create progress summary at the top of the itinerary section
    const itinerarySection = document.getElementById('itinerary');
    if (itinerarySection) {
        const progressDiv = document.createElement('div');
        progressDiv.className = 'progress-summary';
        progressDiv.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="progress-text">
                    <span id="completed-count">0</span> of <span id="total-count">0</span> activities completed
                </div>
            </div>
            <button id="reset-progress" class="reset-button">Reset Progress</button>
        `;
        
        // Insert after the h2
        const h2 = itinerarySection.querySelector('h2');
        h2.parentNode.insertBefore(progressDiv, h2.nextSibling);
        
        // Add event listener to reset button
        const resetButton = document.getElementById('reset-progress');
        resetButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    localStorage.removeItem(checkbox.id);
                });
                updateProgressSummary();
            }
        });
        
        // Initialize progress summary
        updateProgressSummary();
    }
    
    // Add scroll to section functionality for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add day navigation
    addDayNavigation();
});

// Update progress summary
function updateProgressSummary() {
    const totalCount = document.getElementById('total-count');
    const completedCount = document.getElementById('completed-count');
    const progressFill = document.getElementById('progress-fill');
    
    if (totalCount && completedCount && progressFill) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const total = checkboxes.length;
        const completed = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
        
        totalCount.textContent = total;
        completedCount.textContent = completed;
        
        const percentage = (completed / total) * 100;
        progressFill.style.width = `${percentage}%`;
        
        // Change color based on progress
        if (percentage < 33) {
            progressFill.style.backgroundColor = '#f44336'; // Red
        } else if (percentage < 66) {
            progressFill.style.backgroundColor = '#ff9800'; // Orange
        } else {
            progressFill.style.backgroundColor = '#4caf50'; // Green
        }
    }
}

// Add day navigation for quick access to each day
function addDayNavigation() {
    const itinerarySection = document.getElementById('itinerary');
    if (!itinerarySection) return;
    
    const dayContainers = itinerarySection.querySelectorAll('.day-container');
    if (dayContainers.length < 2) return; // No need for navigation with only one day
    
    const navDiv = document.createElement('div');
    navDiv.className = 'day-navigation';
    navDiv.innerHTML = '<h3>Jump to Day:</h3><div class="day-links"></div>';
    
    const dayLinks = navDiv.querySelector('.day-links');
    
    dayContainers.forEach((container, index) => {
        const dayNumber = index + 1;
        const dayTitle = container.querySelector('h3').textContent.split(' - ')[1];
        const button = document.createElement('button');
        button.className = 'day-link';
        button.textContent = `Day ${dayNumber}`;
        button.setAttribute('title', dayTitle);
        
        button.addEventListener('click', function() {
            window.scrollTo({
                top: container.offsetTop - 100,
                behavior: 'smooth'
            });
        });
        
        dayLinks.appendChild(button);
    });
    
    // Insert day navigation after progress summary
    const progressSummary = itinerarySection.querySelector('.progress-summary');
    if (progressSummary) {
        progressSummary.parentNode.insertBefore(navDiv, progressSummary.nextSibling);
    } else {
        const h2 = itinerarySection.querySelector('h2');
        h2.parentNode.insertBefore(navDiv, h2.nextSibling);
    }
}

// Add CSS for the new elements
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .progress-summary {
            background-color: var(--card-bg-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .progress-container {
            flex: 1;
            min-width: 250px;
        }
        
        .progress-bar {
            height: 20px;
            background-color: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            background-color: #4caf50;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 0.9rem;
            color: var(--text-color);
        }
        
        .reset-button {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
            margin-left: 1rem;
        }
        
        .reset-button:hover {
            background-color: #d32f2f;
        }
        
        .day-navigation {
            background-color: var(--card-bg-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .day-navigation h3 {
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .day-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .day-link {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .day-link:hover {
            background-color: var(--secondary-color);
        }
        
        @media (max-width: 768px) {
            .progress-summary {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .reset-button {
                margin-left: 0;
                margin-top: 1rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}); 