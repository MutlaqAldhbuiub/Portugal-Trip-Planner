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
            
            // Add visual feedback when checking an item
            const label = this.nextElementSibling;
            if (this.checked) {
                label.style.animation = 'completedPulse 0.5s';
                setTimeout(() => {
                    label.style.animation = '';
                }, 500);
            }
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
    
    // Add filter functionality for sections with cards
    addCardFilters();
    
    // Add hover effects to cards
    addCardInteractivity();
    
    // Add back to top button
    addBackToTopButton();
    
    // Add weather tooltip info
    addWeatherInfo();
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
            progressFill.style.backgroundColor = '#FC8181'; // Red
        } else if (percentage < 66) {
            progressFill.style.backgroundColor = '#F6AD55'; // Orange
        } else {
            progressFill.style.backgroundColor = '#68D391'; // Green
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

// Add filter functionality for hotel, restaurant, and attraction sections
function addCardFilters() {
    const sections = [
        {id: 'hotels', filterOptions: ['All', 'Lisbon', 'Porto', 'Airbnb', 'Budget']},
        {id: 'restaurants', filterOptions: ['All', 'Lisbon', 'Porto', 'Sintra', 'Cascais', 'Sesimbra', 'Budget', 'Seafood']},
        {id: 'attractions', filterOptions: ['All', 'Lisbon', 'Porto', 'Sintra', 'Cascais', 'Sesimbra', 'Free']},
        {id: 'coffee', filterOptions: ['All', 'Lisbon', 'Porto', 'Sintra', 'Budget']},
        {id: 'views', filterOptions: ['All', 'Lisbon', 'Porto', 'Sintra', 'Cascais', 'Sesimbra', 'Free', 'Sunset']}
    ];
    
    sections.forEach(section => {
        const sectionElement = document.getElementById(section.id);
        if (!sectionElement) return;
        
        const h2 = sectionElement.querySelector('h2');
        const filterDiv = document.createElement('div');
        filterDiv.className = 'filter-container';
        filterDiv.innerHTML = `
            <div class="filter-label">Filter by:</div>
            <div class="filter-buttons"></div>
        `;
        
        const buttonContainer = filterDiv.querySelector('.filter-buttons');
        
        section.filterOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.textContent = option;
            button.dataset.filter = option.toLowerCase();
            
            if (option === 'All') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                buttonContainer.querySelectorAll('.filter-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Filter the cards
                filterCards(section.id, this.dataset.filter);
            });
            
            buttonContainer.appendChild(button);
        });
        
        h2.parentNode.insertBefore(filterDiv, h2.nextSibling);
    });
}

// Filter cards based on selected filter
function filterCards(sectionId, filter) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const cardClass = `${sectionId.slice(0, -1)}-card`;
    const cards = section.querySelectorAll(`.${cardClass}`);
    
    if (filter === 'all') {
        // Show all cards
        cards.forEach(card => {
            card.style.display = '';
        });
    } else {
        // Filter cards
        cards.forEach(card => {
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            const cardDesc = card.querySelector('p:not(.price)').textContent.toLowerCase();
            const price = card.querySelector('.price').textContent.toLowerCase();
            
            if (cardTitle.includes(filter) || 
                cardDesc.includes(filter) || 
                (filter === 'free' && price.includes('free')) ||
                (filter === 'budget' && (
                    price.includes('€5') || 
                    price.includes('€6') || 
                    price.includes('€7') || 
                    price.includes('€8') || 
                    price.includes('€9') ||
                    price.includes('€10') ||
                    price.includes('€15')
                )) ||
                (filter === 'sunset' && cardDesc.includes('sunset'))
            ) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Adjust the container layout
    const container = section.querySelector(`.${sectionId}-container`);
    if (container) {
        container.style.display = 'grid';
    }
}

// Add hover effects and interactivity to cards
function addCardInteractivity() {
    const cards = document.querySelectorAll('.hotel-card, .restaurant-card, .attraction-card, .coffee-card, .view-card');
    
    cards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// Add back to top button
function addBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.title = 'Back to Top';
    document.body.appendChild(backToTopButton);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Add weather information
function addWeatherInfo() {
    const weatherItems = document.querySelectorAll('.weather-item');
    
    weatherItems.forEach(item => {
        // Add icon based on weather description
        const weatherText = item.textContent.toLowerCase();
        let icon = '☀️'; // Default sunny
        
        if (weatherText.includes('cloudy') || weatherText.includes('partly')) {
            icon = '⛅';
        } else if (weatherText.includes('rain') || weatherText.includes('shower')) {
            icon = '🌧️';
        } else if (weatherText.includes('clear')) {
            icon = '✨';
        }
        
        item.innerHTML = `${icon} ${item.innerHTML}`;
    });
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
        
        /* Filter styles */
        .filter-container {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
            background-color: var(--card-bg-color);
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: var(--shadow);
        }
        
        .filter-label {
            font-weight: bold;
            margin-right: 1rem;
            color: var(--primary-color);
        }
        
        .filter-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .filter-button {
            background-color: #f0f0f0;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .filter-button.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .filter-button:hover:not(.active) {
            background-color: #e0e0e0;
        }
        
        /* Back to top button */
        .back-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .back-to-top.show {
            opacity: 1;
            visibility: visible;
        }
        
        .back-to-top:hover {
            background-color: var(--secondary-color);
            transform: translateY(-5px);
        }
        
        /* Animation for completing an item */
        @keyframes completedPulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .filter-container {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .filter-label {
                margin-bottom: 0.5rem;
            }
            
            .back-to-top {
                bottom: 1rem;
                right: 1rem;
                width: 40px;
                height: 40px;
            }
        }
    `;
    
    document.head.appendChild(style);
}); 